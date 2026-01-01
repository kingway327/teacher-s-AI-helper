import { generateLessonPlan } from '../server/gemini';
import { LessonRequest } from '../types';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const parseBody = (body: unknown) => (typeof body === 'string' ? JSON.parse(body) : body);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = parseBody(req.body) as LessonRequest;
    const plan = await generateLessonPlan(payload);
    res.status(200).json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Lesson plan generation failed' });
  }
}
