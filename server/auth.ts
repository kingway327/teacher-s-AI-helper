import crypto from 'crypto';
import { AuthCredentials, AuthRegistration, AuthUser } from '../types';

type StoredUser = AuthUser & {
  passwordHash: string;
  passwordSalt: string;
};

// NOTE: In-memory stores for users and sessions.
// This implementation is intended for prototyping / development only.
// All user accounts and sessions will be lost on server restart or redeployment.
// For production use, replace these Maps with a persistent data store
// (e.g. a database for users and Redis or similar for sessions).
const AUTH_COOKIE = 'teacher-ai-helper-auth';
const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-auth-secret';

const hashPassword = (password: string, salt: string) =>
  crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');

const generateId = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `user_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
};

const sanitizeUser = (user: StoredUser): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) {
    return new Map<string, string>();
  }
  const entries = cookieHeader.split(';').map((cookie) => cookie.trim().split('='));
  return new Map(entries.map(([key, value]) => [key, decodeURIComponent(value)]));
};

const base64UrlEncode = (value: string) =>
  Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const base64UrlDecode = (value: string) =>
  Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');

const signPayload = (payload: string) =>
  base64UrlEncode(crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex'));

const serializeAuthCookie = (user: StoredUser) => {
  const payload = JSON.stringify(user);
  const encoded = base64UrlEncode(payload);
  const signature = signPayload(encoded);
  return `${encoded}.${signature}`;
};

const parseAuthCookie = (cookieHeader?: string): StoredUser | null => {
  const cookies = parseCookies(cookieHeader);
  const value = cookies.get(AUTH_COOKIE);
  if (!value) {
    return null;
  }
  const [encoded, signature] = value.split('.');
  if (!encoded || !signature) {
    return null;
  }
  const expectedSignature = signPayload(encoded);
  if (signature !== expectedSignature) {
    return null;
  }
  try {
    return JSON.parse(base64UrlDecode(encoded)) as StoredUser;
  } catch {
    return null;
  }
};

export const registerUser = (payload: AuthRegistration): { user: AuthUser; cookieValue: string } => {
  const email = payload.email.trim().toLowerCase();

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(payload.password, salt);
  const user: StoredUser = {
    id: generateId(),
    name: payload.name.trim(),
    email,
    createdAt: new Date().toISOString(),
    passwordHash,
    passwordSalt: salt,
  };

  return { user: sanitizeUser(user), cookieValue: serializeAuthCookie(user) };
};

export const loginUser = (
  payload: AuthCredentials,
  cookieHeader?: string
): { user: AuthUser; cookieValue: string } => {
  const stored = parseAuthCookie(cookieHeader);
  if (!stored) {
    throw new Error('账号或密码错误，请重试。');
  }
  const email = payload.email.trim().toLowerCase();
  if (stored.email !== email) {
    throw new Error('账号或密码错误，请重试。');
  }

  const candidateHash = hashPassword(payload.password, stored.passwordSalt);
  const valid =
    candidateHash.length === stored.passwordHash.length &&
    crypto.timingSafeEqual(Buffer.from(candidateHash), Buffer.from(stored.passwordHash));
  if (!valid) {
    throw new Error('账号或密码错误，请重试。');
  }

  return { user: sanitizeUser(stored), cookieValue: serializeAuthCookie(stored) };
};

export const getUserFromRequest = (cookieHeader?: string): AuthUser | null => {
  const user = parseAuthCookie(cookieHeader);
  return user ? sanitizeUser(user) : null;
};

export const clearSession = () => {};

export const buildAuthCookie = (cookieValue: string) => {
  const attributes = ['HttpOnly', 'Path=/', 'SameSite=Lax'];
  if (process.env.NODE_ENV === 'production') {
    attributes.push('Secure');
  }
  return `${AUTH_COOKIE}=${encodeURIComponent(cookieValue)}; ${attributes.join('; ')}`;
};

export const clearAuthCookie = () =>
  `${AUTH_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
