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
    if (password !== confirmPassword) { toast.error("两次密码不一致"); return; }
    if (password.length < 6) { toast.error("密码至少 6 位"); return; }

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
        const result = await signIn("credentials", { email: email.trim(), password, redirect: false });
        if (result?.ok) { router.push("/dashboard"); } else { toast.error("自动登录失败，请手动登录"); router.push("/login"); }
      } else { toast.error(data.error || "注册失败"); }
    } catch { toast.error("注册失败"); } finally { setLoading(false); }
  };

  const features = [
    { icon: Sparkles, label: "AI 驱动", desc: "从文案到视频全自动化" },
    { icon: FileText, label: "智能文案", desc: "GLM-4 结构化教学文案" },
    { icon: BookOpen, label: "自动配图", desc: "CogView 教学插图" },
    { icon: Mic, label: "自然配音", desc: "Edge-TTS 多音色" },
    { icon: Video, label: "一键合成", desc: "1080P 教学视频" },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
      <Toaster theme="light" position="top-center" />

      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.97 0.01 280 / 0.5), oklch(0.97 0.01 290 / 0.5))" }}>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-30" style={{ background: "oklch(0.55 0.15 280 / 0.5)" }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-30" style={{ background: "oklch(0.55 0.15 290 / 0.5)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: "var(--primary)", boxShadow: "0 4px 12px oklch(0.55 0.2 250 / 0.25)" }}>C</div>
            <span className="font-bold text-2xl tracking-tight" style={{ color: "var(--foreground)" }}>CourseAI</span>
          </div>
          <h2 className="text-3xl font-bold mb-3 leading-tight" style={{ color: "var(--foreground)" }}>
            加入 <span className="text-gradient">12,800+</span><br />名教师
          </h2>
          <p className="leading-relaxed max-w-md" style={{ color: "var(--muted-foreground)" }}>
            创建账号，立即开始使用 AI 制作高质量教学课件。注册即送 100 积分。
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "oklch(0.55 0.1 280 / 0.1)", color: "oklch(0.5 0.18 280)" }}>
                <f.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{f.label}</div>
                <div className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: "var(--primary)" }}>C</div>
            <span className="font-bold text-xl tracking-tight" style={{ color: "var(--foreground)" }}>CourseAI</span>
          </div>

          <div className="rounded-xl border bg-white p-6" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}>
            <div className="h-1 rounded-full -mt-6 mb-5 -mx-1" style={{ background: "linear-gradient(90deg, var(--primary), oklch(0.55 0.2 280))" }} />
            <h1 className="text-xl font-semibold mb-1" style={{ color: "var(--foreground)" }}>注册</h1>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>创建账号，开始 AI 课件创作</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "昵称", icon: User, type: "text", value: name, setter: setName, placeholder: "你的昵称" },
                { label: "邮箱", icon: Mail, type: "email", value: email, setter: setEmail, placeholder: "your@email.com" },
                { label: "密码", icon: Lock, type: "password", value: password, setter: setPassword, placeholder: "至少 6 位" },
                { label: "确认密码", icon: Lock, type: "password", value: confirmPassword, setter: setConfirmPassword, placeholder: "再次输入密码" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>{field.label}</label>
                  <div className="relative">
                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                    <input
                      type={field.type}
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full pl-10 pr-4 h-12 rounded-xl border bg-white text-sm placeholder:opacity-50 transition-all duration-200"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--background)" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.55 0.2 250 / 0.1)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                      required
                      minLength={field.type === "password" ? 6 : undefined}
                    />
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl text-white font-medium text-sm transition-all duration-150 hover:-translate-y-px disabled:opacity-40"
                style={{ background: "var(--primary)", boxShadow: "0 4px 12px oklch(0.55 0.2 250 / 0.25)" }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-2">注册并开始 <ArrowRight className="w-4 h-4" /></span>}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs text-center mb-3" style={{ color: "var(--muted-foreground)" }}>其他注册方式</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 px-4 h-11 rounded-xl border bg-white text-xs transition-all duration-200 hover:shadow-sm" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                  <span>💬</span> 微信注册
                  <span className="text-[9px] px-1.5 py-0.5 rounded ml-auto" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>即将推出</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 h-11 rounded-xl border bg-white text-xs transition-all duration-200 hover:shadow-sm" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                  <span>🌐</span> Google
                  <span className="text-[9px] px-1.5 py-0.5 rounded ml-auto" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>即将推出</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-sm mt-5 space-y-1" style={{ color: "var(--muted-foreground)" }}>
            <p>已有账号？ <Link href="/login" className="transition-colors duration-200" style={{ color: "var(--primary)" }}>登录</Link></p>
            <p className="text-xs flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" style={{ color: "var(--accent)" }} /> 注册即送 100 积分
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
