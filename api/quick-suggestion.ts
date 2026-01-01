import type { VercelRequest, VercelResponse } from '../types/vercel';
import { getQuickSuggestion } from '../server/gemini';
import { requireUser, parseBody, validateRequiredText, getCookieHeader } from '../server/apiUtils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireUser(getCookieHeader(req));
    const payload = parseBody<{ query?: string; context?: string }>(req.body);
    if (!validateRequiredText(payload?.query, 300) || !validateRequiredText(payload?.context, 4000)) {
      res.status(400).json({ error: 'Missing query or context' });
      return;
    }
    const text = await getQuickSuggestion(payload.query, payload.context);
    res.status(200).json({ text });
  } catch (error: any) {
    res.status(error?.status || 500).json({ error: error?.message || 'Quick suggestion failed' });
  }
}
