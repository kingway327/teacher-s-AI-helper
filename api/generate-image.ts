import { generateImage } from '../server/gemini';
import { ImageSize } from '../types';

const parseBody = (body: unknown) => (typeof body === 'string' ? JSON.parse(body) : body);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = parseBody(req.body) as { prompt?: string; size?: ImageSize };
    if (!payload?.prompt || !payload?.size) {
      res.status(400).json({ error: 'Missing prompt or size' });
      return;
    }
    const dataUrl = await generateImage(payload.prompt, payload.size);
    res.status(200).json({ dataUrl });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Image generation failed' });
  }
}
