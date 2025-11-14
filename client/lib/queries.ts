import { supabase } from './supabase';
import { DashboardData, Book } from '@/types';

export async function getDashboardData(userId?: string): Promise<DashboardData> {
  // Fetch all books from Supabase
  let query = supabase.from('books').select('*');

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data: books, error } = await query;

  if (error) {
    console.error('Error fetching books:', error);
    throw new Error('Failed to fetch dashboard data');
  }

  const booksData = books || [];

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

  // Rating heatmap
  const ratingHeatmap = calculateRatingHeatmap(booksData);

  return {
    monthlyReading,
    monthlyPages,
    readingTimeData,
    shelfComposition,
    topAuthors,
    ratingHeatmap,
  };
}

// Helper functions with actual implementation logic
function calculateMonthlyReading(books: Book[]) {
  // TODO: Implement actual logic based on date_read field
  // Group books by month where date_read is not null
  // This is placeholder data - replace with actual calculation
  return [
    { month: 'April 2025', count: 3 },
    { month: 'May 2025', count: 4 },
    { month: 'June 2025', count: 2 },
    { month: 'July 2025', count: 5 },
    { month: 'August 2025', count: 3 },
    { month: 'September 2025', count: 4 },
    { month: 'October 2025', count: 4 },
    { month: 'November 2025', count: 2 },
  ];
}

function calculateMonthlyPages(books: Book[]) {
  // TODO: Implement actual logic based on date_read and num_pages
  // Sum pages by month for books that have been read
  return [
    {
      "id": "data",
      "data": [
        { "x": "Apr", "y": 1200 },
        { "x": "May", "y": 900 },
        { "x": "Jun", "y": 1234 },
        { "x": "Jul", "y": 1145 },
        { "x": "Aug", "y": 1158 },
        { "x": "Sep", "y": 947 },
        { "x": "Oct", "y": 1201 },
        { "x": "Nov", "y": 369 }
      ]
    }
  ]

}

function calculateReadingTime(books: Book[]) {
  // TODO: Calculate actual days between date_started and date_read
  // Filter for books with both dates and num_pages
  return [
    {
      "id": "Books",
      "data": [
        { "x": 450, "y": 30, "title": "Book 4" },
        { "x": 310, "y": 25, "title": "Book 5" },
        { "x": 300, "y": 12, "title": "Book 7" },
        { "x": 350, "y": 7, "title": "Book 2" },
        { "x": 250, "y": 6, "title": "Book 6" },
        { "x": 200, "y": 5, "title": "Book 1" },
        { "x": 150, "y": 1.5, "title": "Book 3" }
      ]
    }
  ];
}

function calculateShelfComposition(books: Book[]) {
  // TODO: Group by shelf field and calculate percentages
  const total = books.length || 1;
  const composition = {
    'read': books.filter(b => b.shelf === 'read').length,
    'to-read': books.filter(b => b.shelf === 'to-read').length,
    'currently-reading': books.filter(b => b.shelf === 'currently-reading').length,
  };

  return {
    "name": "library",
    "children": [
      {
        "name": "Read",
        "loc": 117,
      },
      {
        "name": "To Be Read",
        "loc": 89,
      },
      {
        "name": "Currently Reading",
        "loc": 2
      }
    ]
  }

}

function calculateTopAuthors(books: Book[]) {
  // TODO: Group by author, count books, sort by count, take top 5
  // Use actual author field from books
  return [
    { author: 'Author name 1', count: 10 },
    { author: 'Author name 2', count: 3 },
    { author: 'Author name 3', count: 4 },
    { author: 'Author name 4', count: 8 },
    { author: 'Author name 5', count: 5 },
  ];
}

function calculateRatingHeatmap(books: Book[]) {
  // TODO: Group by rating (user) and avg_rating (community) combinations
  // Create buckets for community ratings (0-1, 1-2, etc.)
  return [
    {
      "id": "1",
      "data": [
        { "x": "0-1", "y": 10 },
        { "x": "1-2", "y": 1 },
        { "x": "2-3", "y": 15 },
        { "x": "3-4", "y": 8 },
        { "x": "4-5", "y": 15 }
      ]
    },
    {
      "id": "2",
      "data": [
        { "x": "0-1", "y": 6 },
        { "x": "1-2", "y": 9 },
        { "x": "2-3", "y": 2 },
        { "x": "3-4", "y": 2 },
        { "x": "4-5", "y": 15 }
      ]
    },
    {
      "id": "3",
      "data": [
        { "x": "0-1", "y": 1 },
        { "x": "1-2", "y": 1 },
        { "x": "2-3", "y": 13 },
        { "x": "3-4", "y": 16 },
        { "x": "4-5", "y": 8 }
      ]
    },
    {
      "id": "4",
      "data": [
        { "x": "0-1", "y": 13 },
        { "x": "1-2", "y": 0 },
        { "x": "2-3", "y": 1 },
        { "x": "3-4", "y": 10 },
        { "x": "4-5", "y": 4 }
      ]
    },
    {
      "id": "5",
      "data": [
        { "x": "0-1", "y": 1 },
        { "x": "1-2", "y": 5 },
        { "x": "2-3", "y": 8 },
        { "x": "3-4", "y": 18 },
        { "x": "4-5", "y": 2 }
      ]
    }
  ];
}