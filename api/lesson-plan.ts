import type { VercelRequest, VercelResponse } from '../types/vercel';
import { generateLessonPlan } from '../server/gemini';
import { requireUser, parseBody, validateRequiredText, getCookieHeader } from '../server/apiUtils';
import { LessonRequest } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireUser(getCookieHeader(req));
    const payload = parseBody<LessonRequest>(req.body);
    if (
      !validateRequiredText(payload?.subject, 120) ||
      !validateRequiredText(payload?.topic, 120) ||
      !validateRequiredText(payload?.duration, 60) ||
      !validateRequiredText(payload?.objectives, 1000)
    ) {
      res.status(400).json({ error: '课程信息填写不完整或过长。' });
      return;
    }
    const plan = await generateLessonPlan(payload);
    res.status(200).json(plan);
  } catch (error: any) {
    res.status(error?.status || 500).json({ error: error?.message || 'Lesson plan generation failed' });
  }
}
