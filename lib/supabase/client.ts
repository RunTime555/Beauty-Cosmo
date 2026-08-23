import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in the browser (Client Components).
 * Reads the two public env vars — these are safe to expose to the client.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your .env file.'
    );
  }

  return createBrowserClient(url, anonKey);
}
