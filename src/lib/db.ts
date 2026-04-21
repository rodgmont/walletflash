import fs from 'fs';
import path from 'path';
import type { UserProfile } from '@/types/user';

export type { UserProfile };

const dbPath = path.join(process.cwd(), 'data.json');

const writeDb = (data: Record<string, UserProfile>) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const readDb = (): Record<string, UserProfile> => {
  if (!fs.existsSync(dbPath)) {
    writeDb({});
    return {};
  }
  const content = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(content);
};

export const getUser = (username: string): UserProfile | null => {
  const db = readDb();
  return db[username] || null;
};

export const saveUser = (user: UserProfile) => {
  const db = readDb();
  db[user.username] = user;
  writeDb(db);
};

export const getAllUsers = (): UserProfile[] => {
  const db = readDb();
  return Object.values(db);
};
