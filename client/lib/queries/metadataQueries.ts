import { supabase } from "../supabase";

const METADATA_TABLE = process.env.ENVIRONMENT === 'production' ? 'metadata' : 'metadata_dev';

export async function getLastUpdated(): Promise<string | null> {
  const { data, error } = await supabase
    .from(METADATA_TABLE)
    .select('value')
    .eq('key', 'last_refreshed')
    .single();

  if (error) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any)?.value || null;
}

export async function getNextScrape(): Promise<string | null> {
  const { data, error } = await supabase
    .from(METADATA_TABLE)
    .select('value')
    .eq('key', 'next_scrape')
    .single();

  if (error) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any)?.value || null;
}