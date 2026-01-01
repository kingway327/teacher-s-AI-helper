import type { VercelRequest, VercelResponse } from '../../types/vercel';
import { loginUser, buildAuthCookie } from '../../server/auth';
import { checkRateLimit } from '../../server/rateLimit';
import { parseBody, getRequestIp, validateEmail, validateRequiredText, getCookieHeader } from '../../server/apiUtils';
import { AuthCredentials } from '../../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const limiter = checkRateLimit(`login:${getRequestIp(req)}`, { windowMs: 60_000, max: 10 });
    if (!limiter.allowed) {
      res.status(429).json({ error: '请求过于频繁，请稍后重试。' });
      return;
    }

    const payload = parseBody<AuthCredentials>(req.body);
    if (!validateEmail(payload?.email) || !validateRequiredText(payload?.password, 72)) {
      res.status(400).json({ error: '请输入有效的邮箱和密码。' });
      return;
    }

    const { user, cookieValue } = loginUser(payload, getCookieHeader(req));
    res.setHeader('Set-Cookie', buildAuthCookie(cookieValue));
    res.status(200).json(user);
  } catch (error: any) {
    res.status(401).json({ error: error?.message || 'Login failed' });
  }
}
