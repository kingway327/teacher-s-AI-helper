import type { VercelRequest, VercelResponse } from '../../types/vercel';
import { clearAuthCookie } from '../../server/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Set-Cookie', clearAuthCookie());
  res.status(200).json({ ok: true });
}
