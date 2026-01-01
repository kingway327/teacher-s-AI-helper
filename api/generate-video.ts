import type { VercelRequest, VercelResponse } from '../types/vercel';
import { generateVideo } from '../server/gemini';
import { requireUser, parseBody, validateRequiredText, getCookieHeader } from '../server/apiUtils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireUser(getCookieHeader(req));
    const payload = parseBody<{ prompt?: string }>(req.body);
    if (!validateRequiredText(payload?.prompt, 1000)) {
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }

    const { buffer, contentType } = await generateVideo(payload.prompt);
    res.setHeader('Content-Type', contentType);
    res.status(200).send(Buffer.from(buffer));
  } catch (error: any) {
    res.status(error?.status || 500).json({ error: error?.message || 'Video generation failed' });
  }
}
