'use client';

import React, { createContext, useContext } from 'react';
import type { SessionUser } from '@/lib/types';

const UserContext = createContext<SessionUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

/**
 * Returns the current signed-in user. Only usable inside the (app) route
 * group, where the layout guarantees a session exists.
 */
export function useUser(): SessionUser {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error('useUser() must be used within the authenticated (app) layout.');
  }
  return user;
}

export function useIsAdmin(): boolean {
  return useUser().role === 'ADMIN';
}
