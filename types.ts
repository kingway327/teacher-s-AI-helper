// Global types for the application

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

export interface LessonRequest {
  subject: string;
  topic: string;
  duration: string;
  objectives: string;
  background: string;
}

export interface GeneratedPlan {
  markdown: string;
  groundingUrls: Array<{ title: string; uri: string }>;
}

// Resource Support types
export interface ResourceRequest {
  topic: string;
  keyPoints: string; // 重点与难点
  ageGroup: string;
}

export interface ResourcePlan {
  markdown: string;
  groundingUrls: Array<{ title: string; uri: string }>;
}

// Practice Exercises types
export interface PracticeRequest {
  subject: string; // 学科与年级
  knowledgePoint: string; // 知识点
  objectives: string; // 教学目标
}

export interface PracticePlan {
  markdown: string;
}

// New types for Student Analysis
export interface StudentAnalysisRequest {
  historySummary: string; // 历史表现摘要
  upcomingTopic: string; // 即将学习的知识点
}

export interface StudentAnalysisPlan {
  markdown: string;
}

export enum ImageSize {
  Size1K = '1K',
  Size2K = '2K',
  Size4K = '4K',
}

export interface VideoState {
  isGenerating: boolean;
  videoUrl: string | null;
  error: string | null;
}

export interface ImageState {
  isGenerating: boolean;
  imageUrl: string | null;
  error: string | null;
}
