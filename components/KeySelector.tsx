import React, { useState, useEffect } from 'react';

interface KeySelectorProps {
  onKeySelected: () => void;
}

// 擴充 window 類型定義
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const KeySelector: React.FC<KeySelectorProps> = ({ onKeySelected }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  const checkKey = async () => {
    try {
      // 1. 檢查是否在 AI Studio 環境中
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) {
          onKeySelected();
          return;
        }
      }

      // 2. 使用後端代理時，前端不保存 API Key
      setIsStandalone(true);
      setIsChecking(false);
    } catch (e) {
      console.error("Error checking key", e);
      setIsChecking(false);
      setIsStandalone(true);
    }
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        onKeySelected();
      } catch (error: any) {
        console.error("Key selection failed", error);
        alert("密钥选择失败，请重试。");
      }
    } else {
      onKeySelected();
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-4 bg-indigo-500 rounded-full mb-2"></div>
          <span className="text-slate-500 text-sm">正在初始化 AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-100 p-8">
        <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">欢迎使用 AI 备课助手</h2>

        {isStandalone ? (
          <div className="space-y-4 mt-6">
            <p className="text-slate-500 text-sm text-center mb-4">
              已启用后端代理模式，请在部署环境中配置 API 密钥后继续。
            </p>

            <div className="text-center">
              <button
                onClick={() => onKeySelected()}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                跳过，进入预览模式
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-slate-500 mb-6 text-sm text-center">
              如需使用 AI 生成功能，请选择一个已开通计费的 Google Cloud 项目 API 密钥。
            </p>
            <button
              onClick={handleSelectKey}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors"
            >
              选择 API 密钥
            </button>
          </>
        )}

        <p className="mt-6 text-xs text-slate-400 text-center">
          了解更多关于 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer noopener" className="underline hover:text-indigo-500">API 计费要求</a>。
        </p>
      </div>
    </div>
  );
};

export default KeySelector;
