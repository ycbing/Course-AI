"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, ArrowRight, Sparkles, BookOpen, FileText, Video, Mic, CheckCircle } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const topic = searchParams.get("topic") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error === "CredentialsSignin" ? "邮箱或密码错误" : result.error);
      } else {
        toast.success("登录成功");
        if (topic) {
          router.push(`/create/step1?topic=${encodeURIComponent(topic)}`);
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      toast.error("登录失败");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: FileText, label: "AI 文案生成", desc: "GLM-4 自动生成教学文案" },
    { icon: BookOpen, label: "智能配图", desc: "CogView 教学插图" },
    { icon: Mic, label: "多音色配音", desc: "Edge-TTS 自然发音" },
    { icon: Video, label: "视频合成", desc: "一键合成 1080P 视频" },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
      <Toaster theme="light" position="top-center" />

      {/* Left panel - brand showcase (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.97 0.01 250 / 0.5), oklch(0.97 0.01 280 / 0.5))" }}>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-30" style={{ background: "oklch(0.55 0.15 250 / 0.5)" }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-30" style={{ background: "oklch(0.55 0.15 280 / 0.5)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: "var(--primary)", boxShadow: "0 4px 12px oklch(0.55 0.2 250 / 0.25)" }}>C</div>
            <span className="font-bold text-2xl tracking-tight" style={{ color: "var(--foreground)" }}>CourseAI</span>
          </div>
          <h2 className="text-3xl font-bold mb-3 leading-tight" style={{ color: "var(--foreground)" }}>
            AI 驱动的<br />
            <span className="text-gradient">课件创作平台</span>
          </h2>
          <p className="leading-relaxed max-w-md" style={{ color: "var(--muted-foreground)" }}>
            输入课程主题，AI 自动生成教学文案、配图、配音，一键合成教学视频。让每一位教师都能轻松制作高质量课件。
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "oklch(0.55 0.1 250 / 0.1)", color: "var(--primary)" }}>
                <f.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{f.label}</div>
                <div className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{f.desc}</div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-4">
            {["免费使用", "无需付费", "立即开始"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo (mobile only) */}
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: "var(--primary)" }}>C</div>
            <span className="font-bold text-xl tracking-tight" style={{ color: "var(--foreground)" }}>CourseAI</span>
          </div>

          <div className="rounded-xl border bg-white p-6" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}>
            {/* Gradient top decoration */}
            <div className="h-1 rounded-full -mt-6 mb-5 -mx-1" style={{ background: "linear-gradient(90deg, var(--primary), oklch(0.55 0.2 280))" }} />
            <h1 className="text-xl font-semibold mb-1" style={{ color: "var(--foreground)" }}>登录</h1>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>欢迎回来，继续你的课件创作</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                    className="w-full pl-10 pr-4 h-12 rounded-xl border bg-white text-sm placeholder:opacity-50 transition-all duration-200"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--background)" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.55 0.2 250 / 0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                    required />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full pl-10 pr-4 h-12 rounded-xl border bg-white text-sm placeholder:opacity-50 transition-all duration-200"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--background)" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.55 0.2 250 / 0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                    required />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl text-white font-medium text-sm transition-all duration-150 hover:-translate-y-px disabled:opacity-40"
                style={{ background: "var(--primary)", boxShadow: "0 4px 12px oklch(0.55 0.2 250 / 0.25)" }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-2">登录 <ArrowRight className="w-4 h-4" /></span>}
              </button>
            </form>

            {/* Social login placeholder */}
            <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs text-center mb-3" style={{ color: "var(--muted-foreground)" }}>其他登录方式</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 px-4 h-11 rounded-xl border bg-white text-xs transition-all duration-200 hover:shadow-sm"
                  style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                  <span>💬</span> 微信登录
                  <span className="text-[9px] px-1.5 py-0.5 rounded ml-auto" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>即将推出</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 h-11 rounded-xl border bg-white text-xs transition-all duration-200 hover:shadow-sm"
                  style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                  <span>🌐</span> Google
                  <span className="text-[9px] px-1.5 py-0.5 rounded ml-auto" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>即将推出</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm mt-5" style={{ color: "var(--muted-foreground)" }}>
            没有账号？ <Link href="/register" className="transition-colors duration-200" style={{ color: "var(--primary)" }}>注册</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
