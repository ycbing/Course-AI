"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, ArrowRight, FileText, BookOpen, Video, Mic, CheckCircle } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fafafa]"><div className="w-6 h-6 border-2 rounded-full animate-spin border-neutral-200 border-t-neutral-900" /></div>}>
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
    <div className="min-h-screen flex bg-[#fafafa]">
      <Toaster theme="light" position="top-center" />

      {/* Left panel - brand showcase (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-neutral-50">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-bold">C</div>
            <span className="font-bold text-2xl tracking-tight text-neutral-900">CourseAI</span>
          </div>
          <h2 className="text-3xl font-bold mb-3 leading-tight text-neutral-900">
            AI 驱动的
            <br />
            课件创作平台
          </h2>
          <p className="leading-relaxed max-w-md text-neutral-500">
            输入课程主题，AI 自动生成教学文案、配图、配音，一键合成教学视频。让每一位教师都能轻松制作高质量课件。
          </p>
        </div>

        {/* Feature list */}
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
          <div className="flex items-center gap-3 pt-4">
            {["免费使用", "无需付费", "立即开始"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-neutral-400">
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
            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-bold text-sm">C</div>
            <span className="font-bold text-xl tracking-tight text-neutral-900">CourseAI</span>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-1">登录</h1>
            <p className="text-sm text-neutral-500 mb-6">欢迎回来，继续你的课件创作</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-neutral-500 mb-1.5 block">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-12 pl-10 rounded-xl border-neutral-300 focus:ring-2 focus:ring-neutral-400"
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-500 mb-1.5 block">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 pl-10 rounded-xl border-neutral-300 focus:ring-2 focus:ring-neutral-400"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-2">登录 <ArrowRight className="w-4 h-4" /></span>}
              </Button>
            </form>

            {/* Social login placeholder */}
            <div className="mt-6 pt-5 border-t border-neutral-200">
              <p className="text-xs text-center mb-3 text-neutral-400">其他登录方式</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-11 text-xs border-neutral-300">
                  <span>💬</span> 微信登录
                  <span className="text-[9px] px-1.5 py-0.5 rounded ml-auto opacity-40">即将推出</span>
                </Button>
                <Button variant="outline" className="h-11 text-xs border-neutral-300">
                  <span>🌐</span> Google
                  <span className="text-[9px] px-1.5 py-0.5 rounded ml-auto opacity-40">即将推出</span>
                </Button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm mt-5 text-neutral-400">
            没有账号？ <Link href="/register" className="text-neutral-900 hover:text-neutral-600 transition-colors duration-150">注册</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
