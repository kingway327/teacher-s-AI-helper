import { getUserFromRequest } from '../../server/auth';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = getUserFromRequest(req.headers?.cookie);
  if (!user) {
    res.status(200).json(null);
    return;
  }
  res.status(200).json(user);
}
