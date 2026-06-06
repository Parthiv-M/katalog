import { BOOKS_TABLE_NAME } from '../constants';
import { supabase } from '../supabase';
import { DashboardData, Book, LibrarySummary } from '@/types';

export async function getDashboardData(userId?: string): Promise<DashboardData> {
  // Fetch all books from Supabase
  let query = supabase.from(BOOKS_TABLE_NAME).select('*');

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data: books, error } = await query;

  if (error) {
    console.error('Error fetching books:', error);
    throw new Error('Failed to fetch dashboard data');
  }

  const booksData = (books as Book[]) || [];

  // Monthly reading velocity (books finished per month)
  const monthlyReading = calculateMonthlyReading(booksData);

  // Pages read per month
  const monthlyPages = calculateMonthlyPages(booksData);

  // Reading time scatter plot data
  const readingTimeData = calculateReadingTime(booksData);

  // Shelf composition
  const shelfComposition = calculateShelfComposition(booksData);

  // Top 5 authors
  const topAuthors = calculateTopAuthors(booksData);

  // Rating distribution (how many books got each star, 1-5)
  const ratingDistribution = calculateRatingDistribution(booksData);

  const readBooks = booksData.filter(b => b.shelf === 'read');
  const tbrBooks = booksData.filter(b => b.shelf === 'to_read');
  const currentBooks = booksData.filter(b => b.shelf === 'currently_reading');

  // Sort by date_read descending to get the last one
  const lastRead = readBooks.sort((a, b) => {
      const dateA = new Date(a.date_read || 0).getTime();
      const dateB = new Date(b.date_read || 0).getTime();
      return dateB - dateA;
  })[0] || null;

  const summary: LibrarySummary = {
      totalBooksRead: readBooks.length,
      totalPagesRead: readBooks.reduce((sum, book) => sum + (book.num_pages || 0), 0),
      tbrCount: tbrBooks.length,
      currentlyReading: currentBooks[0] || null, // Just take the first one
      lastRead: lastRead
  };

  return {
    monthlyReading,
    monthlyPages,
    readingTimeData,
    shelfComposition,
    topAuthors,
    ratingDistribution,
    summary
  };
}

// Helper functions with actual implementation logic
function calculateMonthlyReading(books: Book[]) {
  // Map to store counts: key "YYYY-MM", value: count
  const monthMap = new Map<string, number>();

  const readBooks = books.filter((book) => book.date_read);

  for (const book of readBooks) {
    try {
      const readDate = new Date(book.date_read!);
      const key = readDate.toISOString().slice(0, 7);

      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    } catch (e) {
      console.warn('Invalid date_read format:', book.date_read);
    }
  }

  // Sort chronologically first, then keep the 8 most recent months
  const sortedData = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8);

  return sortedData.map(([key, count]) => {
    const date = new Date(`${key}-01T12:00:00Z`);
    return {
      month: date.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      }),
      count: count,
    };
  });
}

function calculateMonthlyPages(books: Book[]) {
  // Map to store page counts: key "YYYY-MM", value: totalPages
  const pageMap = new Map<string, number>();

  const readBooks = books.filter(
    (book) => book.date_read && book.num_pages && book.num_pages > 0
  );

  for (const book of readBooks) {
    try {
      const readDate = new Date(book.date_read!);
      const key = readDate.toISOString().slice(0, 7);
      const pages = book.num_pages!;

      pageMap.set(key, (pageMap.get(key) || 0) + pages);
    } catch (e) {
      console.warn('Invalid date_read or num_pages format:', book.date_read);
    }
  }

  // Sort by key (YYYY-MM) first, then keep the 6 most recent months
  const sortedData = Array.from(pageMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);

  const lineData = sortedData.map(([key, pages]) => {
    const date = new Date(`${key}-01T12:00:00Z`);
    return {
      x: date,
      y: pages,
    };
  });

  return [
    {
      id: 'data',
      data: lineData
    },
  ];
}

