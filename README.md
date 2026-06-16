<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js" />
  <a href="https://open.bigmodel.cn"><img src="https://img.shields.io/badge/GLM-4-Flash-orange" alt="GLM" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind" /></a>
  <a href="https://orm.drizzle.team"><img src="https://img.shields.io/badge/Drizzle-ORM-0C4A6E" alt="Drizzle" /></a>
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

<h1 align="center">CourseAI</h1>

<p align="center">
  <strong>AI 驱动的课程内容生成平台</strong><br/>
  输入主题，AI 自动生成教学文案、配图、配音、PPT — 几分钟完成一门课
</p>

## ✨ 功能亮点

- 📝 **AI 课程文案生成** — 输入主题，AI 自动生成结构化教学大纲和逐段文案
- 🎨 **AI 智能配图** — 每个章节自动生成教学配图，支持多种视觉风格
- 🔊 **多音色配音** — 讯飞 TTS + Edge-TTS 双引擎，男声/女声/童声可选
- 📊 **PPTX 导出** — 8 种视觉模板，一键导出专业 PPT 课件
- 📄 **PDF 导出** — A4 横版排版，封面+内容+封底
- 🧪 **AI 生成测验** — 根据课程内容自动生成选择题测验
- 📚 **教材模板** — 内置人教版教材大纲（生物/数学/物理/语文）
- 🔄 **提示词精调** — 支持对每张配图的提示词进行 AI 精调
- 💰 **积分系统** — 注册送积分，各操作扣积分，用量可控
- 🔗 **在线分享** — 生成分享链接，课程可公开访问
- 📱 **响应式设计** — 桌面端和移动端均可使用
- 🌙 **深色主题** — 支持深色/浅色主题切换

## 🎯 适用场景

| 角色 | 使用方式 |
|------|----------|
| 🎓 在线教育创作者 | 一键生成课程内容，大幅降低制作成本 |
| 📱 知识博主/自媒体 | 快速产出结构化知识内容 |
| 👨‍🏫 教师/培训师 | 辅助备课，自动生成教学材料 |
| 🏢 企业培训 | 快速制作内部培训课程 |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 14+
- pnpm

### 安装

```bash
git clone https://github.com/ycbing/course-ai.git
cd course-ai

cp .env.example .env.local
# 编辑 .env.local，填入 API Key

pnpm install
pnpm run db:push    # 初始化数据库
pnpm run dev
```

