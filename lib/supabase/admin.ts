import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Privileged Supabase client using the SERVICE ROLE key.
 *
 * NEVER import this in a Client Component or expose it to the browser —
 * it bypasses Row Level Security and can manage all users. Only use it
 * inside Route Handlers (app/api/**) that have already verified the
 * caller is an authenticated ADMIN.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Check your .env file.'
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