function calculateReadingTime(books: Book[]) {
  const plotData = [];

  const validBooks = books.filter(
    (book) =>
      book.date_added &&
      book.date_read
  );

  for (const book of validBooks) {
    try {
      const start = new Date(book.date_added!);
      const read = new Date(book.date_read!);

      // Set to midnight to just count days
      start.setHours(0, 0, 0, 0);
      read.setHours(0, 0, 0, 0);

      const diffTime = read.getTime() - start.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // +1 to be inclusive (e.g., start/finish same day is 1 day)
      const daysToRead = diffDays + 1;

      if (daysToRead > 0) {
        plotData.push({
          x: book.num_pages,
          y: daysToRead,
          title: book.title,
        });
      }

      plotData.sort((a, b) => b.y - a.y)

    } catch (e) {
      console.warn('Invalid date_started or date_read format');
    }
  }

  return [
    {
      id: 'Books',
      data: plotData,
    },
  ];
}

function calculateShelfComposition(books: Book[]) {
  const shelfMap = new Map<string, number>();
  shelfMap.set('read', 0);
  shelfMap.set('to-read', 0);
  shelfMap.set('currently-reading', 0);
  let other = 0;
  const otherName = 'Other'; // In case you want to group multiple other shelves

  for (const book of books) {
    if (book.shelf === 'read') {
      shelfMap.set('read', shelfMap.get('read')! + 1);
    } else if (book.shelf === 'to_read') {
      shelfMap.set('to-read', shelfMap.get('to-read')! + 1);
    } else if (book.shelf === 'currently_reading') {
      shelfMap.set('currently-reading', shelfMap.get('currently-reading')! + 1);
    } else if (book.shelf) {
      other++;
    }
  }

  const childrenData = [
    { name: 'Read', loc: shelfMap.get('read')! },
    { name: 'To Be Read', loc: shelfMap.get('to-read')! },
    { name: 'Currently Reading', loc: shelfMap.get('currently-reading')! },
  ];

  if (other > 0) {
    childrenData.push({ name: otherName, loc: other });
  }

  const validChildren = childrenData.filter((c) => c.loc > 0);
  let maxLoc = 0;
  let maxIndex = -1;
  let totalLoc = 0;

  validChildren.forEach((child, index) => {
    totalLoc += child.loc;
    if (child.loc > maxLoc) {
      maxLoc = child.loc;
      maxIndex = index;
    }
  });

  if (maxIndex === -1) {
    // No books at all, return empty state
    return { name: 'library', children: [] };
  }

  const sumOfOthers = totalLoc - maxLoc;

  const scaledChildren = validChildren.map((child, index) => {
    let scaledLoc = child.loc; // Default to original value

    if (index === maxIndex && maxLoc > sumOfOthers) {
      scaledLoc = sumOfOthers; // Cap its value at the sum of all others
    }

    return {
      ...child,
      scaledLoc: scaledLoc,
    };
  });

  return {
    name: 'library',
    children: scaledChildren,
  };
}

function calculateTopAuthors(books: Book[]) {
  const authorMap = new Map<string, number>();

  const validBooks = books.filter((book) => book.author);

  for (const book of validBooks) {
    const author = book.author!;
    authorMap.set(author, (authorMap.get(author) || 0) + 1);
  }

  // Convert map to array
  const authorCounts = Array.from(authorMap.entries());

  // Sort by count descending
  authorCounts.sort((a, b) => b[1] - a[1]);

  // Take top 5 and map to final format
  return authorCounts.slice(0, 5).map(([author, count]) => ({
    author,
    count,
  }));
}

function calculateRatingDistribution(books: Book[]) {
  // Count books per user rating (1-5). Always emit all 5 buckets (zero-filled)
  // so the bar chart axis stays stable.
  const counts = new Map<number, number>();
  for (let i = 1; i <= 5; i++) {
    counts.set(i, 0);
  }

  const ratedBooks = books.filter((book) => book.rating != null);

  for (const book of ratedBooks) {
    const userRating = book.rating!;
    if (userRating < 1 || userRating > 5) {
      continue;
    }
    counts.set(userRating, counts.get(userRating)! + 1);
  }

  return Array.from(counts.entries()).map(([rating, count]) => ({
    rating: String(rating), // '1', '2', '3', '4', '5'
    count,
  }));
}