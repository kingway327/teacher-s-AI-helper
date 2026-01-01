import { generateVideo } from '../server/gemini';

const parseBody = (body: unknown) => (typeof body === 'string' ? JSON.parse(body) : body);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = parseBody(req.body) as { prompt?: string };
    if (!payload?.prompt) {
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }

    const { buffer, contentType } = await generateVideo(payload.prompt);
    res.setHeader('Content-Type', contentType);
    res.status(200).send(Buffer.from(buffer));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Video generation failed' });
  }
}
