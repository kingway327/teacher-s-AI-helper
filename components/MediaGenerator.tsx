import React, { useState } from 'react';
import { generateImage, generateVideo } from '../services/geminiService';
import { ImageSize, ImageState, VideoState } from '../types';

interface MediaGeneratorProps {
  topic: string;
}

const MediaGenerator: React.FC<MediaGeneratorProps> = ({ topic }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');

  // Image State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.Size1K);
  const [imageState, setImageState] = useState<ImageState>({ isGenerating: false, imageUrl: null, error: null });
  const [isImageModelMissing, setIsImageModelMissing] = useState(false);

  // Video State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoState, setVideoState] = useState<VideoState>({ isGenerating: false, videoUrl: null, error: null });
  const [isVideoModelMissing, setIsVideoModelMissing] = useState(false);

  // Pre-fill prompts based on topic when component mounts/topic changes
  React.useEffect(() => {
    if (topic) {
      setImagePrompt(`一张清晰的教育示意图，解释${topic}，适合学生观看，信息图表风格。`);
      setVideoPrompt(`一段关于${topic}的电影级教育纪录片风格的课堂导入视频，生动有趣。`);
    }
  }, [topic]);

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setImageState({ isGenerating: true, imageUrl: null, error: null });
    setIsImageModelMissing(false);
    try {
      const url = await generateImage(imagePrompt, imageSize);
      setImageState({ isGenerating: false, imageUrl: url, error: null });
    } catch (err: any) {
      console.error("Image Gen Error:", err);
      // 检查是否为模型不支持或未找到的错误
      if (err.message?.toLowerCase().includes('404') ||
        err.message?.toLowerCase().includes('not found') ||
        err.message?.toLowerCase().includes('not supported') ||
        err.message?.toLowerCase().includes('permission')) {
        setIsImageModelMissing(true);
      }
      setImageState({ isGenerating: false, imageUrl: null, error: '生成图片失败，请检查模型权限。' });
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt) return;
    setVideoState({ isGenerating: true, videoUrl: null, error: null });
    setIsVideoModelMissing(false);
    try {
      const url = await generateVideo(videoPrompt);
      setVideoState({ isGenerating: false, videoUrl: url, error: null });
    } catch (err: any) {
      console.error("Video Gen Error:", err);
      if (err.message?.toLowerCase().includes('404') ||
        err.message?.toLowerCase().includes('not found') ||
        err.message?.toLowerCase().includes('not supported')) {
        setIsVideoModelMissing(true);
      }
      setVideoState({ isGenerating: false, videoUrl: null, error: '生成视频失败，请检查模型权限。' });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-6 overflow-hidden">
      <div className="flex border-b border-slate-200">
        <button
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'image' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('image')}
        >
          生成可视化教具
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'video' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('video')}
        >
          生成导入视频
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'image' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">提示词</label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={3}
                className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                placeholder="输入图片描述..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">尺寸</label>
              <select
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value as ImageSize)}
                className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                title="选择图片尺寸"
              >
                <option value={ImageSize.Size1K}>1K (1024x1024)</option>
                <option value={ImageSize.Size2K}>2K (2048x2048)</option>
                <option value={ImageSize.Size4K}>4K (4096x4096)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={imageState.isGenerating || !imagePrompt || isImageModelMissing}
              className="w-full py-2 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-900 disabled:opacity-50 transition-colors"
            >
              {imageState.isGenerating ? '正在生成图片...' : '生成图片'}
            </button>

            {imageState.error && <p className="text-red-500 text-sm">{imageState.error}</p>}

            {imageState.imageUrl && (
              <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative group">
                <img src={imageState.imageUrl} alt="Generated visual aid" className="w-full h-auto object-cover" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={imageState.imageUrl} download="teaching-aid.png" className="bg-white/90 p-2 rounded shadow text-xs font-bold text-slate-700">下载</a>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400">AI 辅助教学素材生成</span>
              {isImageModelMissing && <span className="text-xs text-red-500 font-bold">缺少模型</span>}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">提示词</label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={3}
                className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                placeholder="输入视频描述..."
              />
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={videoState.isGenerating || !videoPrompt || isVideoModelMissing}
              className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {videoState.isGenerating ? '正在制作视频（可能需要一分钟）...' : '生成视频'}
            </button>

            {videoState.error && <p className="text-red-500 text-sm">{videoState.error}</p>}

            {videoState.videoUrl && (
              <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 bg-black">
                <video
                  src={videoState.videoUrl}
                  controls
                  className="w-full h-auto aspect-video"
                />
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400">AI 辅助教学素材生成</span>
              {isVideoModelMissing && <span className="text-xs text-red-500 font-bold">缺少模型</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaGenerator;