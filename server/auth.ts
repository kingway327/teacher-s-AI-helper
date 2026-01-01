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

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 10;
const rateLimitStore = new Map<string, { attempts: number; windowStart: number; blockedUntil?: number }>();

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
  const entries: [string, string][] = [];
  for (const cookie of cookieHeader.split(';')) {
    const trimmed = cookie.trim();
    if (!trimmed) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1);
    if (!key) continue;
    entries.push([key, decodeURIComponent(value)]);
  }
  return new Map(entries);
};

const base64UrlEncode = (value: string) =>
  Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const base64UrlDecode = (value: string) =>
  Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');

const checkRateLimit = (identifier: string): void => {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Check if blocked
  if (record?.blockedUntil && now < record.blockedUntil) {
    const remainingMs = record.blockedUntil - now;
    const remainingMin = Math.ceil(remainingMs / 60000);
    throw new Error(`尝试次数过多，请在 ${remainingMin} 分钟后重试`);
  }

  // Reset window if expired
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(identifier, { attempts: 1, windowStart: now });
    return;
  }

  // Increment attempts
  record.attempts++;
  if (record.attempts > RATE_LIMIT_MAX_ATTEMPTS) {
    record.blockedUntil = now + RATE_LIMIT_WINDOW_MS;
    throw new Error(`尝试次数过多，请在 15 分钟后重试`);
  }
};

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
  // Validate input
  const name = payload.name?.trim() || '';
  const email = payload.email?.trim().toLowerCase() || '';
  const password = payload.password || '';

  if (!name || name.length < 1) {
    throw new Error('姓名不能为空');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('请输入有效的电子邮件地址');
  }
  if (!password || password.length < 6) {
    throw new Error('密码至少需要6个字符');
  }

  // Rate limiting by email
  checkRateLimit(`register:${email}`);

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const user: StoredUser = {
    id: generateId(),
    name,
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
  // Validate input
  const email = payload.email?.trim().toLowerCase() || '';
  const password = payload.password || '';

  if (!email) {
    throw new Error('电子邮件不能为空');
  }
  if (!password) {
    throw new Error('密码不能为空');
  }

  // Rate limiting by email
  checkRateLimit(`login:${email}`);

  const stored = parseAuthCookie(cookieHeader);
  if (!stored) {
    throw new Error('账号或密码错误，请重试。');
  }
  if (stored.email !== email) {
    throw new Error('账号或密码错误，请重试。');
  }

  const candidateHash = hashPassword(password, stored.passwordSalt);
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
