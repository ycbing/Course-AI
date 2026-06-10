"use client";

import { useState, useEffect } from "react";
import { Loader2, ImageIcon, Download, RefreshCw, Check, Palette, AlertCircle, RotateCcw, Sparkles, ChevronDown, ChevronUp, Save } from "lucide-react";
import { toast } from "sonner";
import { toPublicUrl } from "@/lib/cos-url";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Section {
  id?: string;
  sectionNumber: number;
  title: string;
  content: string;
  imageUrl?: string;
  imagePrompt?: string;
  imageError?: string;
  showPrompt?: boolean;
  refiningPrompt?: boolean;
}

interface Step3Props {
  courseId: string;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step3({ courseId, onNext, onPrev }: Step3Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [imgGen, setImgGen] = useState<number | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [refiningAll, setRefiningAll] = useState(false);
  const [editingPromptIdx, setEditingPromptIdx] = useState<number | null>(null);
  const [editingPromptText, setEditingPromptText] = useState("");
  useEffect(() => {
    if (loaded) return;
    fetch(`/api/courses/${courseId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.sections)
          setSections(
            d.sections.map((s: any) => ({
              ...s,
              sectionNumber: s.section_number,
              imageUrl: s.image_url || undefined,
              imagePrompt: s.image_prompt || "",
            }))
          );
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [courseId, loaded]);

  const genImage = async (idx: number) => {
    const s = sections[idx];
    if (!s) return;
    setImgGen(idx);
    setSections((prev) =>
      prev.map((sec, i) => (i === idx ? { ...sec, imageError: undefined } : sec))
    );
    try {
      const basePrompt = s.content.substring(0, 200);
      const prompt = customPrompt
        ? `${basePrompt}, ${customPrompt}`
        : `${basePrompt}, educational illustration, teaching material, clear and informative`;
      const res = await fetch(`/api/courses/${courseId}/illustrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, sectionIndex: idx, imagePrompt: prompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setSections((prev) =>
          prev.map((sec, i) => (i === idx ? { ...sec, imageUrl: data.imageUrl, imageError: undefined } : sec))
        );
        toast.success(`第 ${idx + 1} 段配图已生成`);
      } else {
        setSections((prev) =>
          prev.map((sec, i) => (i === idx ? { ...sec, imageError: data.error || "生成失败" } : sec))
        );
        toast.error(data.error || "失败");
      }
    } catch {
      setSections((prev) =>
        prev.map((sec, i) => (i === idx ? { ...sec, imageError: "网络错误，请重试" } : sec))
      );
      toast.error("配图生成失败");
    } finally {
      setImgGen(null);
    }
  };

  const downloadImage = async (url: string, title: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${title}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error("下载失败");
    }
  };

  const genAll = async () => {
    setLoadingAll(true);
    for (let i = 0; i < sections.length; i++) {
      if (!sections[i].imageUrl) await genImage(i);
    }
    setLoadingAll(false);
  };

  const regenerateAll = async () => {
    setLoadingAll(true);
    for (let i = 0; i < sections.length; i++) {
      setImgGen(i);
      await genImage(i);
    }
    setLoadingAll(false);
  };

  const refineSinglePrompt = async (idx: number) => {
    const s = sections[idx];
    if (!s?.id) return;
    setSections((prev) => prev.map((sec, i) => (i === idx ? { ...sec, refiningPrompt: true } : sec)));
    try {
      const res = await fetch(`/api/sections/${s.id}/refine-prompt`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSections((prev) => prev.map((sec, i) => (i === idx ? { ...sec, imagePrompt: data.imagePrompt, refiningPrompt: false, showPrompt: true } : sec)));
        toast.success(`第 ${idx + 1} 段提示词已精调`);
      } else {
        toast.error(data.error || "精调失败");
        setSections((prev) => prev.map((sec, i) => (i === idx ? { ...sec, refiningPrompt: false } : sec)));
      }
    } catch {
      toast.error("精调失败");
      setSections((prev) => prev.map((sec, i) => (i === idx ? { ...sec, refiningPrompt: false } : sec)));
    }
  };

  const refineAllPrompts = async () => {
    setRefiningAll(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/refine-all-prompts`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`已精调 ${data.successCount}/${data.total} 段提示词`);
        // Refresh sections to get updated prompts
        setLoaded(false);
      } else {
        toast.error(data.error || "批量精调失败");
      }
    } catch {
      toast.error("批量精调失败");
    }
    setRefiningAll(false);
  };

  const savePromptEdit = async (idx: number) => {
    const s = sections[idx];
    if (!s?.id || !editingPromptText.trim()) return;
    try {
      await fetch(`/api/sections/${s.id}/save-prompt`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePrompt: editingPromptText }),
      });
      setSections((prev) => prev.map((sec, i) => (i === idx ? { ...sec, imagePrompt: editingPromptText } : sec)));
      setEditingPromptIdx(null);
      toast.success("提示词已保存");
    } catch {
      toast.error("保存失败");
    }
  };

  const hasAll = sections.length > 0 && sections.every((s) => s.imageUrl);
  const hasSome = sections.some((s) => s.imageUrl);
  const completedCount = sections.filter((s) => s.imageUrl).length;

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-up">
        <div>
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary-400" />
            生成教学配图
          </h2>
          <p className="text-sm text-neutral-500">
            AI 为每个教学段落生成教学插图
            {completedCount > 0 && (
              <span className="text-neutral-400 ml-2">
                (图片 {completedCount}/{sections.length})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={regenerateAll} disabled={loadingAll || refiningAll}>
              <RotateCcw className="w-3.5 h-3.5" />
              全部重新生成
            </Button>
            <Button variant="outline" size="sm" onClick={refineAllPrompts} disabled={refiningAll || loadingAll}>
              <Sparkles className="w-3.5 h-3.5" />
              {refiningAll ? "精调中..." : "AI 精调提示词"}
            </Button>
            <Button
              onClick={genAll}
              disabled={loadingAll || hasAll || refiningAll}
            >
              {loadingAll ? "生成中..." : hasAll ? "全部完成 ✓" : "生成全部配图"}
            </Button>

        </div>
      </div>

      {/* Custom prompt */}
      <div className="animate-fade-up-delay-1">
        <div className="flex items-center gap-2 p-3 rounded-xl border border-neutral-200 bg-white">
          <ImageIcon className="w-4 h-4 text-neutral-500 flex-shrink-0" />
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="自定义配图提示词（可选，如：水彩画风格、卡通风格）"
            className="flex-1 bg-transparent text-sm text-neutral-600 placeholder:text-neutral-400 focus:outline-none"
          />
          {customPrompt && (
            <button
              onClick={() => setCustomPrompt("")}
              className="text-xs text-neutral-400 hover:text-neutral-500 transition"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* Gallery layout - 2 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
        {sections.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-200 bg-white overflow-hidden group hover:border-neutral-200 transition-all"
          >
            {/* Image area */}
            <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden">
              {s.imageUrl ? (
                <>
                  <img
                    src={toPublicUrl(s.imageUrl)}
                    alt={s.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => genImage(i)}
                      disabled={imgGen !== null}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-xs text-neutral-600 hover:bg-neutral-100 transition border border-neutral-200"
                    >
                      <RefreshCw className="w-3 h-3" />
                      重新生成
                    </button>
                    <button
                      onClick={() => downloadImage(s.imageUrl!, s.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-xs text-neutral-600 hover:bg-neutral-100 transition border border-neutral-200"
                    >
                      <Download className="w-3 h-3" />
                      下载
                    </button>
                  </div>
                  {/* Status badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-400 border-accent-400/20">
                      <Check className="w-2.5 h-2.5" /> 已生成
                    </Badge>
                  </div>
                </>
              ) : s.imageError ? (
                /* Error state */
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <AlertCircle className="w-8 h-8 text-red-400/60" />
                  <p className="text-xs text-red-400/60 text-center px-4">{s.imageError}</p>
                  <button
                    onClick={() => genImage(i)}
                    disabled={imgGen !== null}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-[11px] border border-red-500/20 hover:bg-red-500/20 transition"
                  >
                    <RefreshCw className="w-3 h-3" /> 重试
                  </button>
                </div>
              ) : imgGen === i ? (
                /* Loading state */
                <div className="w-full h-full skeleton flex items-center justify-center">
                  <div className="relative flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                    <span className="text-xs text-neutral-500">生成中...</span>
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-8 h-8 text-neutral-300" />
                  <span className="text-neutral-300 text-xs">待生成</span>
                </div>
              )}
            </div>

            {/* Section info below image */}
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary-500/10 text-primary-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {s.sectionNumber}
                </div>
                <h3 className="text-xs font-medium truncate flex-1">{s.title}</h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSections((prev) => prev.map((sec, j) => (j === i ? { ...sec, showPrompt: !sec.showPrompt } : sec)));
                    }}
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
                    title={s.showPrompt ? "收起提示词" : "查看提示词"}
                  >
                    {s.showPrompt ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  {!s.imageUrl && (
                    <button
                      onClick={() => genImage(i)}
                      disabled={imgGen !== null}
                      className="px-2.5 py-1 rounded-md text-[10px] font-medium transition bg-neutral-100 text-neutral-500 hover:bg-primary-50 disabled:opacity-30"
                    >
                      {imgGen === i ? <Loader2 className="w-3 h-3 animate-spin" /> : "生成"}
                    </button>
                  )}
                </div>
              </div>

              {/* Prompt preview/edit area */}
              {s.showPrompt && (
                <div className="space-y-2 pt-1 border-t border-neutral-100">
                  {editingPromptIdx === i ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingPromptText}
                        onChange={(e) => setEditingPromptText(e.target.value)}
                        rows={3}
                        className="w-full text-[11px] text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary-400/30"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setEditingPromptIdx(null)}
                          className="text-[10px] text-neutral-400 hover:text-neutral-500"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => savePromptEdit(i)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition"
                        >
                          <Save className="w-2.5 h-2.5" /> 保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group/prompt relative">
                      <p className="text-[10px] text-neutral-400 leading-relaxed line-clamp-3">
                        {s.imagePrompt || "暂无提示词"}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          onClick={() => refineSinglePrompt(i)}
                          disabled={s.refiningPrompt || refiningAll}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 transition disabled:opacity-30"
                        >
                          {s.refiningPrompt ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                          AI 精调
                        </button>
                        <button
                          onClick={() => { setEditingPromptIdx(i); setEditingPromptText(s.imagePrompt || ""); }}
                          className="text-[10px] text-neutral-400 hover:text-neutral-500 transition"
                        >
                          手动编辑
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onPrev}>
          上一步
        </Button>
        <Button onClick={onNext} disabled={!hasAll}>
          下一步：PPT 样式
        </Button>
      </div>
    </div>
  );
}
