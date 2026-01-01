import { registerUser, buildSessionCookie } from '../../server/auth';
import { AuthRegistration } from '../../types';

const parseBody = (body: unknown) => (typeof body === 'string' ? JSON.parse(body) : body);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = parseBody(req.body) as AuthRegistration;
    const { user, sessionId } = registerUser(payload);
    res.setHeader('Set-Cookie', buildSessionCookie(sessionId));
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Registration failed' });
  }
}
