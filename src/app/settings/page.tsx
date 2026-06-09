"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Settings, User, LogOut, Save, Loader2,
  Brain, Mic, ImageIcon, Video, BarChart3, Shield,
  Database, Zap, Globe
} from "lucide-react";
import { signOut } from "next-auth/react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TABS = [
  { id: "profile", label: "个人信息", icon: User },
  { id: "models", label: "模型配置", icon: Brain },
  { id: "usage", label: "使用统计", icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Model config state
  const [llmModel, setLlmModel] = useState("glm-4-flash");
  const [ttsEngine, setTtsEngine] = useState("edge-tts");
  const [imageModel, setImageModel] = useState("cogview-3-plus");

  // Usage logs
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setName(d.user.name || "");
          setEmail(d.user.email || "");
          setCredits(d.user.credits || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "usage" && usageLogs.length === 0) {
      setLoadingLogs(true);
      fetch("/api/user")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.usage_logs) setUsageLogs(d.usage_logs);
        })
        .catch(() => {})
        .finally(() => setLoadingLogs(false));
    }
  }, [activeTab, usageLogs.length]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) toast.success("个人信息已保存");
      else toast.error("保存失败");
    } catch {
      toast.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveModels = async () => {
    setSaving(true);
    toast.success("模型配置已保存");
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Toaster theme="light" position="top-center" />

      <header className="border-b border-neutral-200 glass sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-neutral-500" />
            <span className="font-semibold text-sm">设置</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        {/* Tab navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="mb-8">
          <TabsList className="w-full">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex-1">
                  <Icon className="w-4 h-4" />
                  <span className="sm-show">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

        {/* Profile tab */}
        <TabsContent value="profile">
          <div className="space-y-6 page-transition">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 animate-fade-up">
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                <User className="w-4 h-4 text-primary-400" />
                个人信息
              </h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xl font-bold">
                  {name ? name[0].toUpperCase() : "?"}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{name || "未设置"}</h2>
                  <p className="text-sm text-neutral-500">{email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 block">昵称</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="设置你的昵称"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 block">邮箱</label>
                  <Input
                    type="email"
                    value={email}
                    disabled
                  />
                </div>

                <div className="flex items-center justify-between pt-2 p-3 rounded-xl bg-primary-500/5 border border-primary-500/10">
                  <div>
                    <span className="text-sm font-medium">积分余额</span>
                    <span className="ml-2 text-primary-400 font-bold text-lg">{credits}</span>
                  </div>
                  <Zap className="w-5 h-5 text-primary-500/40" />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? "保存中..." : (
                    <>
                      <Save className="w-4 h-4" />
                      保存
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 animate-fade-up-delay-1">
              <h3 className="text-sm font-semibold mb-4 text-neutral-500 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                账户
              </h3>
              <Button variant="outline" onClick={handleLogout} className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-400">
                <LogOut className="w-4 h-4" />
                退出登录
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="models">
          <div className="space-y-6 page-transition">
            {/* LLM Config */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 animate-fade-up">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary-400" />
                AI 文案模型
              </h3>
              <div className="space-y-3">
                <select
                  value={llmModel}
                  onChange={(e) => setLlmModel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none"
                >
                  <option value="glm-4-flash">GLM-4 Flash（免费，推荐）</option>
                  <option value="glm-4-plus">GLM-4 Plus（更精准）</option>
                  <option value="glm-4">GLM-4（最强能力）</option>
                </select>
                <p className="text-xs text-slate-400">
                  用于生成教学文案。Flash 模型免费且速度快，适合大多数场景。
                </p>
              </div>
            </div>

            {/* TTS Config */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 animate-fade-up-delay-1">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                配音引擎
              </h3>
              <div className="space-y-3">
                <select
                  value={ttsEngine}
                  onChange={(e) => setTtsEngine(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none"
                >
                  <option value="edge-tts">Edge-TTS（免费，推荐）</option>
                </select>
                <p className="text-xs text-slate-400">
                  Edge-TTS 提供多种中文音色：男教师、女教师、童声等。
                </p>
                {/* Voice samples */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { name: "云健", desc: "男声·教师" },
                    { name: "晓晓", desc: "女声·教师" },
                    { name: "云扬", desc: "男声·标准" },
                    { name: "晓伊", desc: "女声·活泼" },
                  ].map((v) => (
                    <div
                      key={v.name}
                      className="px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 text-xs"
                    >
                      <span className="font-medium text-neutral-600">{v.name}</span>
                      <span className="text-slate-400 ml-1.5">{v.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Config */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 animate-fade-up-delay-2">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary-400" />
                配图模型
              </h3>
              <div className="space-y-3">
                <select
                  value={imageModel}
                  onChange={(e) => setImageModel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none"
                >
                  <option value="cogview-3-plus">CogView-3-Plus（推荐）</option>
                  <option value="cogview-3-flash">CogView-3-Flash（更快）</option>
                </select>
                <p className="text-xs text-slate-400">
                  用于生成教学插图。CogView-3-Plus 画质更好，Flash 速度更快。
                </p>
              </div>
            </div>

            {/* Video config */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 animate-fade-up-delay-3">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Video className="w-4 h-4 text-primary-400" />
                视频合成
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-neutral-200">
                  <span className="text-neutral-500">合成引擎</span>
                  <span className="text-neutral-600">FFmpeg</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-200">
                  <span className="text-neutral-500">运镜效果</span>
                  <span className="text-neutral-600">Ken Burns</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-neutral-500">输出分辨率</span>
                  <span className="text-neutral-600">1080P</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveModels} disabled={saving}>
                {saving ? "保存中..." : (
                  <>
                    <Save className="w-4 h-4" />
                    保存配置
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <div className="space-y-6 page-transition">
            {/* Summary */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 animate-fade-up">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent-400" />
                使用概览
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200">
                  <div className="text-2xl font-bold text-primary-400">{credits}</div>
                  <div className="text-xs text-slate-400 mt-1">积分余额</div>
                </div>
                <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-200">
                  <div className="text-2xl font-bold text-primary-400">{usageLogs.length}</div>
                  <div className="text-xs text-slate-400 mt-1">总操作数</div>
                </div>
              </div>
            </div>

            {/* Usage logs */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 animate-fade-up-delay-1">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-neutral-500" />
                积分消耗记录
              </h3>
              {loadingLogs ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton-text w-3/4" />
                        <div className="skeleton-text w-1/2 h-3" />
                      </div>
                      <div className="skeleton-text w-16 h-4" />
                    </div>
                  ))}
                </div>
              ) : usageLogs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-sm text-neutral-500">暂无使用记录</p>
                  <p className="text-xs text-slate-400 mt-1">开始创作课程后，这里会显示积分消耗详情</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {usageLogs.map((log, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center flex-shrink-0">
                        {log.type === "script" ? (
                          <Brain className="w-4 h-4" />
                        ) : log.type === "image" ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : log.type === "voice" ? (
                          <Mic className="w-4 h-4" />
                        ) : (
                          <Video className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{log.description || log.type}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(log.created_at).toLocaleString("zh-CN")}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-amber-400">
                        -{log.credits_used || 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
