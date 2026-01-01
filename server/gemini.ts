import { GoogleGenAI } from '@google/genai';
import {
  GeneratedPlan,
  ImageSize,
  LessonRequest,
  PracticePlan,
  PracticeRequest,
  ResourcePlan,
  ResourceRequest,
  StudentAnalysisPlan,
  StudentAnalysisRequest,
} from '../types';

const getApiKey = (type: 'text' | 'image' | 'video' = 'text') => {
  const baseKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (type === 'image') {
    return process.env.IMAGE_API_KEY || baseKey;
  }
  if (type === 'video') {
    return process.env.VIDEO_API_KEY || baseKey;
  }
  return baseKey;
};

const getAIClient = (type: 'text' | 'image' | 'video' = 'text') => {
  const apiKey = getApiKey(type);
  if (!apiKey) {
    throw new Error('API key not configured on server.');
  }
  return new GoogleGenAI({ apiKey });
};

const generateTextContent = async (modelName: string, prompt: string, systemInstruction?: string) => {
  const ai = getAIClient('text');
  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction || '你是一名乐于助人的教师助手，请始终使用简体中文回复。',
    },
  });
  return response.text || '';
};

export const generateImage = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = getAIClient('image');
  const response = await ai.models.generateImages({
    model: 'imagen-3',
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: size === ImageSize.Size1K ? '1:1' : '16:9',
    },
  });

  const image = response.generatedImages?.[0];
  const imageData = (image?.image as { data?: string } | undefined)?.data || (image as { data?: string } | undefined)?.data;

  if (!imageData) {
    throw new Error('No image data received from Imagen model.');
  }

  return `data:image/png;base64,${imageData}`;
};

export const generateVideo = async (prompt: string) => {
  const ai = getAIClient('video');
  const apiKey = getApiKey('video');
  if (!apiKey) {
    throw new Error('Video API key not configured on server.');
  }

  let operation = await ai.models.generateVideos({
    model: 'veo-2.0-generate-video',
    prompt,
  });

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
    throw new Error('Video generation failed to return a URI.');
  }

  const fetchResponse = await fetch(`${videoUri}&key=${apiKey}`);
  if (!fetchResponse.ok) {
    throw new Error('Failed to download generated video.');
  }

  return {
    contentType: fetchResponse.headers.get('content-type') || 'video/mp4',
    buffer: await fetchResponse.arrayBuffer(),
  };
};

export const generateLessonPlan = async (request: LessonRequest): Promise<GeneratedPlan> => {
  const prompt = `
    角色：AI 教育技术架构师 + 一线教师教学顾问。
    任务：基于以下信息，为教师生成一份【可直接用于课堂实施】的教学设计方案（使用简体中文）：
    
    【基本信息】：
    - 学科与年级：${request.subject}
    - 课题名称：${request.topic}
    - 课时长度：${request.duration}
    - 教师设定的原始教学目标：${request.objectives}
    - 学生基础情况：${request.background || '普通混合能力班级'}

    输出要求：
    1. **课程基本信息回显**：在开头以清晰的列表形式列出上述基本信息，必须包含“原始教学目标”。
    2. **目标深化**：基于原始目标，进一步扩展为专业的“三维目标”。
    3. **完整教学流程**：包含（导入 → 新授 → 巩固 → 总结）。
    4. **互动设计**：至少设计 3 个明确的师生互动环节。
    5. **格式优化**：使用 Markdown 标题和列表。
  `;

  const ai = getAIClient('text');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: '你是一名乐于助人且经验丰富的教师助手，请始终使用简体中文回复。',
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const groundingUrls = groundingChunks
    .map((chunk: { web?: { title?: string; uri?: string } }) => chunk.web)
    .filter((web): web is { title: string; uri: string } => Boolean(web && web.uri && web.title))
    .map((web) => ({ title: web.title, uri: web.uri }));

  return {
    markdown: response.text || '生成教学设计失败。',
    groundingUrls,
  };
};

export const generateResourceSupport = async (request: ResourceRequest): Promise<ResourcePlan> => {
  const prompt = `
    角色：多媒体教学资源专家。
    任务：基于以下教学设计信息，为教师提供多媒体教学资源支持方案（使用简体中文）。
    【教学主题】：${request.topic}
    【教学重点与难点】：${request.keyPoints}
    请严格按照通道 A（可信资源检索）和通道 B（AI 素材生成）输出。
  `;

  const ai = getAIClient('text');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: '你是一名专业的多媒体教学资源顾问，请始终使用简体中文回复。',
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const groundingUrls = groundingChunks
    .map((chunk: { web?: { title?: string; uri?: string } }) => chunk.web)
    .filter((web): web is { title: string; uri: string } => Boolean(web && web.uri && web.title))
    .map((web) => ({ title: web.title, uri: web.uri }));

  return {
    markdown: response.text || '生成资源支持方案失败。',
    groundingUrls,
  };
};

export const generatePracticeExercises = async (request: PracticeRequest): Promise<PracticePlan> => {
  const prompt = `围绕知识点 ${request.knowledgePoint} 生成分层练习题。`;
  const text = await generateTextContent('gemini-2.5-flash', prompt, '你是一名严谨的命题老师。');
  return { markdown: text };
};

export const analyzeStudentReadiness = async (request: StudentAnalysisRequest): Promise<StudentAnalysisPlan> => {
  const prompt = `分析学生对 ${request.upcomingTopic} 的预备知识掌握情况。`;
  const text = await generateTextContent('gemini-2.5-flash', prompt, '你是一名具有洞察力的教育顾问。');
  return { markdown: text };
};

export const getQuickSuggestion = async (query: string, context: string): Promise<string> => {
  const prompt = `背景: ${context}\n提问: ${query}`;
  return generateTextContent('gemini-2.5-flash-lite', prompt);
};
