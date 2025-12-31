import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ResourcePlan } from '../types';
import { exportToDocx } from '../utils/fileUtils';

interface ResourceDisplayProps {
  plan: ResourcePlan | null;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ plan }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadDocx = () => {
    if (contentRef.current) {
      exportToDocx(contentRef.current.innerHTML, "资源支持方案");
    }
  };

  if (!plan) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 h-full flex flex-col items-center justify-center text-center">
        <div className="bg-indigo-50 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-slate-800 mb-2">多媒体资源规划</h3>
        <p className="text-slate-500 max-w-sm">
          输入教学重点，为您检索可信的教学资源，并提供 AI 素材生成建议。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
         <h2 className="text-lg font-semibold text-slate-800">资源支持方案</h2>
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
              h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white bg-indigo-600 py-1 px-3 rounded-md inline-block mt-6 mb-3 shadow-sm" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-base font-semibold text-indigo-800 mt-4 mb-2 border-l-4 border-indigo-200 pl-2" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 bg-slate-50 p-4 rounded-lg" {...props} />,
              li: ({node, ...props}) => <li className="pl-1" {...props} />,
              p: ({node, ...props}) => <p className="mb-3 leading-relaxed text-slate-700" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
            }}
          >
            {plan.markdown}
          </ReactMarkdown>
        </div>

        {/* Grounding Sources */}
        {plan.groundingUrls.length > 0 && (
          <div className="mt-8 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              资源检索来源
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.groundingUrls.map((url, index) => (
                <a 
                  key={index}
                  href={url.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                >
                  <div className="bg-indigo-50 text-indigo-500 p-1.5 rounded group-hover:bg-white group-hover:shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-600 truncate flex-1">{url.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceDisplay;