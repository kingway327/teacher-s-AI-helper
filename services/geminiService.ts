import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedPlan, ImageSize, LessonRequest, ResourcePlan, ResourceRequest, PracticePlan, PracticeRequest, StudentAnalysisPlan, StudentAnalysisRequest } from "../types";

// Helper to get the AI client. 
// We create a new instance each time to ensure we pick up the latest injected process.env.API_KEY
// after the user selects it via window.aistudio.
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select an API key first.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLessonPlan = async (request: LessonRequest): Promise<GeneratedPlan> => {
  const ai = getAIClient();
  
  const prompt = `
    角色：AI 教育技术架构师 + 一线教师教学顾问。
    任务：基于以下信息，为教师生成一份【可直接用于课堂实施】的教学设计方案（使用中文）：
    
    【学科与年级】：${request.subject}
    【课题名称】：${request.topic}
    【课时长度】：${request.duration}
    【教学目标】：${request.objectives}
    【学生基础情况】：${request.background || "普通混合能力班级"}

    输出要求：
    1. 给出完整教学流程（导入 → 新授 → 巩固 → 总结）
    2. 明确每个教学环节的时间分配
    3. 至少设计 3 个明确的师生互动环节，并说明互动方式
    4. 语言应贴近一线教师，避免学术化表述，请务必使用中文输出。
    5. 格式：使用 Markdown，包含粗体标题和列表。

    Grounding: 使用 Google Search 查找相关的现实案例、趣味事实或课程标准，以丰富课程内容。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "你是一名乐于助人且经验丰富的教师助手，请始终使用中文回复。",
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
  const ai = getAIClient();

  const prompt = `
    角色：多媒体教学资源专家。
    任务：基于以下教学设计信息，为教师提供多媒体教学资源支持方案（使用中文）。

    【教学主题】：${request.topic}
    【教学重点与难点】：${request.keyPoints}
    【学生年龄段】：${request.ageGroup}

    请严格按照以下两个通道输出结果：

    ### 通道 A：可信教学资源智能检索
    (请使用 Google Search 查找真实存在的优质资源类型或具体方向)
    1. 推荐适合课堂使用的视频或图片资源类型（例如：纪录片片段、实验演示、高清图表等）。
    2. 说明资源适合的教学环节。
    3. 说明该资源对理解知识点的帮助。

    ### 通道 B：AI 示意性素材生成
    (为教师提供可以使用 AI 生成工具制作的素材建议)
    1. 给出可用于生成的示意性图片/动画的详细 Prompt 描述。
    2. 明确标注其教学用途（如“结构示意”、“课堂导入”）。
    3. 说明不适合直接替代真实教学素材的原因（如适用，例如：AI 可能在解剖细节上不准确，仅作宏观示意）。

    输出格式：Markdown。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable search for Channel A
        systemInstruction: "你是一名专业的多媒体教学资源顾问，能区分真实资源与AI生成资源的适用场景。",
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
  const ai = getAIClient();

  const prompt = `
    角色：资深命题专家 + 一线骨干教师。
    任务：围绕以下教学内容，为学生生成一组【分层练习题】（使用中文）。

    【学科与年级】：${request.subject}
    【知识点】：${request.knowledgePoint}
    【教学目标】：${request.objectives}

    要求：
    1. 题型必须包含：选择题、填空题、简答题（可根据学科特点适当调整，但必须丰富）。
    2. 难度严格分层：
       - **基础达标** (着重基础知识回顾与简单应用)
       - **能力提升** (着重综合运用与理解)
       - **拓展探究** (着重分析、评价或创新思维)
    3. 每道题必须在试卷末尾或单独板块给出【标准答案】与【简要解析】。
    4. 题目风格贴近真实考试或课堂作业，语言严谨规范。
    
    输出格式：Markdown。请将"习题部分"与"答案解析部分"用分割线清晰分开。
  `;

  try {
    // Using gemini-3-flash-preview for fast text generation
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "你是一名严谨的命题老师，出题规范，解析清晰。",
      },
    });

    return {
      markdown: response.text || "生成练习题失败。",
    };
  } catch (error) {
    console.error("Practice Gen Error:", error);
    throw error;
  }
};

export const analyzeStudentReadiness = async (request: StudentAnalysisRequest): Promise<StudentAnalysisPlan> => {
  const ai = getAIClient();

  const prompt = `
    角色：教育数据分析师 + 学习诊断专家。
    任务：基于以下学生学习数据，对学生的“预备知识掌握情况”进行分析（使用中文）。

    【学生历史表现摘要】：${request.historySummary}
    【即将学习的知识点】：${request.upcomingTopic}

    请输出以下分析报告：
    1. **预备知识掌握度评估**：
       - 给出明确的百分比估算或等级（优秀/良好/及格/薄弱）。
       - 简述理由，连接历史表现与新知识的需求。
    2. **潜在学习风险点**：
       - 识别学生在学习新知识时可能遇到的具体障碍（基于历史错误模式）。
    3. **个性化预习或补救建议**：
       - 提供至少 3 条具体的建议（如：复习特定旧概念、观看此类视频、进行某种专项练习）。
       - 建议需具有针对性，针对上述风险点。

    输出格式：Markdown。请使用专业但易懂的语气。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Good reasoning capabilities needed
      contents: prompt,
      config: {
        systemInstruction: "你是一名具有洞察力的教育顾问，能够从模糊的数据中发现学习规律。",
      },
    });

    return {
      markdown: response.text || "学情分析生成失败。",
    };
  } catch (error) {
    console.error("Analysis Gen Error:", error);
    throw error;
  }
};

export const generateTeachingImage = async (
  prompt: string, 
  size: ImageSize
): Promise<string> => {
  const ai = getAIClient();
  
  try {
    // gemini-3-pro-image-preview is required for high quality / size selection
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "16:9" 
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data received.");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

export const generateLessonVideo = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  const apiKey = process.env.API_KEY;

  try {
    let operation = await ai.models.generateVideos({
      model: "veo-3.1-fast-generate-preview",
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: "720p", // Fast generation usually supports 720p/1080p, stick to standard
        aspectRatio: "16:9",
      },
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed to return a URI.");

    // Fetch the actual video bytes/url. Note: The URI needs the API key appended.
    // However, since we can't easily proxy this in a client-side only app without exposing key in URL significantly, 
    // we will fetch it to a blob or return the signed-ish URL if possible.
    // The guidance says: fetch(`${downloadLink}&key=${process.env.API_KEY}`)
    
    const fetchResponse = await fetch(`${videoUri}&key=${apiKey}`);
    if (!fetchResponse.ok) throw new Error("Failed to download generated video.");
    
    const blob = await fetchResponse.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Video Gen Error:", error);
    throw error;
  }
};

export const getQuickSuggestion = async (query: string, context: string): Promise<string> => {
  const ai = getAIClient();
  try {
    // Low latency model for quick interactions
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-latest",
      contents: `背景信息（已生成的教案）: ${context}\n\n教师提问: ${query}\n\n请用中文简短、有帮助地回答。`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Quick Suggestion Error:", error);
    return "抱歉，我现在无法给出建议。";
  }
};