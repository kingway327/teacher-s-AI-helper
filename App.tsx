import React, { useState } from 'react';
import Layout from './components/Layout';
import InputForm from './components/InputForm';
import ResourceInputForm from './components/ResourceInputForm';
import PracticeInputForm from './components/PracticeInputForm';
import StudentInputForm from './components/StudentInputForm';
import PlanDisplay from './components/PlanDisplay';
import ResourceDisplay from './components/ResourceDisplay';
import PracticeDisplay from './components/PracticeDisplay';
import StudentAnalysisDisplay from './components/StudentAnalysisDisplay';
import MediaGenerator from './components/MediaGenerator';
import KeySelector from './components/KeySelector';
import SettingsModal from './components/SettingsModal';
import { generateLessonPlan, generateResourceSupport, generatePracticeExercises, analyzeStudentReadiness, getQuickSuggestion } from './services/geminiService';
import { GeneratedPlan, LessonRequest, ResourcePlan, ResourceRequest, PracticePlan, PracticeRequest, StudentAnalysisPlan, StudentAnalysisRequest } from './types';

type AppMode = 'lesson' | 'resource' | 'practice' | 'analysis';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [mode, setMode] = useState<AppMode>('lesson');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [teacherBio, setTeacherBio] = useState(localStorage.getItem('TEACHER_BIO') || '');

  // Lesson Plan State
  const [currentPlan, setCurrentPlan] = useState<GeneratedPlan | null>(null);
  const [currentLessonRequest, setCurrentLessonRequest] = useState<LessonRequest | null>(null);
  const [quickAnswer, setQuickAnswer] = useState<{ q: string, a: string } | null>(null);

  // Resource Plan State
  const [currentResourcePlan, setCurrentResourcePlan] = useState<ResourcePlan | null>(null);
  const [currentResourceRequest, setCurrentResourceRequest] = useState<ResourceRequest | null>(null);

  // Practice Plan State
  const [currentPracticePlan, setCurrentPracticePlan] = useState<PracticePlan | null>(null);
  const [currentPracticeRequest, setCurrentPracticeRequest] = useState<PracticeRequest | null>(null);

  // Student Analysis State
  const [currentAnalysisPlan, setCurrentAnalysisPlan] = useState<StudentAnalysisPlan | null>(null);
  const [currentAnalysisRequest, setCurrentAnalysisRequest] = useState<StudentAnalysisRequest | null>(null);

  const handleGenerateLesson = async (request: LessonRequest) => {
    setIsLoading(true);
    setQuickAnswer(null);
    try {
      setCurrentLessonRequest(request);
      const plan = await generateLessonPlan(request);
      setCurrentPlan(plan);
    } catch (error) {
      alert("生成教案失败，请重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateResource = async (request: ResourceRequest) => {
    setIsLoading(true);
    try {
      setCurrentResourceRequest(request);
      const plan = await generateResourceSupport(request);
      setCurrentResourcePlan(plan);
    } catch (error) {
      alert("生成资源方案失败，请重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePractice = async (request: PracticeRequest) => {
    setIsLoading(true);
    try {
      setCurrentPracticeRequest(request);
      const plan = await generatePracticeExercises(request);
      setCurrentPracticePlan(plan);
    } catch (error) {
      alert("生成练习题失败，请重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeStudent = async (request: StudentAnalysisRequest) => {
    setIsLoading(true);
    try {
      setCurrentAnalysisRequest(request);
      const plan = await analyzeStudentReadiness(request);
      setCurrentAnalysisPlan(plan);
    } catch (error) {
      alert("学情分析失败，请重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAsk = async (question: string) => {
    if (!currentPlan) return;
    setQuickAnswer({ q: question, a: "正在思考..." });
    const answer = await getQuickSuggestion(question, currentPlan.markdown);
    setQuickAnswer({ q: question, a: answer });
  };

  const handleSaveSettings = (bio: string) => {
    setTeacherBio(bio);
    localStorage.setItem('TEACHER_BIO', bio);
    setIsSettingsOpen(false);
  };

  if (!hasKey) {
    return <KeySelector onKeySelected={() => setHasKey(true)} />;
  }

  // Determine active topic for media generator
  let activeTopic = '';
  if (mode === 'lesson') activeTopic = currentLessonRequest?.topic || '';
  else if (mode === 'resource') activeTopic = currentResourceRequest?.topic || '';
  else if (mode === 'practice') activeTopic = currentPracticeRequest?.knowledgePoint || '';
  else if (mode === 'analysis') activeTopic = currentAnalysisRequest?.upcomingTopic || '';

  return (
    <Layout onOpenSettings={() => setIsSettingsOpen(true)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
        {/* Left Col: Input & Controls */}
        <div className="lg:col-span-4 h-full flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Mode Switcher */}
          <div className="bg-white p-1 rounded-lg border border-slate-200 flex flex-wrap shadow-sm shrink-0">
            <button
              onClick={() => setMode('lesson')}
              className={`flex-1 min-w-[80px] py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${mode === 'lesson'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              教案设计
            </button>
            <button
              onClick={() => setMode('resource')}
              className={`flex-1 min-w-[80px] py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${mode === 'resource'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              资源支持
            </button>
            <button
              onClick={() => setMode('practice')}
              className={`flex-1 min-w-[80px] py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${mode === 'practice'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              分层练习
            </button>
            <button
              onClick={() => setMode('analysis')}
              className={`flex-1 min-w-[80px] py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${mode === 'analysis'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              学情分析
            </button>
          </div>

          <div className="flex-grow flex flex-col gap-6">
            {/* Input Form based on Mode */}
            <div className="flex-shrink-0">
              {mode === 'lesson' && <InputForm onSubmit={handleGenerateLesson} isLoading={isLoading} />}
              {mode === 'resource' && <ResourceInputForm onSubmit={handleGenerateResource} isLoading={isLoading} />}
              {mode === 'practice' && <PracticeInputForm onSubmit={handleGeneratePractice} isLoading={isLoading} />}
              {mode === 'analysis' && <StudentInputForm onSubmit={handleAnalyzeStudent} isLoading={isLoading} />}
            </div>

            {/* Media Generator (Shared utility) */}
            {activeTopic && !isLoading && (
              <div className="flex-shrink-0 pb-4">
                <MediaGenerator topic={activeTopic} />
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Output */}
        <div className="lg:col-span-8 h-full flex flex-col gap-4">
          {/* Quick Answer Banner (Only for Lesson Mode for now) */}
          {mode === 'lesson' && quickAnswer && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex gap-3 animate-fade-in relative shrink-0">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-800 uppercase mb-1">{quickAnswer.q}</p>
                <p className="text-sm text-indigo-900">{quickAnswer.a}</p>
              </div>
              <button
                onClick={() => setQuickAnswer(null)}
                className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-600"
                title="关闭"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex-grow overflow-hidden">
            {mode === 'lesson' && <PlanDisplay plan={currentPlan} onQuickAsk={handleQuickAsk} />}
            {mode === 'resource' && <ResourceDisplay plan={currentResourcePlan} />}
            {mode === 'practice' && <PracticeDisplay plan={currentPracticePlan} />}
            {mode === 'analysis' && <StudentAnalysisDisplay plan={currentAnalysisPlan} />}
          </div>
        </div>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        teacherBio={teacherBio}
        onSave={handleSaveSettings}
      />
    </Layout>
  );
};

export default App;
