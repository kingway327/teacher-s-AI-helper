import type { VercelRequest, VercelResponse } from '../../types/vercel';
import { registerUser, buildAuthCookie } from '../../server/auth';
import { checkRateLimit } from '../../server/rateLimit';
import { parseBody, getRequestIp, validateEmail, validateRequiredText } from '../../server/apiUtils';
import { AuthRegistration } from '../../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const limiter = checkRateLimit(`register:${getRequestIp(req)}`, { windowMs: 60_000, max: 5 });
    if (!limiter.allowed) {
      res.status(429).json({ error: '请求过于频繁，请稍后重试。' });
      return;
    }

    const payload = parseBody<AuthRegistration>(req.body);
    if (!validateRequiredText(payload?.name, 50) || !validateEmail(payload?.email)) {
      res.status(400).json({ error: '请输入有效的姓名和邮箱。' });
      return;
    }
    if (!validateRequiredText(payload?.password, 72)) {
      res.status(400).json({ error: '密码长度需在 1-72 字符之间。' });
      return;
    }

    const { user, cookieValue } = registerUser(payload);
    res.setHeader('Set-Cookie', buildAuthCookie(cookieValue));
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Registration failed' });
  }
}
