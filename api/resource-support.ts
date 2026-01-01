import type { VercelRequest, VercelResponse } from '../types/vercel';
import { generateResourceSupport } from '../server/gemini';
import { requireUser, parseBody, validateRequiredText, getCookieHeader } from '../server/apiUtils';
import { ResourceRequest } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireUser(getCookieHeader(req));
    const payload = parseBody<ResourceRequest>(req.body);
    if (!validateRequiredText(payload?.topic, 120) || !validateRequiredText(payload?.keyPoints, 1000)) {
      res.status(400).json({ error: '资源主题或重点过长/为空。' });
      return;
    }
    const plan = await generateResourceSupport(payload);
    res.status(200).json(plan);
  } catch (error: any) {
    res.status(error?.status || 500).json({ error: error?.message || 'Resource support generation failed' });
  }
}
