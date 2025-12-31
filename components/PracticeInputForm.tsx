import React, { useState } from 'react';
import { PracticeRequest } from '../types';
import FileImporter from './FileImporter';

interface PracticeInputFormProps {
  onSubmit: (data: PracticeRequest) => void;
  isLoading: boolean;
}

const PracticeInputForm: React.FC<PracticeInputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<PracticeRequest>({
    subject: '',
    knowledgePoint: '',
    objectives: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImportObjectives = (content: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives ? prev.objectives + '\n\n[导入资料]:\n' + content : content
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        练习题参数
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">学科与年级</label>
          <input
            type="text"
            name="subject"
            required
            placeholder="例如：初中二年级物理"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">核心知识点</label>
          <input
            type="text"
            name="knowledgePoint"
            required
            placeholder="例如：欧姆定律的应用"
            value={formData.knowledgePoint}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-700">教学目标 / 考查范围</label>
            <FileImporter onImport={handleImportObjectives} label="导入考纲或资料" />
          </div>
          <textarea
            name="objectives"
            rows={4}
            required
            placeholder="例如：掌握公式 I=U/R，能解决简单的串联电路计算问题..."
            value={formData.objectives}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
          />
        </div>

        <div className="pt-4 mt-auto">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在生成题目...
              </span>
            ) : (
              '生成分层练习'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PracticeInputForm;