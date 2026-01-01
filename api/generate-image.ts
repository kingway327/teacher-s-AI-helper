import { generateImage } from '../server/gemini';
import { ImageSize } from '../types';
import { getUserFromRequest } from '../server/auth';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const parseBody = (body: unknown) => (typeof body === 'string' ? JSON.parse(body) : body);

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const payload = parseBody(req.body) as { prompt?: string; size?: ImageSize };
    if (!payload?.prompt || !payload?.size) {
      res.status(400).json({ error: 'Missing prompt or size' });
      return;
    }

    // Validate prompt length
    if (payload.prompt.length > 2000) {
      res.status(400).json({ error: 'Prompt too long (max 2000 characters)' });
      return;
    }
    const dataUrl = await generateImage(payload.prompt, payload.size);
    res.status(200).json({ dataUrl });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Image generation failed' });
  }
}
