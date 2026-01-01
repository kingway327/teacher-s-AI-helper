import { generateResourceSupport } from '../server/gemini';
import { ResourceRequest } from '../types';
import { getUserFromRequest } from '../server/auth';

const parseBody = (body: unknown) => (typeof body === 'string' ? JSON.parse(body) : body);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = getUserFromRequest(req.headers?.cookie);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const payload = parseBody(req.body) as ResourceRequest;
    const plan = await generateResourceSupport(payload);
    res.status(200).json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Resource support generation failed' });
  }
}
