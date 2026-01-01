import { GoogleGenAI } from "@google/genai";
import { GeneratedPlan, ImageSize, LessonRequest, ResourcePlan, ResourceRequest, PracticePlan, PracticeRequest, StudentAnalysisPlan, StudentAnalysisRequest } from "../types";

// Helper to get the AI client. 
const getAIClient = (type: 'text' | 'image' | 'video' = 'text') => {
  // 优先级：localStorage > process.env
  let apiKey = localStorage.getItem('GEMINI_API_KEY') || process.env.API_KEY;

  if (type === 'image') {
    apiKey = localStorage.getItem('IMAGE_API_KEY') || process.env.IMAGE_API_KEY || apiKey;
  } else if (type === 'video') {
    apiKey = localStorage.getItem('VIDEO_API_KEY') || process.env.VIDEO_API_KEY || apiKey;
  }

  if (!apiKey || apiKey === 'undefined' || apiKey === '""') {
    throw new Error("API Key not found. Please select an API key first.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * 获取全局记忆（教师介绍）
 */
const getGlobalMemory = () => {
  const bio = localStorage.getItem('TEACHER_BIO');
  return bio ? `\n【教师背景信息（全局记忆）】：\n${bio}\n请在生成内容时参考以上背景信息，使输出更符合该教师的风格和需求。` : "";
};

/**
 * 文本生成接口：用于教案、练习、分析等
 */
const generateTextContent = async (modelName: string, prompt: string, systemInstruction?: string) => {
  const ai = getAIClient('text');
  const globalMemory = getGlobalMemory();
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: (systemInstruction || "你是一名乐于助人的教师助手，请始终使用简体中文回复。") + globalMemory,
      },
    });
    return response.text || "";
  } catch (error) {
    console.error(`Text Gen Error (${modelName}):`, error);
    throw error;
  }
};

/**
 * 接口 1：专用图像生成接口
 */
export const generateImage = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = getAIClient('image');
  try {
    const response = await ai.models.generateImages({
      model: "imagen-3",
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: size === ImageSize.Size1K ? "1:1" : "16:9",
      }
    });

    const image = response.generatedImages?.[0];
    const imageData = (image?.image as any)?.data || (image as any)?.data;

    if (imageData) {
      return `data:image/png;base64,${imageData}`;
    }
    throw new Error("No image data received from Imagen model.");
  } catch (error) {
    console.error("Image Generation Interface Error:", error);
    throw error;
  }
};

/**
 * 接口 2：专用视频生成接口
 */
export const generateVideo = async (prompt: string): Promise<string> => {
  const ai = getAIClient('video');
  // 获取当前使用的 API Key 用于视频下载
  const apiKey = localStorage.getItem('VIDEO_API_KEY') || process.env.VIDEO_API_KEY || localStorage.getItem('GEMINI_API_KEY') || process.env.API_KEY;

  try {
    let operation = await ai.models.generateVideos({
      model: "veo-2.0-generate-video",
      prompt: prompt,
    });

    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed to return a URI.");

    const fetchResponse = await fetch(`${videoUri}&key=${apiKey}`);
    if (!fetchResponse.ok) throw new Error("Failed to download generated video.");

    const blob = await fetchResponse.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video Generation Interface Error:", error);
    throw error;
  }
};

export const generateLessonPlan = async (request: LessonRequest): Promise<GeneratedPlan> => {
  const globalMemory = getGlobalMemory();
  const prompt = `
    角色：AI 教育技术架构师 + 一线教师教学顾问。
    任务：基于以下信息，为教师生成一份【可直接用于课堂实施】的教学设计方案（使用简体中文）：
    ${globalMemory}
    
    【基本信息】：
    - 学科与年级：${request.subject}
    - 课题名称：${request.topic}
    - 课时长度：${request.duration}
    - 教师设定的原始教学目标：${request.objectives}
    - 学生基础情况：${request.background || "普通混合能力班级"}

    输出要求：
    1. **课程基本信息回显**：在开头以清晰的列表形式列出上述基本信息，必须包含“原始教学目标”。
    2. **目标深化**：基于原始目标，进一步扩展为专业的“三维目标”。
    3. **完整教学流程**：包含（导入 → 新授 → 巩固 → 总结）。
    4. **互动设计**：至少设计 3 个明确的师生互动环节。
    5. **格式优化**：使用 Markdown 标题和列表。
  `;

  const ai = getAIClient('text');
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "你是一名乐于助人且经验丰富的教师助手，请始终使用简体中文回复。" + globalMemory,
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingUrls = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title)
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    return {
      markdown: response.text || "生成教学设计失败。",
      groundingUrls,
    };
  } catch (error) {
    console.error("Lesson Plan Gen Error:", error);
    throw error;
  }
};

export const generateResourceSupport = async (request: ResourceRequest): Promise<ResourcePlan> => {
  const globalMemory = getGlobalMemory();
  const prompt = `
    角色：多媒体教学资源专家。
    任务：基于以下教学设计信息，为教师提供多媒体教学资源支持方案（使用简体中文）。
    ${globalMemory}
    【教学主题】：${request.topic}
    【教学重点与难点】：${request.keyPoints}
    请严格按照通道 A（可信资源检索）和通道 B（AI 素材生成）输出。
  `;

  const ai = getAIClient('text');
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "你是一名专业的多媒体教学资源顾问，请始终使用简体中文回复。" + globalMemory,
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingUrls = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title)
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    return {
      markdown: response.text || "生成资源支持方案失败。",
      groundingUrls,
    };
  } catch (error) {
    console.error("Resource Support Gen Error:", error);
    throw error;
  }
};

export const generatePracticeExercises = async (request: PracticeRequest): Promise<PracticePlan> => {
  const prompt = `围绕知识点 ${request.knowledgePoint} 生成分层练习题。`;
  const text = await generateTextContent("gemini-2.5-flash", prompt, "你是一名严谨的命题老师。");
  return { markdown: text };
};

export const analyzeStudentReadiness = async (request: StudentAnalysisRequest): Promise<StudentAnalysisPlan> => {
  const prompt = `分析学生对 ${request.upcomingTopic} 的预备知识掌握情况。`;
  const text = await generateTextContent("gemini-2.5-flash", prompt, "你是一名具有洞察力的教育顾问。");
  return { markdown: text };
};

export const getQuickSuggestion = async (query: string, context: string): Promise<string> => {
  const prompt = `背景: ${context}\n提问: ${query}`;
  return await generateTextContent("gemini-2.5-flash-lite", prompt);
};

export const generateTeachingImage = generateImage;
export const generateLessonVideo = generateVideo;