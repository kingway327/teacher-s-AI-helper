import { analyzeStudentReadiness } from '../server/gemini';
import { StudentAnalysisRequest } from '../types';

const parseBody = (body: unknown) => (typeof body === 'string' ? JSON.parse(body) : body);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
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
