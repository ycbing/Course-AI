"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Sparkles, BookTemplate, ChevronDown, ChevronUp, Plus, X, Wand2, RefreshCw, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Step2Props {
  courseId: string;
  onNext: () => void;
  onPrev: () => void;
}

interface Section {
  id?: string;
  sectionNumber: number;
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
}

export default function Step2({ courseId, onNext, onPrev }: Step2Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sectionCount, setSectionCount] = useState(5);
  const [course, setCourse] = useState<any>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (loaded) return;
    fetch(`/api/courses/${courseId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.course) {
          setCourse(d.course);
          setSectionCount(d.course.section_count || 5);
        }
        if (d?.sections) {
          setSections(
            d.sections.map((s: any) => ({
              id: s.id,
              sectionNumber: s.section_number,
              title: s.title,
              content: s.content,
              imagePrompt: s.image_prompt || "",
              imageUrl: s.image_url || undefined,
            }))
          );
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [courseId, loaded]);

  const handleGenerate = async () => {
    setGenerating(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, sectionCount }),
      });
      const data = await res.json();
      if (res.ok) {
        setSections(
          data.sections.map((s: any, i: number) => ({
            sectionNumber: i + 1,
            title: s.title,
            content: s.content,
            imagePrompt: s.imagePrompt || "",
          }))
        );
        toast.success(`已生成 ${data.sections.length} 个教学段落`);
      } else if (data.code === "INSUFFICIENT_CREDITS") {
        toast.error(data.error || "积分不足");
      } else {
        toast.error(data.error || "生成失败");
      }
    } catch {
      toast.error("生成失败，请重试");
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleSaveSection = async (idx: number) => {
    const section = sections[idx];
    if (!section?.id) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: section.id,
          title: section.title,
          content: section.content,
        }),
      });
      if (res.ok) {
        toast.success("已保存");
        setEditingIdx(null);
      } else {
        toast.error("保存失败");
      }
    } catch {
      toast.error("保存失败");
    }
  };

  const updateSection = (idx: number, field: keyof Section, value: string) => {
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditContent(sections[idx]?.content || "");
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setEditContent("");
  };

  const totalChars = sections.reduce((sum, s) => sum + (s.content?.length || 0), 0);

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="animate-fade-up">
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <BookTemplate className="w-5 h-5 text-primary-400" />
          教学文案
        </h2>
        <p className="text-sm text-neutral-500">AI 根据课程主题自动生成教学段落，可编辑调整</p>
      </div>

      {/* Controls */}
      {!generating && (
        <div className="flex items-center gap-4 animate-fade-up-delay-1">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-neutral-500">段落数</label>
            <div className="flex items-center gap-1">
              {[3, 4, 5, 6, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSectionCount(n)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sectionCount === n
                      ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                      : "bg-neutral-100 text-neutral-500 border border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto">
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="typewriter">AI 生成中</span>
                </>
              ) : sections.length > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  重新生成
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  生成教学文案（10积分）
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Generating animation */}
      {generating && (
        <div className="rounded-2xl border border-primary-500/20 bg-primary-500/5 p-8 flex flex-col items-center justify-center animate-fade-up">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-primary-400 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-400 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-600 mb-1">
            <span className="typewriter">AI 正在撰写教学文案</span>
          </p>
          <p className="text-xs text-neutral-400">
            根据课程主题智能生成 {sectionCount} 个教学段落
          </p>
          <div className="mt-4 w-48 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full animate-progress-bar" />
          </div>
        </div>
      )}

      {/* Sections list */}
      {sections.length > 0 && !generating && (
        <div className="space-y-3 animate-fade-up">
          {/* Stats bar */}
          <div className="flex items-center gap-3 px-1">
            <Badge variant="secondary" className="text-xs">
              {sections.length} 段落
            </Badge>
            <span className="text-xs text-neutral-400">
              共 {totalChars} 字
            </span>
            <span className="text-xs text-neutral-300 ml-auto">
              点击段落可编辑
            </span>
          </div>

          {/* Section cards */}
          {sections.map((section, idx) => (
            <div
              key={section.id || idx}
              className={`rounded-2xl border transition-all duration-300 ${
                editingIdx === idx
                  ? "border-primary-500/30 bg-primary-500/5 shadow-sm"
                  : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
              }`}
            >
              {/* Section header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                onClick={() =>
                  editingIdx === idx ? cancelEdit() : startEdit(idx)
                }
              >
                <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <h3 className="text-sm font-medium text-neutral-700 flex-1 truncate">
                  {section.title}
                </h3>
                <span className="text-[10px] text-neutral-300">
                  {section.content?.length || 0} 字
                </span>
                {editingIdx === idx ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </div>

              {/* Expanded content */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  editingIdx === idx ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 pb-4 pt-0 pl-14">
                  <textarea
                    value={editingIdx === idx ? editContent : section.content}
                    onChange={(e) => {
                      setEditContent(e.target.value);
                      updateSection(idx, "content", e.target.value);
                    }}
                    rows={6}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-700 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/30 resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-neutral-300">
                      {editContent.length} 字
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEdit();
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 transition"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveSection(idx);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {sections.length === 0 && !generating && loaded && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-12 flex flex-col items-center justify-center animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
            <Pencil className="w-7 h-7 text-neutral-300" />
          </div>
          <p className="text-sm font-medium text-neutral-500 mb-1">
            尚未生成教学文案
          </p>
          <p className="text-xs text-neutral-400 mb-4">
            AI 将根据课程主题和教学大纲自动生成教学内容
          </p>
          <Button onClick={handleGenerate} className="gap-2">
            <Wand2 className="w-4 h-4" />
            开始生成（10积分）
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between animate-fade-up-delay-3">
        <Button variant="outline" onClick={onPrev}>
          上一步
        </Button>
        <Button
          onClick={onNext}
          disabled={sections.length === 0}
        >
          下一步：配图
        </Button>
      </div>
    </div>
  );
}
