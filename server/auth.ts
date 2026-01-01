import crypto from 'crypto';
import { AuthCredentials, AuthRegistration, AuthUser } from '../types';

type StoredUser = AuthUser & {
  passwordHash: string;
  passwordSalt: string;
};

const usersByEmail = new Map<string, StoredUser>();
const usersById = new Map<string, StoredUser>();
const sessions = new Map<string, string>();

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

const generateSessionId = () => crypto.randomBytes(24).toString('hex');

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) {
    return new Map<string, string>();
  }
  const entries = cookieHeader.split(';').map((cookie) => cookie.trim().split('='));
  return new Map(entries.map(([key, value]) => [key, decodeURIComponent(value)]));
};

export const registerUser = (payload: AuthRegistration): { user: AuthUser; sessionId: string } => {
  const email = payload.email.trim().toLowerCase();
  if (usersByEmail.has(email)) {
    throw new Error('该邮箱已注册，请直接登录。');
  }

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

  usersByEmail.set(email, user);
  usersById.set(user.id, user);

  const sessionId = generateSessionId();
  sessions.set(sessionId, user.id);

  return { user: sanitizeUser(user), sessionId };
};

export const loginUser = (payload: AuthCredentials): { user: AuthUser; sessionId: string } => {
  const email = payload.email.trim().toLowerCase();
  const user = usersByEmail.get(email);
  if (!user) {
    throw new Error('账号或密码错误，请重试。');
  }

  const candidateHash = hashPassword(payload.password, user.passwordSalt);
  const valid =
    candidateHash.length === user.passwordHash.length &&
    crypto.timingSafeEqual(Buffer.from(candidateHash), Buffer.from(user.passwordHash));
  if (!valid) {
    throw new Error('账号或密码错误，请重试。');
  }

  const sessionId = generateSessionId();
  sessions.set(sessionId, user.id);
  return { user: sanitizeUser(user), sessionId };
};

export const getUserFromRequest = (cookieHeader?: string): AuthUser | null => {
  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies.get('teacher-ai-helper-session');
  if (!sessionId) {
    return null;
  }
  const userId = sessions.get(sessionId);
  if (!userId) {
    return null;
  }
  const user = usersById.get(userId);
  return user ? sanitizeUser(user) : null;
};

export const clearSession = (cookieHeader?: string) => {
  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies.get('teacher-ai-helper-session');
  if (sessionId) {
    sessions.delete(sessionId);
  }
};

export const buildSessionCookie = (sessionId: string) => {
  const attributes = ['HttpOnly', 'Path=/', 'SameSite=Lax'];
  if (process.env.NODE_ENV === 'production') {
    attributes.push('Secure');
  }
  return `teacher-ai-helper-session=${encodeURIComponent(sessionId)}; ${attributes.join('; ')}`;
};

export const clearSessionCookie = () =>
  'teacher-ai-helper-session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0';
