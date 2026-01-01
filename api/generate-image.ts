import type { VercelRequest, VercelResponse } from '../types/vercel';
import { generateImage } from '../server/gemini';
import { requireUser, parseBody, validateRequiredText, getCookieHeader } from '../server/apiUtils';
import { ImageSize } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireUser(getCookieHeader(req));
    const payload = parseBody<{ prompt?: string; size?: ImageSize }>(req.body);
    if (!validateRequiredText(payload?.prompt, 1000) || !payload?.size) {
      res.status(400).json({ error: 'Missing prompt or size' });
      return;
    }
    const dataUrl = await generateImage(payload.prompt, payload.size);
    res.status(200).json({ dataUrl });
  } catch (error: any) {
    res.status(error?.status || 500).json({ error: error?.message || 'Image generation failed' });
  }
}
