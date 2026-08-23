import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Role, SessionUser } from '@/lib/types';

/**
 * Resolves the currently authenticated user from the Supabase session
 * cookie and their role from app_metadata (set only by the server via
 * the service-role client — regular users cannot edit it themselves).
 *
 * This is called independently inside every API route handler as the
 * real authorization boundary. middleware.ts also redirects unauthenticated
 * page requests for UX, but route handlers never trust that alone.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const role = (user.app_metadata?.role as Role) || 'SELLER';

  return {
    id: user.id,
    email: user.email ?? '',
    name: (user.user_metadata?.name as string) ?? null,
    role,
  };
}

export function unauthorized() {
  return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json(
    { error: 'You do not have permission to perform this action.' },
    { status: 403 }
  );
}

/**
 * Convenience guard for route handlers. Returns the user if allowed,
 * or a NextResponse to return immediately if not.
 */
export async function requireUser(): Promise<SessionUser | NextResponse> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return user;
}

export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== 'ADMIN') return forbidden();
  return user;
}

export function isSessionUser(value: SessionUser | NextResponse): value is SessionUser {
  return !(value instanceof NextResponse);
}
