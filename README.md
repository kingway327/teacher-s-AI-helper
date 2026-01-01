<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎓 AI 備課助手 (Teacher's AI Helper)

> 使用 Google Gemini AI 協助教師進行課程規劃、教材生成和學生分析的智能備課工具

[![部署狀態](https://github.com/kingway327/teacher-s-AI-helper/workflows/部署到%20GitHub%20Pages/badge.svg)](https://github.com/kingway327/teacher-s-AI-helper/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ 功能特色

- 📝 **智能課程規劃**: 根據教學目標自動生成完整的課程計劃
- 📚 **教材生成**: 利用 AI 協助創建教學素材和練習題
- 👥 **學生分析**: 分析學生學習狀況,提供個性化建議
- 📊 **資源管理**: 整合和管理教學資源
- 🎯 **練習題庫**: 自動生成和管理練習題目
- 📄 **文件匯入/匯出**: 支援 Word 文件的匯入和匯出功能

## 🚀 快速開始

### 環境需求

- **Node.js**: 18.x 或更高版本
- **npm**: 8.x 或更高版本
- **瀏覽器**: 支援現代瀏覽器(Chrome、Firefox、Safari、Edge)

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone https://github.com/kingway327/teacher-s-AI-helper.git
   cd teacher-s-AI-helper
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **配置環境變數**
   
   複製環境變數範本檔案:
   ```bash
   cp .env.local.example .env.local
   ```
   
   編輯 `.env.local` 檔案,填入您的 Gemini API Key (僅供本機開發後端代理使用):
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
   
   > 💡 **如何獲取 API Key**: 前往 [Google AI Studio](https://makersuite.google.com/app/apikey) 申請免費的 Gemini API Key

4. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   
   開啟瀏覽器訪問 `http://localhost:3000`

## 📦 可用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動開發伺服器(預設端口: 3000) |
| `npm run build` | 建置生產版本 |
| `npm run preview` | 預覽建置後的應用程式 |
| `npm run type-check` | 執行 TypeScript 類型檢查 |

## 📁 專案結構

```
teacher-s-AI-helper/
├── components/              # React 元件
│   ├── FileImporter.tsx    # 檔案匯入元件
│   ├── InputForm.tsx       # 輸入表單元件
│   ├── KeySelector.tsx     # API Key 選擇器
│   ├── Layout.tsx          # 版面配置元件
│   ├── MediaGenerator.tsx  # 媒體生成元件
│   ├── PlanDisplay.tsx     # 課程計劃顯示
│   ├── PracticeDisplay.tsx # 練習題顯示
│   ├── ResourceDisplay.tsx # 資源顯示
│   └── Student*.tsx        # 學生相關元件
├── services/               # 服務層
│   └── geminiService.ts   # Gemini AI 服務
├── api/                    # Vercel Serverless Functions
│   ├── lesson-plan.ts      # 教案生成代理
│   ├── resource-support.ts # 資源方案代理
│   └── ...                 # 其他 AI 代理
├── server/                 # 後端共用邏輯
│   └── gemini.ts           # Gemini API 封裝
├── utils/                  # 工具函數
│   └── fileUtils.ts       # 檔案處理工具
├── .github/workflows/      # GitHub Actions 配置
│   └── deploy.yml         # 自動部署配置
├── App.tsx                # 主應用程式元件
├── index.tsx              # 應用程式入口
├── types.ts               # TypeScript 類型定義
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 專案依賴配置
```

## 🛠️ 技術棧

- **前端框架**: React 19.x
- **建置工具**: Vite 6.x
- **程式語言**: TypeScript 5.x
- **AI 服務**: Google Gemini API
- **樣式**: CSS Modules
- **文件處理**: Mammoth.js, html-docx-js
- **Markdown 渲染**: react-markdown, remark-math, rehype-katex

## 🚢 部署

### 部署到 GitHub Pages

本專案已配置 GitHub Actions 自動化部署流程:

1. **啟用 GitHub Pages**
   - 前往專案的 Settings > Pages
   - Source 選擇 "GitHub Actions"

2. **設定環境變數(可選)**
   - GitHub Pages 無法執行後端代理功能,AI 相關功能將不可用
   - 已在 workflow 設定 `VITE_BASE_PATH=/teacher-s-AI-helper/` 以支援子路徑部署

3. **觸發部署**
   - 推送程式碼到 `main` 分支會自動觸發部署
   - 或在 Actions 頁面手動觸發 workflow

4. **訪問網站**
   - 部署完成後,可透過 `https://kingway327.github.io/teacher-s-AI-helper/` 訪問

### 部署到其他平台

本專案也可輕鬆部署到其他平台:

- **Vercel**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kingway327/teacher-s-AI-helper)
- **Netlify**: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/kingway327/teacher-s-AI-helper)

### Vercel 環境變數

在 Vercel 專案設定中新增以下環境變數,以啟用後端代理:

- `GEMINI_API_KEY` (必填)
- `IMAGE_API_KEY` (選填)
- `VIDEO_API_KEY` (選填)
- `VITE_BASE_PATH` (選填,預設 `/`，若部署到子路徑需設定)

## 🔐 環境變數說明

| 變數名稱 | 必填 | 說明 |
|---------|------|------|
| `GEMINI_API_KEY` | 是 | Google Gemini API 金鑰,用於 AI 功能 |
| `IMAGE_API_KEY` | 否 | Imagen 影像模型 API 金鑰 |
| `VIDEO_API_KEY` | 否 | Veo 影片模型 API 金鑰 |

> ⚠️ **安全提醒**: 
> - 請勿將 `.env.local` 檔案提交到版本控制系統
> - API Key 應妥善保管,避免洩露
> - 生產環境請使用環境變數或 Secrets 管理

## 🤝 貢獻指南

歡迎貢獻程式碼、回報問題或提出建議!

1. Fork 本專案
2. 創建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📝 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- [Google Gemini AI](https://ai.google.dev/) - 提供強大的 AI 能力
- [React](https://react.dev/) - 優秀的前端框架
- [Vite](https://vitejs.dev/) - 快速的建置工具

## 📧 聯絡方式

如有任何問題或建議,歡迎透過以下方式聯絡:

- GitHub Issues: [提交問題](https://github.com/kingway327/teacher-s-AI-helper/issues)
- 專案連結: [https://github.com/kingway327/teacher-s-AI-helper](https://github.com/kingway327/teacher-s-AI-helper)

---

<div align="center">
Made with ❤️ by kingway327
</div>
