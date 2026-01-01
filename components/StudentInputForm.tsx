import React, { useState } from 'react';
import { StudentAnalysisRequest } from '../types';
import FileImporter from './FileImporter';
import AutoResizeTextarea from './AutoResizeTextarea';

interface StudentInputFormProps {
  onSubmit: (data: StudentAnalysisRequest) => void;
  isLoading: boolean;
}

const StudentInputForm: React.FC<StudentInputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<StudentAnalysisRequest>({
    historySummary: '',
    upcomingTopic: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImportHistory = (content: string) => {
    setFormData(prev => ({
      ...prev,
      historySummary: prev.historySummary ? prev.historySummary + '\n\n[导入数据]:\n' + content : content
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        学生数据录入
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">即将学习的知识点</label>
          <AutoResizeTextarea
            name="upcomingTopic"
            required
            placeholder="例如：二次函数的图像与性质"
            value={formData.upcomingTopic}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-700">学生历史表现摘要</label>
            <FileImporter onImport={handleImportHistory} label="导入成绩/评价单" />
          </div>
          <div className="text-xs text-slate-500 mb-2">
            包含成绩区间、常见错误类型、学习习惯等。信息越详细，分析越准确。
          </div>
          <AutoResizeTextarea
            name="historySummary"
            required
            placeholder="例如：
            - 平时测验成绩在 70-80 分之间。
            - 计算能力较强，但对概念理解不够深入。
            - 在之前学习'一次函数'时，容易混淆斜率 k 的几何意义。
            - 课堂注意力集中，但作业经常出现审题不清的错误。"
            value={formData.historySummary}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在分析数据...
              </span>
            ) : (
              '开始诊断分析'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentInputForm;