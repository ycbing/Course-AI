"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, ArrowRight, Sparkles, BookOpen, FileText, Video, Mic, CheckCircle } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" /></div>}>
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
    <div className="min-h-screen bg-slate-50 flex">
      <Toaster theme="light" position="top-center" />

      {/* Left panel - brand showcase (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-200/30 rounded-full blur-[100px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">C</div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">CourseAI</span>
          </div>
          <h2 className="text-3xl font-bold mb-3 leading-tight text-slate-900">
            AI 驱动的<br />
            <span className="text-gradient">课件创作平台</span>
          </h2>
          <p className="text-slate-500 leading-relaxed max-w-md">
            输入课程主题，AI 自动生成教学文案、配图、配音，一键合成教学视频。让每一位教师都能轻松制作高质量课件。
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700">{f.label}</div>
                <div className="text-[11px] text-slate-400">{f.desc}</div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>免费使用</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>无需付费</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>立即开始</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo (mobile only) */}
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">C</div>
            <span className="font-bold text-xl tracking-tight text-slate-900">CourseAI</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-blue-500/5 p-6">
            {/* Blue gradient top decoration */}
            <div className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 -mt-6 mb-5 -mx-1" />
            <h1 className="text-lg font-semibold mb-1 text-slate-900">登录</h1>
            <p className="text-sm text-slate-500 mb-6">欢迎回来，继续你的课件创作</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" required />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition-all disabled:opacity-40 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-2">登录 <ArrowRight className="w-4 h-4" /></span>}
              </button>
            </form>

            {/* Social login placeholder */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center mb-3">其他登录方式</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs hover:bg-slate-50 transition">
                  <span>💬</span> 微信登录
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200 ml-auto">即将推出</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs hover:bg-slate-50 transition">
                  <span>🌐</span> Google
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200 ml-auto">即将推出</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            没有账号？ <Link href="/register" className="text-blue-600 hover:text-blue-500 transition">注册</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
