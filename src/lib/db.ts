import type { UserProfile } from '@/types/user';

export type { UserProfile };

/**
 * Almacén en memoria compatible con entornos serverless (Vercel).
 * Los datos persisten mientras la instancia del servidor esté activa.
 * Para producción real, sustituir por una base de datos (Postgres, Redis, etc.).
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