打开 [http://localhost:3005](http://localhost:3005)

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| [Next.js 16](https://nextjs.org/) | 全栈框架 (App Router, RSC) |
| [TypeScript 5](https://www.typescriptlang.org/) | 类型安全 |
| [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/) | 数据持久化 |
| [NextAuth v5](https://authjs.dev/) | 用户认证 (Credentials) |
| [智谱 GLM-4-Flash](https://open.bigmodel.cn/) | AI 文案生成 + 配图 |
| [讯飞 TTS](https://www.xfyun.cn/) | 语音合成 (WebSocket) |
| [Edge-TTS](https://github.com/BeyondDimension/SteamTools) | TTS 降级方案 |
| [pptxgenjs](https://gitbrent.github.io/PptxGenJS/) | PPTX 生成 |
| [PDFKit](https://pdfkit.org/) | PDF 导出 |
| [腾讯云 COS](https://cloud.tencent.com/product/cos) | 文件存储 |
| Tailwind CSS 4 | 样式系统 |

## 📁 项目结构

```
course-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/model-configs/   # 管理员模型配置
│   │   │   ├── auth/                  # 认证（登录/注册/OAuth）
│   │   │   ├── courses/               # 课程 CRUD
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── export-pdf/     # PDF 导出
│   │   │   │   │   ├── export-pptx/    # PPTX 导出
│   │   │   │   │   ├── generate/      # AI 内容生成
│   │   │   │   │   ├── generate-outline/ # 大纲生成
│   │   │   │   │   ├── generate-quiz/  # AI 测验生成
│   │   │   │   │   ├── illustrations/  # AI 配图
│   │   │   │   │   ├── refine-all-prompts/ # 批量精调提示词
│   │   │   │   │   ├── sections/      # 章节管理
│   │   │   │   │   └── voiceover/     # 配音生成
│   │   │   ├── credits/               # 积分系统
│   │   │   ├── share/                 # 课程分享
│   │   │   ├── uploads/               # COS 代理
│   │   │   ├── usage-logs/            # 使用记录
│   │   │   └── user/model-configs/    # 用户模型配置
│   │   ├── create/                    # 课程创建（5 步流程）
│   │   ├── course/[id]/               # 课程详情 + 测验
│   │   ├── dashboard/                 # 用户仪表盘
│   │   ├── login/ / register/         # 登录注册
│   │   ├── settings/                  # 设置（模型配置/统计）
│   │   └── share/[token]/             # 公开分享页
│   ├── components/
│   │   ├── create/                    # 创建步骤组件 (step1-step5)
│   │   │   ├── step1-form.tsx         # 课程信息（8 个快速模板）
│   │   │   ├── step1.tsx              # 主题/学段/科目/教材模板
│   │   │   ├── step2.tsx              # AI 文案生成 + 编辑 + 排序
│   │   │   ├── step3.tsx              # AI 配图 + 提示词精调
│   │   │   ├── step4.tsx              # 配音生成 + 音色选择
│   │   │   └── step5.tsx              # PPTX/PDF 导出 + 分享
│   │   └── ui/                        # 基础 UI 组件
│   ├── data/
│   │   ├── textbook-templates.ts      # 教材模板（人教版大纲）
│   │   └── visual-templates.ts        # PPTX 视觉模板（8 种）
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── glm-client.ts          # 智谱 GLM 客户端
│   │   │   ├── pptx-generator.ts      # PPTX 生成器
│   │   │   └── tts.ts                 # 讯飞 TTS + Edge-TTS
│   │   ├── db/
│   │   │   ├── schema.ts              # Drizzle 数据模型
│   │   │   └── index.ts               # 数据库连接
│   │   └── cos.ts                     # 腾讯云 COS 工具
│   └── types/                         # TypeScript 类型
├── drizzle/                            # Drizzle migrations
├── migrations/                         # SQL migrations
└── public/                             # 静态资源
```

## 🎨 PPTX 视觉模板

| 模板 | 风格 |
|------|------|
| 经典课堂 | 传统教育风格，蓝色主调 |
| 科技未来 | 科技感，深色背景 + 霓虹色 |
| 手绘风格 | 手绘黑板风，温暖亲切 |
| 中国风 | 水墨元素，古典韵味 |
| 卡通风格 | 可爱卡通，适合低年级 |
| 极简黑白 | 简约学术风格 |
| 自然绿意 | 自然清新，环保主题 |
| 星空探索 | 宇宙主题，深蓝星空 |

## 📚 内置教材模板

基于人教版教材大纲，覆盖：

- **生物** — 高一必修1：分子与细胞（6 章 30+ 知识点）
- **数学** — 高一必修1：集合/函数/三角（6 章 35+ 知识点）
- **物理** — 高一必修1：运动/力学（6 章 30+ 知识点）
- **语文** — 高考总复习：古诗词/文言文/现代文（6 章）

## 📊 数据库

| 表 | 说明 |
|----|------|
| `users` | 用户信息 |
| `accounts` | OAuth 账户 |
| `courses` | 课程（标题/科目/学段/大纲/配音/状态） |
| `course_sections` | 章节（标题/内容/配图/配音/SRT） |
| `credits` | 积分记录 |
| `usage_logs` | 使用日志 |
| `model_configs` | 全局模型配置 |
| `user_model_configs` | 用户模型配置（自带 Key） |

## ⚙️ 环境变量

### 必需

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 |
| `NEXTAUTH_SECRET` | 认证密钥 |
| `GLM_API_KEY` | 智谱 API Key |
| `GLM_BASE_URL` | 智谱 API 地址 |

### 可选

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `LLM_MODEL` | 文案生成模型 | `glm-4-flash` |
| `IMAGE_MODEL` | 配图模型 | `cogview-3-plus` |
| `IMAGE_PROVIDER` | 图片服务提供商 | `cogview` |
| `DASHSCOPE_API_KEY` | 阿里百炼 API Key | — |
| `COS_SECRET_ID` | 腾讯云 COS SecretId | — |
| `COS_SECRET_KEY` | 腾讯云 COS SecretKey | — |
| `COS_BUCKET` | COS 存储桶 | — |
| `COS_REGION` | COS 区域 | `ap-shanghai` |

## 🔗 友情链接

[Linux.do](https://linux.do/) · [SketchToArt](https://github.com/ycbing/sketch-to-art)

## 📄 License

[MIT](./LICENSE)
