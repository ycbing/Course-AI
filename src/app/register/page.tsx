"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight, User, CheckCircle, FileText, Video, Sparkles, BookOpen, Mic } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    if (password !== confirmPassword) {
      toast.error("两次密码不一致");
      return;
    }

    if (password.length < 6) {
      toast.error("密码至少 6 位");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("注册成功，正在登录...");
        // Auto-login after registration
        const result = await signIn("credentials", {
          email: email.trim(),
          password,
          redirect: false,
        });
        if (result?.ok) {
          router.push("/dashboard");
        } else {
          toast.error("自动登录失败，请手动登录");
          router.push("/login");
        }
      } else {
        toast.error(data.error || "注册失败");
      }
    } catch {
      toast.error("注册失败");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Sparkles, label: "AI 驱动", desc: "从文案到视频全自动化" },
    { icon: FileText, label: "智能文案", desc: "GLM-4 结构化教学文案" },
    { icon: BookOpen, label: "自动配图", desc: "CogView 教学插图" },
    { icon: Mic, label: "自然配音", desc: "Edge-TTS 多音色" },
    { icon: Video, label: "一键合成", desc: "1080P 教学视频" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Toaster theme="light" position="top-center" />

      {/* Left panel - brand showcase (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-200/30 rounded-full blur-[100px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">C</div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">CourseAI</span>
          </div>
          <h2 className="text-3xl font-bold mb-3 leading-tight text-slate-900">
            加入 <span className="text-gradient">12,800+</span><br />名教师
          </h2>
          <p className="text-slate-500 leading-relaxed max-w-md">
            创建账号，立即开始使用 AI 制作高质量教学课件。注册即送 100 积分。
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700">{f.label}</div>
                <div className="text-[11px] text-slate-400">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - register form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo (mobile only) */}
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">C</div>
            <span className="font-bold text-xl tracking-tight text-slate-900">CourseAI</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-blue-500/5 p-6">
            <div className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 -mt-6 mb-5 -mx-1" />
            <h1 className="text-lg font-semibold mb-1 text-slate-900">注册</h1>
            <p className="text-sm text-slate-500 mb-6">创建账号，开始 AI 课件创作</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">昵称</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="你的昵称"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少 6 位"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition-all disabled:opacity-40 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    注册并开始 <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            {/* Social register placeholder */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center mb-3">其他注册方式</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs hover:bg-slate-50 transition">
                  <span>💬</span> 微信注册
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200 ml-auto">即将推出</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs hover:bg-slate-50 transition">
                  <span>🌐</span> Google
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200 ml-auto">即将推出</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-slate-500 mt-5 space-y-1">
            <p>
              已有账号？{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 transition">登录</Link>
            </p>
            <p className="text-slate-400 text-xs flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" /> 注册即送 100 积分
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
