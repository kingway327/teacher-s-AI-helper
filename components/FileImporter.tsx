import React, { useRef, useState } from 'react';
import { readFileContent } from '../utils/fileUtils';

interface FileImporterProps {
  onImport: (content: string) => void;
  label?: string;
  className?: string;
}

const FileImporter: React.FC<FileImporterProps> = ({ onImport, label = "导入文件", className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReading, setIsReading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReading(true);
    try {
      const content = await readFileContent(file);
      onImport(content);
    } catch (error: any) {
      alert(error.message || "读取文件失败");
    } finally {
      setIsReading(false);
      // Reset input value to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`inline-block ${className || ''}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.csv,.docx"
        className="hidden"
      />
      <button
        type="button"
        onClick={triggerClick}
        disabled={isReading}
        className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors font-medium focus:outline-none"
        title="支持 .txt, .csv, .docx"
      >
        {isReading ? (
          <span className="flex items-center">
            <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            读取中...
          </span>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {label}
          </>
        )}
      </button>
    </div>
  );
};

export default FileImporter;