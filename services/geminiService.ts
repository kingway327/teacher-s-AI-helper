import { GeneratedPlan, ImageSize, LessonRequest, ResourcePlan, ResourceRequest, PracticePlan, PracticeRequest, StudentAnalysisPlan, StudentAnalysisRequest } from "../types";

const postJson = async <T>(url: string, payload: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

const postBlob = async (url: string, payload: unknown): Promise<Blob> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.blob();
};

/**
 * 接口 1：专用图像生成接口
 */
export const generateImage = async (prompt: string, size: ImageSize): Promise<string> => {
  try {
    const response = await postJson<{ dataUrl: string }>('/api/generate-image', {
      prompt,
      size,
    });

    return response.dataUrl;
  } catch (error) {
    console.error("Image Generation Interface Error:", error);
    throw error;
  }
};

/**
 * 接口 2：专用视频生成接口
 */
export const generateVideo = async (prompt: string): Promise<string> => {
  try {
    const blob = await postBlob('/api/generate-video', { prompt });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video Generation Interface Error:", error);
    throw error;
  }
};

export const generateLessonPlan = async (request: LessonRequest): Promise<GeneratedPlan> => {
  try {
    return await postJson<GeneratedPlan>('/api/lesson-plan', request);
  } catch (error) {
    console.error("Lesson Plan Gen Error:", error);
    throw error;
  }
};

export const generateResourceSupport = async (request: ResourceRequest): Promise<ResourcePlan> => {
  try {
    return await postJson<ResourcePlan>('/api/resource-support', request);
  } catch (error) {
    console.error("Resource Support Gen Error:", error);
    throw error;
  }
};

export const generatePracticeExercises = async (request: PracticeRequest): Promise<PracticePlan> => {
  return await postJson<PracticePlan>('/api/practice-exercises', request);
};

export const analyzeStudentReadiness = async (request: StudentAnalysisRequest): Promise<StudentAnalysisPlan> => {
  return await postJson<StudentAnalysisPlan>('/api/student-analysis', request);
};

export const getQuickSuggestion = async (query: string, context: string): Promise<string> => {
  const response = await postJson<{ text: string }>('/api/quick-suggestion', { query, context });
  return response.text;
};

export const generateTeachingImage = generateImage;
export const generateLessonVideo = generateVideo;
