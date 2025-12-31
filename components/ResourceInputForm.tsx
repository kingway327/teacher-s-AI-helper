import React, { useState } from 'react';
import { ResourceRequest } from '../types';
import FileImporter from './FileImporter';

interface ResourceInputFormProps {
  onSubmit: (data: ResourceRequest) => void;
  isLoading: boolean;
}

const ResourceInputForm: React.FC<ResourceInputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ResourceRequest>({
    topic: '',
    keyPoints: '',
    ageGroup: '小学高年级',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImportKeyPoints = (content: string) => {
     setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints ? prev.keyPoints + '\n\n[导入内容]:\n' + content : content
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        资源规划信息
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">教学主题</label>
          <input
            type="text"
            name="topic"
            required
            placeholder="例如：光合作用的过程"
            value={formData.topic}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">学生年龄段</label>
          <select
            name="ageGroup"
            value={formData.ageGroup}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="幼儿园">幼儿园 (3-6岁)</option>
            <option value="小学低年级">小学低年级 (1-3年级)</option>
            <option value="小学高年级">小学高年级 (4-6年级)</option>
            <option value="初中">初中 (7-9年级)</option>
            <option value="高中">高中 (10-12年级)</option>
            <option value="大学及成人">大学及成人</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
             <label className="block text-sm font-medium text-slate-700">教学重点与难点</label>
             <FileImporter onImport={handleImportKeyPoints} label="导入课件内容" />
          </div>
          <textarea
            name="keyPoints"
            rows={4}
            required
            placeholder="例如：重点是理解光反应和暗反应的区别；难点是微观过程的想象。"
            value={formData.keyPoints}
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
                正在规划资源...
              </span>
            ) : (
              '生成资源支持方案'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceInputForm;