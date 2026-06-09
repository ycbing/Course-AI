"use client";

import { useState, useEffect } from "react";
import { Loader2, ImageIcon, Download, RefreshCw, Check, Palette, AlertCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Section {
  id?: string;
  sectionNumber: number;
  title: string;
  content: string;
  imageUrl?: string;
  imagePrompt?: string;
  imageError?: string;

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

  const hasAll = sections.length > 0 && sections.every((s) => s.imageUrl);
  const hasSome = sections.some((s) => s.imageUrl);
  const completedCount = sections.filter((s) => s.imageUrl).length;

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-up">
        <div>
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            生成教学配图
          </h2>
          <p className="text-sm text-slate-500">
            AI 为每个教学段落生成教学插图
            {completedCount > 0 && (
              <span className="text-slate-400 ml-2">
                (图片 {completedCount}/{sections.length})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasSome && (
            <button
              onClick={regenerateAll}
              disabled={loadingAll}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-all disabled:opacity-40 ${
                loadingAll ? "btn-loading" : ""
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              全部重新生成
            </button>
          )}
          <button
            onClick={genAll}
            disabled={loadingAll || hasAll}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-40 shadow-lg shadow-blue-500/15 ${
              loadingAll ? "btn-loading" : ""
            }`}
          >
            {loadingAll ? "生成中..." : hasAll ? "全部完成 ✓" : "生成全部配图"}
          </button>

        </div>
      </div>

      {/* Custom prompt */}
      <div className="animate-fade-up-delay-1">
        <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white">
          <ImageIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="自定义配图提示词（可选，如：水彩画风格、卡通风格）"
            className="flex-1 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none"
          />
          {customPrompt && (
            <button
              onClick={() => setCustomPrompt("")}
              className="text-xs text-slate-400 hover:text-slate-500 transition"
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
            className="rounded-xl border border-slate-200 bg-white overflow-hidden group hover:border-slate-200 transition-all"
          >
            {/* Image area */}
            <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
              {s.imageUrl ? (
                <>
                  <img
                    src={s.imageUrl}
                    alt={s.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => genImage(i)}
                      disabled={imgGen !== null}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-xs text-slate-600 hover:bg-slate-100 transition border border-slate-200"
                    >
                      <RefreshCw className="w-3 h-3" />
                      重新生成
                    </button>
                    <button
                      onClick={() => downloadImage(s.imageUrl!, s.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-xs text-slate-600 hover:bg-slate-100 transition border border-slate-200"
                    >
                      <Download className="w-3 h-3" />
                      下载
                    </button>
                  </div>
                  {/* Status badge */}
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> 已生成
                    </span>
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
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-xs text-slate-500">生成中...</span>
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                  <span className="text-slate-300 text-xs">待生成</span>
                </div>
              )}
            </div>

            {/* Section info below image */}
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {s.sectionNumber}
                </div>
                <h3 className="text-xs font-medium truncate flex-1">{s.title}</h3>
                {!s.imageUrl && (
                  <button
                    onClick={() => genImage(i)}
                    disabled={imgGen !== null}
                    className="px-2.5 py-1 rounded-md text-[10px] font-medium transition bg-slate-100 text-slate-500 hover:bg-blue-50 disabled:opacity-30 flex-shrink-0"
                  >
                    {imgGen === i ? <Loader2 className="w-3 h-3 animate-spin" /> : "生成"}
                  </button>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onPrev}
          className="px-5 py-3 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-all"
        >
          上一步
        </button>
        <button
          onClick={onNext}
          disabled={!hasAll}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm transition-all disabled:opacity-40 shadow-lg shadow-blue-500/15"
        >
          下一步：PPT 样式
        </button>
      </div>
    </div>
  );
}
