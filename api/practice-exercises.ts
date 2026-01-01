import type { VercelRequest, VercelResponse } from '../types/vercel';
import { generatePracticeExercises } from '../server/gemini';
import { requireUser, parseBody, validateRequiredText, getCookieHeader } from '../server/apiUtils';
import { PracticeRequest } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireUser(getCookieHeader(req));
    const payload = parseBody<PracticeRequest>(req.body);
    if (!validateRequiredText(payload?.knowledgePoint, 200)) {
      res.status(400).json({ error: '知识点不能为空或过长。' });
      return;
    }
    const plan = await generatePracticeExercises(payload);
    res.status(200).json(plan);
  } catch (error: any) {
    res.status(error?.status || 500).json({ error: error?.message || 'Practice generation failed' });
  }
}
