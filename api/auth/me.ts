import type { VercelRequest, VercelResponse } from '../../types/vercel';
import { getUserFromRequest } from '../../server/auth';
import { getCookieHeader } from '../../server/apiUtils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = getUserFromRequest(getCookieHeader(req));
  if (!user) {
    res.status(200).json(null);
    return;
  }
  res.status(200).json(user);
}
