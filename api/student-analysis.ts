import { analyzeStudentReadiness } from '../server/gemini';
import { StudentAnalysisRequest } from '../types';
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
    const payload = parseBody(req.body) as StudentAnalysisRequest;
    const plan = await analyzeStudentReadiness(payload);
    res.status(200).json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Student analysis failed' });
  }
}
