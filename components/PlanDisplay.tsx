import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { GeneratedPlan } from '../types';
import { exportToDocx } from '../utils/fileUtils';

interface PlanDisplayProps {
  plan: GeneratedPlan | null;
  onQuickAsk: (question: string) => void;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onQuickAsk }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleDownloadDocx = () => {
    if (contentRef.current) {
      exportToDocx(contentRef.current.innerHTML, "教学设计方案");
    }
  };

  const handleCopy = () => {
    if (plan) {
      navigator.clipboard.writeText(plan.markdown).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!plan) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 h-full flex flex-col items-center justify-center text-center">
        <div className="bg-indigo-50 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-slate-800 mb-2">准备好备课了吗？</h3>
        <p className="text-slate-500 max-w-sm">
          请在左侧输入课程详情，我将利用AI大模型为您生成一份结构化、可直接落地的教学设计方案。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">教学设计方案</h2>
          <div className="flex gap-2">
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
            <button
              onClick={handleCopy}
              className={`text-xs flex items-center gap-1 px-2 py-1 rounded border transition-all ${copied ? 'bg-green-50 text-green-600 border-green-200' : 'text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300'}`}
              title="复制所有内容"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  已复制
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m3 3h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2V11a2 2 0 012-2z" />
                  </svg>
                  复制
                </>
              )}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onQuickAsk("为这节课建议一个有创意的导入环节")}
            className="text-xs bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-full text-slate-600 font-medium transition-colors"
          >
            ✨ 创意导入
          </button>
          <button
            onClick={() => onQuickAsk("针对这节课，如何为基础较好和基础较弱的学生进行分层教学？")}
            className="text-xs bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-full text-slate-600 font-medium transition-colors"
          >
            🎓 分层教学建议
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Markdown Content */}
        <div ref={contentRef} className="prose prose-sm prose-indigo max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-indigo-700 mt-6 mb-3" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-slate-800 mt-4 mb-2" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700" {...props} />,
              li: ({ node, ...props }) => <li className="pl-1" {...props} />,
              p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-slate-700" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
            }}
          >
            {plan.markdown}
          </ReactMarkdown>
        </div>

        {/* Grounding Sources */}
        {plan.groundingUrls.length > 0 && (
          <div className="mt-8 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              参考来源
            </h4>
            <ul className="space-y-1">
              {plan.groundingUrls.map((url, index) => (
                <li key={index}>
                  <a
                    href={url.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline truncate block"
                  >
                    {url.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanDisplay;