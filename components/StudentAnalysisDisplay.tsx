import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { StudentAnalysisPlan } from '../types';
import { exportToDocx } from '../utils/fileUtils';

interface StudentAnalysisDisplayProps {
  plan: StudentAnalysisPlan | null;
}

const StudentAnalysisDisplay: React.FC<StudentAnalysisDisplayProps> = ({ plan }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadDocx = () => {
    if (contentRef.current) {
      exportToDocx(contentRef.current.innerHTML, "学情分析报告");
    }
  };

  if (!plan) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 h-full flex flex-col items-center justify-center text-center">
        <div className="bg-indigo-50 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-slate-800 mb-2">学情分析与诊断</h3>
        <p className="text-slate-500 max-w-sm">
          通过分析学生的历史表现，评估对新知识的预备情况，并识别潜在的学习风险。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
         <h2 className="text-lg font-semibold text-slate-800">分析诊断报告</h2>
         <button
            onClick={handleDownloadDocx}
            className="text-xs flex items-center gap-1 text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 px-2 py-1 rounded transition-all"
            title="下载为 Word 文档"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出 Word
         </button>
      </div>
      
      <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
        {/* Markdown Content */}
        <div ref={contentRef} className="prose prose-sm prose-indigo max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-lg font-bold text-slate-800 mt-6 mb-3 flex items-center gap-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-base font-semibold text-indigo-700 mt-4 mb-2" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 space-y-2 text-slate-700" {...props} />,
              li: ({node, ...props}) => <li className="pl-1" {...props} />,
              p: ({node, ...props}) => <p className="mb-3 leading-relaxed text-slate-700" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-slate-900 bg-yellow-50 px-1 rounded" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="bg-red-50 border-l-4 border-red-400 p-4 my-4 text-red-800 rounded-r" {...props} />,
            }}
          >
            {plan.markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalysisDisplay;