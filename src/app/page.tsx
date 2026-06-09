"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles, ArrowRight, BookOpen, ImageIcon, Share2,
  GraduationCap, Brain, Layers, Globe, Wand2,
  FileText, CheckCircle, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/* ─── Hero Demo Animation ─── */
function HeroDemoAnimation() {
  const [activeStep, setActiveStep] = useState(0);

  const demoSteps = [
    { emoji: "📝", label: "输入课程主题", desc: "光合作用原理详解", detail: "生物 · 高中 · 5段大纲", color: "from-neutral-50 to-neutral-100/50" },
    { emoji: "✍️", label: "AI 生成文案", desc: "正在生成教学文案...", detail: "GLM-4 Flash · 结构化教学", color: "from-neutral-100 to-neutral-100/50" },
    { emoji: "🎨", label: "智能配图生成", desc: "为每段文案生成教学插图", detail: "CogView-3 · 教学插画风格", color: "from-neutral-100 to-neutral-200/30" },
    { emoji: "✅", label: "课件制作完成", desc: "10段教学 · 配图完成 · 可导出", detail: "PPT课件已就绪 · 一键分享", color: "from-neutral-50 to-neutral-50/50" },
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
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-100/60 via-neutral-100/40 to-neutral-50/20 rounded-2xl blur-2xl scale-105 opacity-60" />

      <div className="relative rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-neutral-300" />
            <div className="w-3 h-3 rounded-full bg-neutral-300" />
            <div className="w-3 h-3 rounded-full bg-neutral-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-lg text-[11px] flex items-center gap-2 bg-neutral-100 text-neutral-500">
              <span>courseai.cn/create</span>
              <GraduationCap className="w-3 h-3 text-neutral-400" />
            </div>
          </div>
          <div className="w-14" />
        </div>

        <div className="p-5 sm:p-8">
          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden mb-6 bg-neutral-100">
            <div
              key={activeStep}
              className="h-full rounded-full hero-progress bg-neutral-900"
              style={{ "--progress": `${progress}%` } as React.CSSProperties}
            />
          </div>

          {/* Animated step display */}
          <div
            key={activeStep}
            className={`rounded-xl bg-gradient-to-br ${current.color} border border-neutral-200 p-5 sm:p-6 hero-step-enter`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{current.emoji}</span>
              <div>
                <div className="text-sm font-semibold text-neutral-900">{current.label}</div>
                <div className="text-xs text-neutral-400">{current.detail}</div>
              </div>
              <div className="ml-auto">
                <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-500">
                  {activeStep + 1}/{demoSteps.length}
                </span>
              </div>
            </div>

            {/* Simulated content area */}
            <div className="space-y-3">
              <div className="h-4 rounded overflow-hidden bg-neutral-100">
                <div className="h-full hero-typing-line bg-neutral-200" style={{ maxWidth: activeStep === 0 ? "80%" : "95%" }} />
              </div>
              <div className="h-3 rounded overflow-hidden bg-neutral-100">
                <div className="h-full hero-typing-line bg-neutral-100" style={{ maxWidth: "70%", animationDelay: "0.3s" }} />
              </div>
              <div className="h-3 rounded overflow-hidden bg-neutral-100">
                <div className="h-full hero-typing-line bg-neutral-200" style={{ maxWidth: "60%", animationDelay: "0.6s" }} />
              </div>
            </div>

            <p className="text-xs mt-4 hero-fade-in-up text-neutral-400">{current.desc}</p>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {demoSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === activeStep ? "w-6" : "w-1.5"
                }`}
                style={{ backgroundColor: i <= activeStep ? "oklch(0.35 0 0)" : "oklch(0.90 0 0)" }}
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
          <div className="text-xl sm:text-2xl font-bold text-neutral-900">{s.value}</div>
          <div className="text-[10px] sm:text-xs mt-1 text-neutral-400">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Feature Cards ─── */
const FEATURES = [
  { emoji: "✍️", title: "AI 教学文案", desc: "基于 GLM-4 大模型，根据课程主题自动生成结构化教学文案，支持逐段编辑和 AI 润色优化。" },
  { emoji: "🎨", title: "智能配图生成", desc: "CogView-3 为每个教学段落自动生成教学插图，支持自定义风格和单张重新生成。" },
  { emoji: "📊", title: "一键导出 PPT", desc: "将教学内容自动排版为精美 PPT 课件，支持多种模板风格选择。" },
  { emoji: "🔗", title: "在线分享", desc: "课件生成后自动创建在线预览链接，学生无需安装软件即可浏览。" },
  { emoji: "🎯", title: "随堂测验", desc: "AI 根据教学内容自动生成测验题目，支持选择题、判断题等多种题型。" },
  { emoji: "📚", title: "多学科覆盖", desc: "支持数学、语文、英语、物理、化学、生物等 10+ 学科，全年级覆盖。" },
];

function FeatureSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {FEATURES.map((f, i) => (
        <Card key={f.title} className="group relative p-8 transition-all duration-150 hover:shadow cursor-default">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-5 text-lg">
            {f.emoji}
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">{f.title}</h3>
          <p className="text-sm leading-relaxed text-neutral-500">{f.desc}</p>
        </Card>
      ))}
    </div>
  );
}

/* ─── How it works ─── */
const WORKFLOW_STEPS = [
  { num: "01", title: "选择主题", desc: "输入课程主题、选择学科和年级", detail: "10+ 学科 · 全年级" },
  { num: "02", title: "AI 生成", desc: "AI 自动生成教学文案和配图", detail: "文案可编辑 · 配图可重生成" },
  { num: "03", title: "编辑优化", desc: "审查和编辑内容，调整配图和配音", detail: "逐段修改 · 灵活调整" },
  { num: "04", title: "导出 PPT", desc: "一键导出精美 PPT，或生成分享链接", detail: "PPT / 在线分享" },
];

function WorkflowSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {WORKFLOW_STEPS.map((s, i) => (
        <div key={s.num} className="relative text-center">
          {i < 3 && (
            <div className="hidden lg:block absolute top-10 left-[calc(50%+36px)] right-[calc(-50%+36px)]">
              <div className="h-px w-full border-t border-dashed border-neutral-200" />
            </div>
          )}
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-3xl shadow-sm">
              <span className="text-2xl font-bold text-neutral-900">{s.num}</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">{s.title}</h3>
          <p className="text-sm leading-relaxed text-neutral-500 max-w-[240px] mx-auto mb-3">{s.desc}</p>
          <p className="text-xs leading-relaxed text-neutral-400 max-w-[240px] mx-auto">{s.detail}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Example Topics ─── */
const EXAMPLE_TOPICS = [
  { title: "光合作用的原理与过程", tag: "生物", tagColor: "bg-neutral-100 text-neutral-500 border-neutral-200", desc: "从光反应到暗反应，详解植物光合作用的完整过程", emoji: "🌿", subject: "biology" },
  { title: "二次函数的图像与性质", tag: "数学", tagColor: "bg-neutral-100 text-neutral-500 border-neutral-200", desc: "通过图象理解二次函数的顶点、对称轴、开口方向等性质", emoji: "📐", subject: "math" },
  { title: "唐宋八大家之苏轼", tag: "语文", tagColor: "bg-neutral-100 text-neutral-500 border-neutral-200", desc: "从《水调歌头》到《赤壁赋》，走进苏东坡的文学世界", emoji: "📜", subject: "chinese" },
  { title: "牛顿三大运动定律", tag: "物理", tagColor: "bg-neutral-100 text-neutral-500 border-neutral-200", desc: "用生活实例深入浅出地解释牛顿三大定律", emoji: "🍎", subject: "physics" },
  { title: "英语时态完全攻略", tag: "英语", tagColor: "bg-neutral-100 text-neutral-500 border-neutral-200", desc: "系统讲解英语12种时态的构成和用法，配例句练习", emoji: "🔤", subject: "english" },
  { title: "中国近代史大事记", tag: "历史", tagColor: "bg-neutral-100 text-neutral-500 border-neutral-200", desc: "从鸦片战争到新中国成立，梳理中国近代百年风云", emoji: "🏛️", subject: "history" },
];

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/user").then(r => r.ok).then(ok => setLoggedIn(ok)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden mobile-nav-spacer bg-white">
      {/* ─── Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
            <span className="font-bold text-lg tracking-tight text-neutral-900">CourseAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 ml-10 text-sm text-neutral-400">
            <a href="#features" className="hover:text-neutral-900 transition-colors duration-150">功能</a>
            <a href="#how-it-works" className="hover:text-neutral-900 transition-colors duration-150">流程</a>
            <a href="#examples" className="hover:text-neutral-900 transition-colors duration-150">案例</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {loggedIn ? (
              <Link href="/dashboard" className="text-sm hidden sm:inline-block text-neutral-400 hover:text-neutral-900 transition-colors duration-150">进入工作台</Link>
            ) : (
              <Link href="/login" className="text-sm hidden sm:inline-block text-neutral-400 hover:text-neutral-900 transition-colors duration-150">登录</Link>
            )}
            <Link href={loggedIn ? "/create" : "/login"}>
              <Button size="lg">
                {loggedIn ? "创建课程" : "免费开始"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 sm:pt-44 pb-16 sm:pb-24 bg-gradient-to-b from-primary-50/30 to-white">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex justify-center mb-8 animate-fade-up">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-neutral-200 bg-white shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "oklch(0.35 0 0)" }} />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-900" />
              </span>
              <span className="text-xs font-medium text-neutral-900">教育创新</span>
              <span className="text-xs text-neutral-300">·</span>
              <span className="text-xs text-neutral-400">AI 驱动课件创作</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto mb-10 animate-fade-up-delay-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight text-neutral-900 mb-6">
              AI驱动的
              <br />
              课件创作平台
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed text-neutral-500">
              输入课程主题，AI 自动生成教学文案、配图，一键导出 PPT 课件。让每一位教师都能轻松制作高质量课件。
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-4 mb-10 animate-fade-up-delay-2">
            <Link href={loggedIn ? "/create" : "/login"}>
              <Button size="lg">
                <Sparkles className="w-5 h-5" />
                开始创作
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg">
                了解工作流程
              </Button>
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
      <section className="border-y border-neutral-200 py-8 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-neutral-400">
            <span className="flex items-center gap-2"><Brain className="w-4 h-4 text-neutral-500" /> GLM-4 AI文案</span>
            <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-neutral-500" /> CogView配图</span>
            <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-neutral-500" /> PPT导出</span>
            <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-neutral-500" /> 在线分享</span>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20 lg:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-label mb-4 flex items-center justify-center gap-2">
              <Layers className="w-3 h-3" /> 核心功能
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">AI赋能教学创作</h2>
            <p className="text-neutral-500 max-w-lg mx-auto">从备课到成品，AI 全流程自动化</p>
          </div>
          <FeatureSection />
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-20 lg:py-32 border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-label mb-4 flex items-center justify-center gap-2">
              <Wand2 className="w-3 h-3" /> 工作流程
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">四步完成课件制作</h2>
            <p className="text-neutral-500">零门槛，AI 替你完成所有繁重工作</p>
          </div>
          <WorkflowSection />
        </div>
      </section>

      {/* ─── Example topics ─── */}
      <section id="examples" className="py-20 lg:py-32 border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-label mb-4 flex items-center justify-center gap-2">
              <BookOpen className="w-3 h-3" /> 课程案例
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">试试这些教学主题</h2>
            <p className="text-neutral-500">涵盖多学科、多年级 · 点击直接体验</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto stagger-children">
            {EXAMPLE_TOPICS.map((e) => (
              <div
                key={e.title}
                className="group flex items-start gap-4 p-5 rounded-xl border border-neutral-200 bg-white cursor-pointer transition-all duration-150 hover:shadow hover:bg-neutral-50"
                onClick={() => {
                  window.location.href = loggedIn ? `/create?topic=${encodeURIComponent(e.title)}&subject=${e.subject}` : `/login?topic=${encodeURIComponent(e.title)}&subject=${e.subject}`;
                }}
              >
                <div className="text-2xl mt-0.5">{e.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold text-neutral-900 truncate">{e.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-500 mb-2.5 line-clamp-2">{e.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${e.tagColor}`}>{e.tag}</span>
                    <span className="text-[10px] flex items-center gap-1 text-neutral-400">
                      <Zap className="w-3 h-3" />
                      一键体验
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 lg:py-32 border-t border-neutral-200 relative overflow-hidden bg-gradient-to-b from-neutral-50 to-white">
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <div className="text-6xl mb-8 animate-float">🎓</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">开始你的第一个课件</h2>
          <p className="text-lg mb-10 max-w-lg mx-auto text-neutral-500">AI 帮你完成从文案到课件的全流程。让每一节课都精彩纷呈。</p>
          <Link href={loggedIn ? "/create" : "/login"}>
            <Button size="lg" className="text-lg px-10">
              <Sparkles className="w-5 h-5" />
              立即免费开始
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <p className="text-xs mt-5 text-neutral-400">免费使用 · 无需付费 · 立即开始创作</p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-neutral-950 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-white font-bold text-[10px]">
                C
              </div>
              <span className="text-sm font-semibold text-neutral-300">CourseAI</span>
              <span className="text-xs text-neutral-600">— AI 课件创作平台</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-neutral-600">
              <span>Powered by AI</span>
            </div>
          </div>
          <div className="text-center text-xs mt-6 text-neutral-700">
            © {new Date().getFullYear()} CourseAI. Powered by AI
          </div>
        </div>
      </footer>
    </div>
  );
}
