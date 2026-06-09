"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles, ArrowRight, BookOpen, ImageIcon, Share2,
  GraduationCap, Brain, Layers, Globe, Wand2,
  FileText, CheckCircle, Zap
} from "lucide-react";

/* ─── Hero Demo Animation ─── */
function HeroDemoAnimation() {
  const [activeStep, setActiveStep] = useState(0);

  const demoSteps = [
    { emoji: "📝", label: "输入课程主题", desc: "光合作用原理详解", detail: "生物 · 高中 · 5段大纲", color: "from-primary-50 to-primary-100/50" },
    { emoji: "✍️", label: "AI 生成文案", desc: "正在生成教学文案...", detail: "GLM-4 Flash · 结构化教学", color: "from-primary-100 to-primary-200/50" },
    { emoji: "🎨", label: "智能配图生成", desc: "为每段文案生成教学插图", detail: "CogView-3 · 教学插画风格", color: "from-primary-200 to-primary-300/50" },
    { emoji: "✅", label: "课件制作完成", desc: "10段教学 · 配图完成 · 可导出", detail: "PPT课件已就绪 · 一键分享", color: "from-accent-50 to-accent-50/50" },
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
      <div className="absolute inset-0 bg-gradient-to-r from-primary-100/60 via-primary-200/40 to-accent-400/20 rounded-2xl blur-2xl scale-105 opacity-60" />

      <div className="relative rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>
        {/* Title bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-accent-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-lg text-[11px] flex items-center gap-2" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
              <span>courseai.cn/create</span>
              <GraduationCap className="w-3 h-3" style={{ color: "var(--primary)" }} />
            </div>
          </div>
          <div className="w-14" />
        </div>

        <div className="p-5 sm:p-8">
          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden mb-6" style={{ backgroundColor: "var(--muted)" }}>
            <div
              key={activeStep}
              className="h-full rounded-full hero-progress"
              style={{
                "--progress": `${progress}%`,
                background: `linear-gradient(90deg, oklch(0.55 0.2 250), oklch(0.55 0.2 280), oklch(0.65 0.15 200))`,
              } as React.CSSProperties}
            />
          </div>

          {/* Animated step display */}
          <div
            key={activeStep}
            className={`rounded-xl bg-gradient-to-br ${current.color} border p-5 sm:p-6 hero-step-enter`}
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{current.emoji}</span>
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{current.label}</div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{current.detail}</div>
              </div>
              <div className="ml-auto">
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                  {activeStep + 1}/{demoSteps.length}
                </span>
              </div>
            </div>

            {/* Simulated content area */}
            <div className="space-y-3">
              <div className="h-4 rounded overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                <div className="h-full hero-typing-line" style={{ maxWidth: activeStep === 0 ? "80%" : "95%", backgroundColor: "var(--secondary)" }} />
              </div>
              <div className="h-3 rounded overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                <div className="h-full hero-typing-line" style={{ maxWidth: "70%", animationDelay: "0.3s", backgroundColor: "var(--muted)" }} />
              </div>
              <div className="h-3 rounded overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
                <div className="h-full hero-typing-line" style={{ maxWidth: "60%", animationDelay: "0.6s", backgroundColor: "var(--secondary)" }} />
              </div>
            </div>

            <p className="text-xs mt-4 hero-fade-in-up" style={{ color: "var(--muted-foreground)" }}>{current.desc}</p>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {demoSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === activeStep ? "w-6" : "w-1.5"
                }`}
                style={{ backgroundColor: i <= activeStep ? "var(--primary)" : "var(--muted)" }}
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
          <div className="text-[10px] sm:text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
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
        <div
          key={f.title}
          className="group relative rounded-xl border bg-white p-6 transition-all duration-200 hover:shadow hover:-translate-y-0.5 cursor-default"
          style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-sm)", animationDelay: `${i * 100}ms` }}
        >
          {/* Gradient top bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, oklch(0.55 0.2 250), oklch(0.65 0.2 150))` }} />
          <span className="text-3xl mb-4 block">{f.emoji}</span>
          <h3 className="text-base font-semibold mb-2" style={{ color: "var(--foreground)" }}>{f.title}</h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{f.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── How it works ─── */
const WORKFLOW_STEPS = [
  { num: "01", emoji: "📝", title: "选择主题", desc: "输入课程主题、选择学科和年级，可提供大纲参考", detail: "10+ 学科 · 全年级覆盖" },
  { num: "02", emoji: "🤖", title: "AI 生成", desc: "AI 自动生成教学文案和配图，你只需等待和确认", detail: "文案可编辑，配图可重生成" },
  { num: "03", emoji: "✏️", title: "编辑优化", desc: "审查和编辑 AI 生成的内容，调整配图和配音直到满意", detail: "支持逐段修改，灵活调整" },
  { num: "04", emoji: "🚀", title: "导出 PPT", desc: "一键导出精美 PPT 课件，或生成在线分享链接发给学生", detail: "PPT / 在线分享链接" },
];

function WorkflowSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {WORKFLOW_STEPS.map((s, i) => (
        <div key={s.num} className="relative text-center">
          {i < 3 && (
            <div className="hidden lg:block absolute top-10 left-[calc(50%+36px)] right-[calc(-50%+36px)]">
              <div className="h-px w-full border-t-2 border-dashed" style={{ borderColor: "var(--border)" }} />
            </div>
          )}
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white border flex items-center justify-center text-3xl" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}>
              {s.emoji}
            </div>
            <div
              className="absolute -top-2 -right-2 w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "var(--primary)", boxShadow: "0 4px 12px oklch(0.55 0.2 250 / 0.3)" }}
            >
              {s.num}
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--foreground)" }}>{s.title}</h3>
          <p className="text-sm leading-relaxed max-w-[240px] mx-auto mb-3" style={{ color: "var(--muted-foreground)" }}>{s.desc}</p>
          <p className="text-xs leading-relaxed max-w-[240px] mx-auto mb-2" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>{s.detail}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Example Topics ─── */
const EXAMPLE_TOPICS = [
  { title: "光合作用的原理与过程", tag: "生物", tagColor: "bg-accent-50 text-accent-600 border-accent-400/30", desc: "从光反应到暗反应，详解植物光合作用的完整过程", emoji: "🌿", subject: "biology" },
  { title: "二次函数的图像与性质", tag: "数学", tagColor: "bg-primary-50 text-primary-600 border-primary-200", desc: "通过图象理解二次函数的顶点、对称轴、开口方向等性质", emoji: "📐", subject: "math" },
  { title: "唐宋八大家之苏轼", tag: "语文", tagColor: "bg-orange-50 text-orange-600 border-orange-200", desc: "从《水调歌头》到《赤壁赋》，走进苏东坡的文学世界", emoji: "📜", subject: "chinese" },
  { title: "牛顿三大运动定律", tag: "物理", tagColor: "bg-purple-50 text-purple-600 border-purple-200", desc: "用生活实例深入浅出地解释牛顿三大定律", emoji: "🍎", subject: "physics" },
  { title: "英语时态完全攻略", tag: "英语", tagColor: "bg-cyan-50 text-cyan-600 border-cyan-200", desc: "系统讲解英语12种时态的构成和用法，配例句练习", emoji: "🔤", subject: "english" },
  { title: "中国近代史大事记", tag: "历史", tagColor: "bg-red-50 text-red-600 border-red-200", desc: "从鸦片战争到新中国成立，梳理中国近代百年风云", emoji: "🏛️", subject: "history" },
];

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/user").then(r => r.ok).then(ok => setLoggedIn(ok)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden mobile-nav-spacer" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {/* ─── Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "var(--primary)", boxShadow: "0 4px 12px oklch(0.55 0.2 250 / 0.25)" }}
            >
              C
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: "var(--foreground)" }}>CourseAI</span>
            <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: "oklch(0.55 0.15 250 / 0.08)", color: "oklch(0.5 0.18 250)", border: "1px solid oklch(0.55 0.15 250 / 0.15)" }}>AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 ml-10 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <a href="#features" className="hover:text-[--foreground] transition-colors duration-200">功能</a>
            <a href="#how-it-works" className="hover:text-[--foreground] transition-colors duration-200">流程</a>
            <a href="#examples" className="hover:text-[--foreground] transition-colors duration-200">案例</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {loggedIn ? (
              <Link href="/dashboard" className="text-sm hidden sm:inline-block transition-colors duration-200 hover:text-[--foreground]" style={{ color: "var(--muted-foreground)" }}>进入工作台</Link>
            ) : (
              <Link href="/login" className="text-sm hidden sm:inline-block transition-colors duration-200 hover:text-[--foreground]" style={{ color: "var(--muted-foreground)" }}>登录</Link>
            )}
            <Link
              href={loggedIn ? "/create" : "/login"}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-150 hover:-translate-y-px"
              style={{ background: "var(--primary)", boxShadow: "0 4px 12px oklch(0.55 0.2 250 / 0.25)" }}
            >
              {loggedIn ? "创建课程" : "免费开始"}
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 sm:pt-44 pb-16 sm:pb-24" style={{ background: "linear-gradient(180deg, oklch(0.97 0.01 250 / 0.5) 0%, var(--background) 100%)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[100px] pointer-events-none opacity-40" style={{ background: "radial-gradient(ellipse, oklch(0.55 0.15 250 / 0.3), transparent 70%)" }} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex justify-center mb-8 animate-fade-up">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border bg-white" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full" style={{ backgroundColor: "oklch(0.55 0.2 250)", opacity: 0.75 }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "var(--primary)" }} />
              </span>
              <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>教育创新</span>
              <span className="text-xs" style={{ color: "var(--border)" }}>·</span>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>AI 驱动课件创作</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto mb-10 animate-fade-up-delay-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6">
              <span className="text-gradient">AI驱动的</span>
              <br />
              <span>课件创作平台</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              输入课程主题，AI 自动生成教学文案、配图，一键导出 PPT 课件。让每一位教师都能轻松制作高质量课件。
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-4 mb-10 animate-fade-up-delay-2">
            <Link
              href={loggedIn ? "/create" : "/login"}
              className="group relative px-8 py-4 rounded-2xl text-white font-semibold transition-all duration-150 hover:-translate-y-px active:scale-[0.98] gradient-animated"
              style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 250), oklch(0.55 0.2 280), oklch(0.55 0.15 200))", boxShadow: "0 8px 24px oklch(0.55 0.2 250 / 0.25)" }}
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5" />
                开始创作
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Link>
            <a
              href="#how-it-works"
              className="px-7 py-4 rounded-2xl border bg-white text-sm font-medium transition-all duration-200 hover:shadow-sm"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
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
      <section className="border-y py-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <span className="flex items-center gap-2"><Brain className="w-4 h-4" style={{ color: "var(--primary)" }} /> GLM-4 AI文案</span>
            <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" style={{ color: "oklch(0.55 0.15 280)" }} /> CogView配图</span>
            <span className="flex items-center gap-2"><FileText className="w-4 h-4" style={{ color: "oklch(0.55 0.15 290)" }} /> PPT导出</span>
            <span className="flex items-center gap-2"><Globe className="w-4 h-4" style={{ color: "var(--accent)" }} /> 在线分享</span>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-4 border bg-white" style={{ color: "var(--muted-foreground)", borderColor: "var(--border)" }}>
              <Layers className="w-3 h-3" /> 核心功能
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--foreground)" }}>AI赋能教学创作</h2>
            <p className="max-w-lg mx-auto" style={{ color: "var(--muted-foreground)" }}>从备课到成品，AI 全流程自动化</p>
          </div>
          <FeatureSection />
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-20 lg:py-28 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-4 border bg-white" style={{ color: "var(--muted-foreground)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <Wand2 className="w-3 h-3" /> 工作流程
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--foreground)" }}>四步完成课件制作</h2>
            <p style={{ color: "var(--muted-foreground)" }}>零门槛，AI 替你完成所有繁重工作</p>
          </div>
          <WorkflowSection />
        </div>
      </section>

      {/* ─── Example topics ─── */}
      <section id="examples" className="py-20 lg:py-28 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-4 border bg-white" style={{ color: "var(--muted-foreground)", borderColor: "var(--border)" }}>
              <BookOpen className="w-3 h-3" /> 课程案例
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--foreground)" }}>试试这些教学主题</h2>
            <p style={{ color: "var(--muted-foreground)" }}>涵盖多学科、多年级 · 点击直接体验</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto stagger-children">
            {EXAMPLE_TOPICS.map((e) => (
              <div
                key={e.title}
                className="group flex items-start gap-4 p-5 rounded-xl border bg-white cursor-pointer transition-all duration-200 hover:shadow hover:-translate-y-0.5"
                style={{ borderColor: "var(--border)" }}
                onClick={() => {
                  window.location.href = loggedIn ? `/create?topic=${encodeURIComponent(e.title)}&subject=${e.subject}` : `/login?topic=${encodeURIComponent(e.title)}&subject=${e.subject}`;
                }}
              >
                <div className="text-2xl mt-0.5">{e.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold truncate transition-colors duration-200" style={{ color: "var(--foreground)" }}>{e.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed mb-2.5 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{e.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${e.tagColor}`}>{e.tag}</span>
                    <span className="text-[10px] flex items-center gap-1 transition-colors duration-200" style={{ color: "oklch(0.55 0.15 250 / 0.6)" }}>
                      <Zap className="w-3 h-3" />
                      一键体验
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0 transition-all duration-200" style={{ color: "var(--border)" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 lg:py-28 border-t relative overflow-hidden" style={{ borderColor: "var(--border)", background: "linear-gradient(180deg, oklch(0.55 0.1 250 / 0.08), var(--background))" }}>
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <div className="text-6xl mb-8 animate-float">🎓</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--foreground)" }}>开始你的第一个课件</h2>
          <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: "var(--muted-foreground)" }}>AI 帮你完成从文案到课件的全流程。让每一节课都精彩纷呈。</p>
          <Link
            href={loggedIn ? "/create" : "/login"}
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-150 hover:-translate-y-px active:scale-[0.98] gradient-animated"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 250), oklch(0.55 0.2 280), oklch(0.55 0.15 200))", boxShadow: "0 8px 24px oklch(0.55 0.2 250 / 0.25)" }}
          >
            <Sparkles className="w-5 h-5" />
            立即免费开始
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <p className="text-xs mt-5" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>免费使用 · 无需付费 · 立即开始创作</p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ backgroundColor: "oklch(0.15 0.02 250)", color: "oklch(0.7 0.01 250)" }} className="py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px]"
                style={{ background: "var(--primary)" }}
              >
                C
              </div>
              <span className="text-sm font-semibold" style={{ color: "oklch(0.85 0.01 250)" }}>CourseAI</span>
              <span className="text-xs" style={{ color: "oklch(0.55 0.01 250)" }}>— AI 课件创作平台</span>
            </div>
            <div className="flex items-center gap-6 text-xs" style={{ color: "oklch(0.55 0.01 250)" }}>
              <span>Powered by AI</span>
            </div>
          </div>
          <div className="text-center text-xs mt-6" style={{ color: "oklch(0.45 0.01 250)" }}>
            © {new Date().getFullYear()} CourseAI. Powered by AI
          </div>
        </div>
      </footer>
    </div>
  );
}
