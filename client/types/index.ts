export interface Book {
  id?: string;
  title?: string | null;
  book_url?: string | null;
  author?: string | null;
  isbn?: string | null;
  rating?: number | null;
  avg_rating?: number | null;
  num_pages?: number | null;
  date_published?: string | null;
  date_added?: string | null;
  date_started?: string | null;
  date_read?: string | null;
  review?: string | null;
  shelf?: string | null;
  user_id?: string | null;
}

export interface MonthlyReading {
  month: string;
  count: number;
}

export interface MonthlyPages {
  month: string;
  pages: number;
}

export interface ReadingTime {
  pages: number;
  daysToRead: number;
  title: string;
}

export interface ShelfComposition {
  shelf: string;
  count: number;
  percentage: number;
}

export interface AuthorCount {
  author: string;
  count: number;
}

export interface RatingCell {
  userRating: number;
  communityRating: string;
  count: number;
}

export interface DashboardData {
  monthlyReading: MonthlyReading[];
  monthlyPages: MonthlyPages[];
  readingTimeData: ReadingTime[];
  shelfComposition: ShelfComposition[];
  topAuthors: AuthorCount[];
  ratingHeatmap: RatingCell[];
}