"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles, ArrowRight, BookOpen, ImageIcon, Share2,
  ChevronRight, GraduationCap, Brain, Layers, Globe, Wand2,
  FileText, CheckCircle, Zap
} from "lucide-react";

/* ─── Hero Demo Animation ─── */
function HeroDemoAnimation() {
  const [activeStep, setActiveStep] = useState(0);

  const demoSteps = [
    { emoji: "📝", label: "输入课程主题", desc: "光合作用原理详解", detail: "生物 · 高中 · 5段大纲", color: "from-blue-50 to-blue-100/50" },
    { emoji: "✍️", label: "AI 生成文案", desc: "正在生成教学文案...", detail: "GLM-4 Flash · 结构化教学", color: "from-indigo-50 to-indigo-100/50" },
    { emoji: "🎨", label: "智能配图生成", desc: "为每段文案生成教学插图", detail: "CogView-3 · 教学插画风格", color: "from-purple-50 to-purple-100/50" },
    { emoji: "✅", label: "课件制作完成", desc: "10段教学 · 配图完成 · 可导出", detail: "PPT课件已就绪 · 一键分享", color: "from-emerald-50 to-emerald-100/50" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % demoSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [demoSteps.length]);

  const current = demoSteps[activeStep];
  const progress = ((activeStep + 1) / demoSteps.length) * 100;

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/60 via-indigo-100/40 to-cyan-100/40 rounded-3xl blur-2xl scale-105" />

      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
              <span>courseai.cn/create</span>
              <GraduationCap className="w-3 h-3 text-blue-500" />
            </div>
          </div>
          <div className="w-14" />
        </div>

        <div className="p-5 sm:p-8">
          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-6">
            <div
              key={activeStep}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 hero-progress"
              style={{ "--progress": `${progress}%` } as React.CSSProperties}
            />
          </div>

          {/* Animated step display */}
          <div
            key={activeStep}
            className={`rounded-xl bg-gradient-to-br ${current.color} border border-slate-200/60 p-5 sm:p-6 hero-step-enter`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{current.emoji}</span>
              <div>
                <div className="text-sm font-semibold text-slate-800">{current.label}</div>
                <div className="text-xs text-slate-500">{current.detail}</div>
              </div>
              <div className="ml-auto">
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                  {activeStep + 1}/{demoSteps.length}
                </span>
              </div>
            </div>

            {/* Simulated content area */}
            <div className="space-y-3">
              <div className="h-4 rounded bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-slate-200 to-slate-100 hero-typing-line" style={{ maxWidth: activeStep === 0 ? "80%" : "95%" }} />
              </div>
              <div className="h-3 rounded bg-slate-50 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-slate-100 to-slate-50 hero-typing-line" style={{ maxWidth: "70%", animationDelay: "0.3s" }} />
              </div>
              <div className="h-3 rounded bg-slate-50 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-slate-50 to-slate-100/30 hero-typing-line" style={{ maxWidth: "60%", animationDelay: "0.6s" }} />
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4 hero-fade-in-up">{current.desc}</p>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {demoSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === activeStep ? "w-6 bg-blue-500" : i < activeStep ? "w-1.5 bg-blue-400" : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Social Proof ─── */
function SocialProof() {
  const stats = [
    { value: "PPT", label: "精美课件导出" },
    { value: "∞", label: "无限创作空间" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-gradient-blue">{s.value}</div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Feature Tabs ─── */
const FEATURE_TABS = [
  {
    key: "script",
    label: "AI 文案",
    emoji: "✍️",
    title: "智能教学文案生成",
    desc: "基于 GLM-4 大模型，根据课程主题自动生成结构化教学文案。支持自定义段落数、逐段编辑、重新生成和 AI 润色优化。",
    features: ["GLM-4 Flash 高速生成", "3/5/8/10 段可选", "逐段编辑与排序", "AI 润色优化", "Markdown 格式输出"],
    color: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
  },
  {
    key: "image",
    label: "智能配图",
    emoji: "🎨",
    title: "教学插图自动生成",
    desc: "CogView-3-Plus 为每个教学段落自动生成风格统一的教学插图，支持自定义提示词和单张重生成。",
    features: ["CogView-3-Plus 引擎", "教学插画风格", "自定义风格提示词", "单张重新生成", "高清 1024x1024"],
    color: "from-indigo-50 to-purple-50",
    borderColor: "border-indigo-200",
  },
  {
    key: "ppt",
    label: "PPT 导出",
    emoji: "📊",
    title: "一键导出精美 PPT",
    desc: "将教学内容自动排版为精美 PPT 课件，支持多种模板风格选择，一键下载或在线分享。",
    features: ["自动排版", "多种模板风格", "一键下载 PPTX", "高清插图嵌入", "支持自定义样式"],
    color: "from-purple-50 to-pink-50",
    borderColor: "border-purple-200",
  },
  {
    key: "share",
    label: "在线分享",
    emoji: "🔗",
    title: "一键生成分享链接",
    desc: "课件生成后自动创建在线预览链接，学生无需安装软件即可浏览学习内容。",
    features: ["在线预览", "无需安装软件", "公开分享链接", "随时更新内容", "跨设备访问"],
    color: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
  },
];

function FeatureTabs() {
  const [activeTab, setActiveTab] = useState("script");
  const tab = FEATURE_TABS.find((t) => t.key === activeTab) || FEATURE_TABS[0];

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {FEATURE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === t.key
                ? `bg-white border ${t.borderColor} text-slate-800 shadow-lg shadow-blue-500/5`
                : "bg-white/60 border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700"
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        key={activeTab}
        className={`rounded-2xl border ${tab.borderColor} bg-gradient-to-br ${tab.color} p-6 sm:p-8 hero-step-enter`}
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: text */}
          <div className="flex-1">
            <div className="text-3xl mb-4">{tab.emoji}</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-slate-800">{tab.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">{tab.desc}</p>
            <ul className="space-y-2.5">
              {tab.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: screenshot placeholder */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="aspect-video rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <div className="text-center">
                <div className="text-4xl mb-2 opacity-30">{tab.emoji}</div>
                <p className="text-xs text-slate-400">功能截图</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Example Topics ─── */
const EXAMPLE_TOPICS = [
  { title: "光合作用的原理与过程", tag: "生物", tagColor: "bg-emerald-50 text-emerald-600 border-emerald-200", desc: "从光反应到暗反应，详解植物光合作用的完整过程", emoji: "🌿", subject: "biology" },
  { title: "二次函数的图像与性质", tag: "数学", tagColor: "bg-blue-50 text-blue-600 border-blue-200", desc: "通过图象理解二次函数的顶点、对称轴、开口方向等性质", emoji: "📐", subject: "math" },
  { title: "唐宋八大家之苏轼", tag: "语文", tagColor: "bg-orange-50 text-orange-600 border-orange-200", desc: "从《水调歌头》到《赤壁赋》，走进苏东坡的文学世界", emoji: "📜", subject: "chinese" },
  { title: "牛顿三大运动定律", tag: "物理", tagColor: "bg-purple-50 text-purple-600 border-purple-200", desc: "用生活实例深入浅出地解释牛顿三大定律", emoji: "🍎", subject: "physics" },
  { title: "英语时态完全攻略", tag: "英语", tagColor: "bg-cyan-50 text-cyan-600 border-cyan-200", desc: "系统讲解英语12种时态的构成和用法，配例句练习", emoji: "🔤", subject: "english" },
  { title: "中国近代史大事记", tag: "历史", tagColor: "bg-red-50 text-red-600 border-red-200", desc: "从鸦片战争到新中国成立，梳理中国近代百年风云", emoji: "🏛️", subject: "history" },
];

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Quick check if user is logged in by calling a lightweight API
    fetch("/api/user").then(r => r.ok).then(ok => setLoggedIn(ok)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden mobile-nav-spacer">
      {/* ─── Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              C
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">CourseAI</span>
            <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 font-medium">AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 ml-10 text-sm text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition">功能</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition">流程</a>
            <a href="#examples" className="hover:text-slate-900 transition">案例</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {loggedIn ? (
              <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition hidden sm:inline-block">进入工作台</Link>
            ) : (
              <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 transition hidden sm:inline-block">登录</Link>
            )}
            <Link
              href={loggedIn ? "/create" : "/login"}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20"
            >
              {loggedIn ? "创建课程" : "免费开始"}
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 sm:pt-44 pb-16 sm:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-100/60 via-indigo-100/30 to-transparent rounded-full blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex justify-center mb-8 animate-fade-up">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-200 bg-white shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span className="text-xs text-slate-600 font-medium">教育创新</span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-slate-500">AI 驱动课件创作</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto mb-10 animate-fade-up-delay-1">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6">
              <span className="text-gradient">AI驱动的</span>
              <br />
              <span className="text-slate-900">课件创作平台</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              输入课程主题，AI 自动生成教学文案、配图，一键导出 PPT 课件。让每一位教师都能轻松制作高质量课件。
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-4 mb-10 animate-fade-up-delay-2">
            <Link
              href={loggedIn ? "/create" : "/login"}
              className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 gradient-animated text-white font-semibold transition-all shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5" />
                开始创作
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <a
              href="#how-it-works"
              className="px-7 py-4 rounded-2xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all text-sm bg-white"
            >
              了解工作流程
            </a>
          </div>

          {/* Social proof */}
          <div className="mb-12 animate-fade-up-delay-2">
            <SocialProof />
          </div>

          {/* Demo animation */}
          <div className="animate-fade-up-delay-3 max-w-[95vw] sm:max-w-none">
            <HeroDemoAnimation />
          </div>
        </div>
      </section>

      {/* ─── Tech stack bar ─── */}
      <section className="border-y border-slate-200 py-8 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-slate-500">
            <span className="flex items-center gap-2"><Brain className="w-4 h-4 text-blue-500" /> GLM-4 AI文案</span>
            <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-indigo-500" /> CogView配图</span>
            <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-purple-500" /> PPT导出</span>
            <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-500" /> 在线分享</span>
          </div>
        </div>
      </section>

      {/* ─── Features with Tabs ─── */}
      <section id="features" className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-500 mb-4">
              <Layers className="w-3 h-3" /> 核心功能
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">AI赋能教学创作</h2>
            <p className="text-slate-500 max-w-lg mx-auto">从备课到成品，AI 全流程自动化</p>
          </div>

          <FeatureTabs />
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-24 sm:py-32 border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-500 mb-4 shadow-sm">
              <Wand2 className="w-3 h-3" /> 工作流程
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">四步完成课件制作</h2>
            <p className="text-slate-500">零门槛，AI 替你完成所有繁重工作</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01", emoji: "📝", title: "选择主题",
                desc: "输入课程主题、选择学科和年级，可提供大纲参考",
                detail: "支持10+学科、全年级覆盖",
                time: "约 30 秒",
              },
              {
                step: "02", emoji: "🤖", title: "AI 生成",
                desc: "AI 自动生成教学文案和配图，你只需等待和确认",
                detail: "文案可编辑，配图可重生成",
                time: "约 2-3 分钟",
              },
              {
                step: "03", emoji: "✏️", title: "编辑优化",
                desc: "审查和编辑 AI 生成的内容，调整配图和配音直到满意",
                detail: "支持逐段修改，灵活调整",
                time: "自由掌控",
              },
              {
                step: "04", emoji: "🚀", title: "导出 PPT",
                desc: "一键导出精美 PPT 课件，或生成在线分享链接发给学生",
                detail: "PPT / 在线分享链接",
                time: "约 1 分钟",
              },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-16 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-px">
                    <div className="w-full h-px bg-slate-200" />
                    <ChevronRight className="absolute -right-1 -top-[5px] w-2.5 h-2.5 text-slate-300" />
                  </div>
                )}
                <div className="text-center">
                  <div className="relative inline-flex mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/5">
                      {s.emoji}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/30">
                      {s.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-800">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto mb-3">{s.desc}</p>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[240px] mx-auto mb-2">{s.detail}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{s.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Example topics with enhanced actions ─── */}
      <section id="examples" className="py-24 sm:py-32 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-500 mb-4">
              <BookOpen className="w-3 h-3" /> 课程案例
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">试试这些教学主题</h2>
            <p className="text-slate-500">涵盖多学科、多年级 · 点击直接体验</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {EXAMPLE_TOPICS.map((e) => (
              <div
                key={e.title}
                className="group flex items-start gap-4 p-5 rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/50 card-hover cursor-pointer shadow-sm"
                onClick={() => {
                  window.location.href = loggedIn ? `/create?topic=${encodeURIComponent(e.title)}&subject=${e.subject}` : `/login?topic=${encodeURIComponent(e.title)}&subject=${e.subject}`;
                }}
              >
                <div className="text-2xl mt-0.5">{e.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold group-hover:text-blue-600 transition truncate">{e.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-2.5 line-clamp-2">{e.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${e.tagColor}`}>{e.tag}</span>
                    <span className="text-[10px] text-blue-500/60 group-hover:text-blue-600/100 transition flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      一键体验
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition mt-1 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 sm:py-32 border-t border-slate-200 bg-gradient-to-b from-blue-50/50 to-white relative overflow-hidden">
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="text-6xl mb-8 animate-float">🎓</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">开始你的第一个课件</h2>
          <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto">AI 帮你完成从文案到课件的全流程。让每一节课都精彩纷呈。</p>
          <Link
            href={loggedIn ? "/create" : "/login"}
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 gradient-animated text-white font-semibold text-lg transition-all shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            立即免费开始
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-slate-400 mt-5">免费使用 · 无需付费 · 立即开始创作</p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-900 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-[10px]">C</div>
              <span className="text-sm font-semibold text-slate-200">CourseAI</span>
              <span className="text-xs text-slate-500">— AI 课件创作平台</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <span>Powered by AI</span>
            </div>
          </div>
          <div className="text-center text-xs text-slate-600 mt-6">
            © {new Date().getFullYear()} CourseAI. Powered by AI
          </div>
        </div>
      </footer>
    </div>
  );
}
