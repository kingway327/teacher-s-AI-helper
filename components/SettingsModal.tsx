import React, { useState, useEffect, useRef } from 'react';
import { readFileContent } from '../utils/fileUtils';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherBio: string;
    onSave: (bio: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, teacherBio, onSave }) => {
    const [bio, setBio] = useState(teacherBio);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setBio(teacherBio);
    }, [teacherBio]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const content = await readFileContent(file);
            // Append content to existing bio or replace if empty
            setBio(prev => prev ? `${prev}\n\n${content}` : content);
        } catch (error: any) {
            alert(error.message || "导入文件失败");
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-in">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        全局设置
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors" title="关闭">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-slate-700">
                                教师个人介绍 (全局记忆)
                            </label>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                                disabled={isImporting}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                {isImporting ? '正在导入...' : '导入文件 (.docx, .txt, .csv)'}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".docx,.txt,.csv"
                                className="hidden"
                                title="上传文件"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                            在这里输入您的教学背景、风格或偏好。AI 将在生成教案、练习和分析时参考这些信息，为您提供更个性化的建议。
                        </p>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={6}
                            className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none p-3"
                            placeholder="例如：我是一名有着10年经验的小学数学老师，擅长用趣味故事讲解知识点，注重培养学生的逻辑思维能力..."
                        />
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                        <p className="text-xs text-indigo-700 leading-relaxed">
                            <strong>提示：</strong> 您可以包含您擅长的学科、教学年级、常用的教学方法（如启发式教学、项目式学习）等。这些信息将作为 AI 的“长期记忆”存在。
                        </p>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={() => onSave(bio)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                    >
                        保存设置
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
