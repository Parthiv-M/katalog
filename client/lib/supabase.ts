import { createClient } from '@supabase/supabase-js';
import { Book } from '@/types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient<{ books: Book }>(
  supabaseUrl,
  supabaseAnonKey
);