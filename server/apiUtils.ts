import type { VercelRequest } from '../types/vercel';
import { getUserFromRequest } from './auth';

export const parseBody = <T>(body: unknown): T =>
  (typeof body === 'string' ? JSON.parse(body) : body) as T;

export const getRequestIp = (req: VercelRequest) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
};

export const getCookieHeader = (req: VercelRequest) => {
  const cookieHeader = req.headers.cookie;
  if (Array.isArray(cookieHeader)) {
    return cookieHeader.join('; ');
  }
  return cookieHeader;
};

export const requireUser = (cookieHeader?: string) => {
  const user = getUserFromRequest(cookieHeader);
  if (!user) {
    const error = new Error('Unauthorized');
    (error as Error & { status?: number }).status = 401;
    throw error;
  }
  return user;
};

export const validateEmail = (email?: string) =>
  Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

export const validateRequiredText = (value: string | undefined, maxLength: number) =>
  Boolean(value && value.trim().length > 0 && value.trim().length <= maxLength);
