import { AuthUser } from '../types';

interface AuthDatabaseUser extends AuthUser {
  password: string;
}

const USERS_KEY = 'teacher-ai-helper-users';
const SESSION_KEY = 'teacher-ai-helper-session';

const readJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getUsers = (): AuthDatabaseUser[] => readJson<AuthDatabaseUser[]>(USERS_KEY, []);

export const saveUsers = (users: AuthDatabaseUser[]) => {
  writeJson(USERS_KEY, users);
};

export const getSessionUserId = (): string | null =>
  readJson<string | null>(SESSION_KEY, null);

export const setSessionUserId = (userId: string) => {
  writeJson(SESSION_KEY, userId);
};

export const clearSession = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(SESSION_KEY);
};

export type { AuthDatabaseUser };
