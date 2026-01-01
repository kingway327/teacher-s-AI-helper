import type { VercelRequest, VercelResponse } from '../types/vercel';
import { analyzeStudentReadiness } from '../server/gemini';
import { requireUser, parseBody, validateRequiredText, getCookieHeader } from '../server/apiUtils';
import { StudentAnalysisRequest } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireUser(getCookieHeader(req));
    const payload = parseBody<StudentAnalysisRequest>(req.body);
    if (!validateRequiredText(payload?.upcomingTopic, 200)) {
      res.status(400).json({ error: '分析主题不能为空或过长。' });
      return;
    }
    const plan = await analyzeStudentReadiness(payload);
    res.status(200).json(plan);
  } catch (error: any) {
    res.status(error?.status || 500).json({ error: error?.message || 'Student analysis failed' });
  }
}
