<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎓 AI 备课助手 (Teacher's AI Helper)

> 使用 Google Gemini AI 协助教师进行课程规划、教材生成和学情分析的智能备课工具

[![部署状态](https://github.com/kingway327/teacher-s-AI-helper/workflows/部署到%20GitHub%20Pages/badge.svg)](https://github.com/kingway327/teacher-s-AI-helper/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ 功能特色

- 📝 **智能课程规划**: 根据教学目标自动生成完整的教学设计方案
- 🧠 **全局记忆 (教师介绍)**: 设置您的教学背景，AI 将为您提供更个性化的建议
- 📚 **教材生成**: 利用 AI 协助创建教学素材、示意图和导入视频
- 👥 **学情分析**: 分析学生学习状况，提供针对性的预备知识建议
- 📊 **资源支持**: 整合可信网络资源和 AI 生成素材
- 🎯 **分层练习**: 自动生成符合学生不同水平的练习题目
- 📄 **文件导入/导出**: 支持 Word 文件的导入和导出功能

## 🚀 快速开始

### 环境需求

- **Node.js**: 18.x 或更高版本
- **npm**: 8.x 或更高版本
- **浏览器**: 支持现代浏览器 (Chrome, Firefox, Safari, Edge)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/kingway327/teacher-s-AI-helper.git
   cd teacher-s-AI-helper
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   复制环境变量模板文件:
   ```bash
   cp .env.local.example .env.local
   ```
   
   编辑 `.env.local` 文件，填入您的 Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   IMAGE_API_KEY=your_image_api_key_here
   VIDEO_API_KEY=your_video_api_key_here
   ```
   
   > 💡 **如何获取 API Key**: 前往 [Google AI Studio](https://makersuite.google.com/app/apikey) 申请免费的 Gemini API Key

4. **启动开发服务器**
   ```bash
   npm run dev
   ```
   
   打开浏览器访问 `http://localhost:3000`

## 📦 可用指令

| 指令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (默认端口: 3000) |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览构建后的应用程序 |
| `npm run type-check` | 执行 TypeScript 类型检查 |

## 📁 项目结构

```
teacher-s-AI-helper/
├── components/              # React 组件
│   ├── FileImporter.tsx    # 文件导入组件
│   ├── InputForm.tsx       # 输入表单组件
│   ├── KeySelector.tsx     # API Key 选择器
│   ├── Layout.tsx          # 布局组件
│   ├── MediaGenerator.tsx  # 媒体生成组件
│   ├── SettingsModal.tsx   # 全局设置组件 (新)
│   ├── PlanDisplay.tsx     # 课程计划显示
│   ├── PracticeDisplay.tsx # 练习题显示
│   ├── ResourceDisplay.tsx # 资源显示
│   └── Student*.tsx        # 学生相关组件
├── services/               # 服务层
│   └── geminiService.ts   # Gemini AI 服务
├── utils/                  # 工具函数
│   └── fileUtils.ts       # 文件处理工具
├── .github/workflows/      # GitHub Actions 配置
│   └── deploy.yml         # 自动部署配置
├── App.tsx                # 主应用程序组件
├── index.tsx              # 应用程序入口
├── types.ts               # TypeScript 类型定义
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖配置
```

## 🛠️ 技术栈

- **前端框架**: React 19.x
- **构建工具**: Vite 6.x
- **编程语言**: TypeScript 5.x
- **AI 服务**: Google Gemini API (Flash, Imagen, Veo)
- **样式**: Tailwind CSS
- **文件处理**: Mammoth.js, html-docx-js
- **Markdown 渲染**: react-markdown, remark-math, rehype-katex

## 🚢 部署

### 部署到 GitHub Pages

本项目已配置 GitHub Actions 自动化部署流程:

1. **启用 GitHub Pages**
   - 前往项目的 Settings > Pages
   - Source 选择 "GitHub Actions"

2. **配置环境变量 (可选)**
   - 前往 Settings > Secrets and variables > Actions
   - 新增 Secret: `GEMINI_API_KEY` (如果需要在构建时使用)

3. **触发部署**
   - 推送代码到 `main` 分支会自动触发部署
   - 或在 Actions 页面手动触发 workflow

4. **访问网站**
   - 部署完成后，可通过 `https://kingway327.github.io/teacher-s-AI-helper/` 访问

## 🔐 环境变量说明

| 变量名称 | 必填 | 说明 |
|---------|------|------|
| `GEMINI_API_KEY` | 是 | Google Gemini API 密钥，用于主要 AI 功能 |
| `IMAGE_API_KEY` | 否 | 图像生成专用密钥 (如果主 Key 不支持 Imagen) |
| `VIDEO_API_KEY` | 否 | 视频生成专用密钥 (如果主 Key 不支持 Veo) |

## 🤝 贡献指南

欢迎贡献代码、回报问题或提出建议!

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的变更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 授权

本项目采用 MIT 授权 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Google Gemini AI](https://ai.google.dev/) - 提供强大的 AI 能力
- [React](https://react.dev/) - 优秀的前端框架
- [Vite](https://vitejs.dev/) - 快速的构建工具

---

<div align="center">
Made with ❤️ by kingway327
</div>
