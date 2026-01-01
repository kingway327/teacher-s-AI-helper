import { VercelRequest, VercelResponse } from '@vercel/node';
import { getQuickSuggestion } from '../server/gemini';

const parseBody = (body: unknown) => (typeof body === 'string' ? JSON.parse(body) : body);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = parseBody(req.body) as { query?: string; context?: string };
    if (!payload?.query || !payload?.context) {
      res.status(400).json({ error: 'Missing query or context' });
      return;
    }
    const text = await getQuickSuggestion(payload.query, payload.context);
    res.status(200).json({ text });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Quick suggestion failed' });
  }
}
