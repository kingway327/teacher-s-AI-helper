import { registerUser, buildAuthCookie } from '../../server/auth';
import { AuthRegistration } from '../../types';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const parseBody = (body: unknown) => (typeof body === 'string' ? JSON.parse(body) : body);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = parseBody(req.body) as AuthRegistration;
    const { user, cookieValue } = registerUser(payload);
    res.setHeader('Set-Cookie', buildAuthCookie(cookieValue));
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Registration failed' });
  }
}
