import type { UserProfile } from '@/types/user';

export type { UserProfile };

/**
 * In-memory store compatible with serverless environments (Vercel).
 * Data persists while the server instance is active.
 * For production, replace with a real database (Postgres, Redis, etc.).
 */
const store = new Map<string, UserProfile>();

export const getUser = (username: string): UserProfile | null => {
  return store.get(username) ?? null;
};

export const saveUser = (user: UserProfile): void => {
  store.set(user.username, user);
};

export const getAllUsers = (): UserProfile[] => {
  return Array.from(store.values());
};
