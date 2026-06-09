"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight, User, CheckCircle, FileText, Video, Sparkles, BookOpen, Mic } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen flex bg-[#fafafa]">
      <Toaster theme="light" position="top-center" />

      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-neutral-50">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-bold">C</div>
            <span className="font-bold text-2xl tracking-tight text-neutral-900">CourseAI</span>
          </div>
          <h2 className="text-3xl font-bold mb-3 leading-tight text-neutral-900">
            加入 12,800+
            <br />名教师
          </h2>
          <p className="leading-relaxed max-w-md text-neutral-500">
            创建账号，立即开始使用 AI 制作高质量教学课件。注册即送 100 积分。
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-500">
                <f.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-neutral-900">{f.label}</div>
                <div className="text-[11px] text-neutral-400">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-bold text-sm">C</div>
            <span className="font-bold text-xl tracking-tight text-neutral-900">CourseAI</span>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-1">注册</h1>
            <p className="text-sm text-neutral-500 mb-6">创建账号，开始 AI 课件创作</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "昵称", icon: User, type: "text", value: name, setter: setName, placeholder: "你的昵称" },
                { label: "邮箱", icon: Mail, type: "email", value: email, setter: setEmail, placeholder: "your@email.com" },
                { label: "密码", icon: Lock, type: "password", value: password, setter: setPassword, placeholder: "至少 6 位" },
                { label: "确认密码", icon: Lock, type: "password", value: confirmPassword, setter: setConfirmPassword, placeholder: "再次输入密码" },
              ].map((field) => (
                <div key={field.label}>
                  <Label className="text-xs font-medium text-neutral-500 mb-1.5 block">{field.label}</Label>
                  <div className="relative">
                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      type={field.type}
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      placeholder={field.placeholder}
                      className="h-12 pl-10 rounded-xl border-neutral-300 focus:ring-2 focus:ring-neutral-400"
                      required
                      minLength={field.type === "password" ? 6 : undefined}
                    />
                  </div>
                </div>
              ))}
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-2">注册并开始 <ArrowRight className="w-4 h-4" /></span>}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-neutral-200">
              <p className="text-xs text-center mb-3 text-neutral-400">其他注册方式</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-11 text-xs border-neutral-300">
                  <span>💬</span> 微信注册
                  <span className="text-[9px] px-1.5 py-0.5 rounded ml-auto opacity-40">即将推出</span>
                </Button>
                <Button variant="outline" className="h-11 text-xs border-neutral-300">
                  <span>🌐</span> Google
                  <span className="text-[9px] px-1.5 py-0.5 rounded ml-auto opacity-40">即将推出</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center text-sm mt-5 space-y-1 text-neutral-400">
            <p>已有账号？ <Link href="/login" className="text-neutral-900 hover:text-neutral-600 transition-colors duration-150">登录</Link></p>
            <p className="text-xs flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" style={{ color: "var(--accent)" }} /> 注册即送 100 积分
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
