"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2, ChevronDown, ChevronUp, Save, ArrowUp, ArrowDown,
  Sparkles, RotateCcw, FileText, Wand2, Clock
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Section {
  sectionNumber: number;
  title: string;
  content: string;
}

interface Step2Props {
  courseId: string;
  onNext: () => void;
  onPrev: () => void;
}

const SECTION_COUNTS = [
  { value: 3, label: "3段", duration: "~1分钟" },
  { value: 5, label: "5段", duration: "~2分钟" },
  { value: 8, label: "8段", duration: "~3分钟" },
  { value: 10, label: "10段", duration: "~5分钟" },
];

export default function Step2({ courseId, onNext, onPrev }: Step2Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState<number | null>(null);
  const [sectionCount, setSectionCount] = useState(5);
  const [generatingText, setGeneratingText] = useState("");
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.sections?.length > 0) {
          setSections(
            d.sections.map((s: any) => ({
              sectionNumber: s.section_number,
              title: s.title,
              content: s.content,
            }))
          );
        }
      })
      .catch(() => {});
  }, [courseId]);

  const startTypewriter = () => {
    const messages = [
      "正在分析课程主题...",
      "构建教学大纲结构...",
      "生成第1段教学文案...",
      "优化文案表达...",
      "添加教学知识点...",
      "检查内容连贯性...",
      "润色语言风格...",
      "完成所有段落生成...",
    ];
    let msgIdx = 0;
    let charIdx = 0;
    setGeneratingText(messages[0].substring(0, 1));

    typewriterRef.current = setInterval(() => {
      charIdx++;
      const currentMsg = messages[msgIdx];
      if (charIdx <= currentMsg.length) {
        setGeneratingText(currentMsg.substring(0, charIdx));
      } else {
        msgIdx = (msgIdx + 1) % messages.length;
        charIdx = 0;
        setGeneratingText(messages[msgIdx].substring(0, 1));
      }
    }, 60);
  };

  const stopTypewriter = () => {
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
      typewriterRef.current = null;
    }
    setGeneratingText("");
  };

  const generate = async () => {
    setLoading(true);
    startTypewriter();
    try {
      const res = await fetch(`/api/courses/${courseId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, sectionCount }),
      });
      const data = await res.json();
      if (res.ok) {
        setSections(data.sections || []);
        // Refresh course data for step validation
        fetch(\`/api/courses/\${courseId}\`).then(r => r.json()).then(d => {
          if (d?.course) setCourseData(d.course);
        }).catch(() => {});
        toast.success("教学文案生成成功");
      } else {
        toast.error(data.error || "生成失败");
      }
    } catch {
      toast.error("生成失败");
    } finally {
      stopTypewriter();
      setLoading(false);
    }
  };

  const optimizeScript = async () => {
    setOptimizing(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, sectionCount: sections.length, optimize: true }),
      });
      const data = await res.json();
      if (res.ok && data.sections) {
        setSections(
          data.sections.map((s: any) => ({
            sectionNumber: s.section_number,
            title: s.title,
            content: s.content,
          }))
        );
        fetch(\`/api/courses/\${courseId}\`).then(r => r.json()).then(d => {
          if (d?.course) setCourseData(d.course);
        }).catch(() => {});
        toast.success("文案已优化");
      } else {
        toast.error(data.error || "优化失败");
      }
    } catch {
      toast.error("优化失败");
    } finally {
      setOptimizing(false);
    }
  };

  const saveSection = async (idx: number) => {
    const s = sections[idx];
    if (!s) return;
    setSaving(idx);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: [{ section_number: s.sectionNumber, title: s.title, content: s.content }],
        }),
      });
      if (res.ok) toast.success(`第${s.sectionNumber}段已保存`);
      else {
        const d = await res.json();
        toast.error(d.error || "保存失败");
      }
    } catch {
      toast.error("保存失败");
    } finally {
      setSaving(null);
    }
  };

  const toggleCollapse = (idx: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const moveSection = (idx: number, dir: "up" | "down") => {
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const updated = [...sections];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    updated.forEach((s, i) => (s.sectionNumber = i + 1));
    setSections(updated);
    toast.success(`段落已${dir === "up" ? "上移" : "下移"}`);
  };

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-400" />
            AI 生成教学文案
          </h2>
          <p className="text-sm text-neutral-500">根据课程主题自动生成分段教学文案，可编辑每段内容</p>
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200 bg-white animate-fade-up-delay-1">
        {/* Section count selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">段落数：</span>
          <div className="flex items-center gap-1.5">
            {SECTION_COUNTS.map((n) => (
              <button
                key={n.value}
                type="button"
                onClick={() => setSectionCount(n.value)}
                className={`flex flex-col items-center px-3 py-1.5 rounded-lg transition ${
                  sectionCount === n.value
                    ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                    : "bg-neutral-50 text-neutral-500 border border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                <span className="text-xs font-medium">{n.label}</span>
                <span className="text-[9px] opacity-60 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> {n.duration}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={generate}
          disabled={loading}
          variant="default"
        >
          {loading ? "生成中..." : sections.length === 0 ? (
            <>
              <Sparkles className="w-4 h-4" />
              生成文案
              <span className="text-[10px] opacity-70">约需 10 秒</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              重新生成
            </>
          )}
        </Button>
      </div>

      {/* Loading state with typewriter */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-neutral-200 bg-white animate-fade-in">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-500" />
            </div>
            <div className="absolute -inset-2 rounded-2xl border border-primary-500/10 animate-pulse" />
          </div>
          <div className="h-8 flex items-center mb-2">
            <p className="text-sm text-neutral-600 typewriter-cursor">{generatingText}</p>
          </div>
          <p className="text-xs text-neutral-400">通常需要 10-30 秒</p>
          <div className="flex items-center gap-1.5 mt-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary-500 pulse-dot"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-neutral-300 animate-fade-in">
          <div className="text-5xl mb-4 animate-bounce-subtle">✍️</div>
          <p className="text-sm text-neutral-500 font-medium mb-2">点击上方按钮生成教学文案</p>
          <p className="text-xs text-neutral-400">AI 将根据课程主题自动生成分段教学文案</p>
        </div>
      ) : (
        <>
          {/* AI optimize button */}
          <div className="flex justify-end">
            <button
              onClick={optimizeScript}
              disabled={optimizing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                optimizing
                  ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                  : "bg-neutral-50 text-neutral-500 border border-neutral-200 hover:bg-primary-500/10 hover:text-primary-400 hover:border-primary-500/30"
              }`}
            >
              <Wand2 className="w-3 h-3" />
              {optimizing ? "优化中..." : "AI 润色优化"}
            </button>
          </div>

          {/* Section cards - left-right layout */}
          <div className="space-y-3 stagger-children">
            {sections.map((s, i) => {
              const isCollapsed = collapsed.has(i);
              return (
                <div
                  key={i}
                  className="rounded-xl border border-neutral-200 bg-white overflow-hidden group hover:border-neutral-200 transition-colors"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Left: number + title + summary */}
                    <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {s.sectionNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{s.title}</h3>
                      {!isCollapsed && (
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {s.content.substring(0, 60)}...
                        </p>
                      )}
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => moveSection(i, "up")}
                        disabled={i === 0}
                        className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition disabled:opacity-20"
                        title="上移"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(i, "down")}
                        disabled={i === sections.length - 1}
                        className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition disabled:opacity-20"
                        title="下移"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => saveSection(i)}
                        disabled={saving === i}
                        className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-accent-400 transition disabled:opacity-30"
                        title="保存"
                      >
                        {saving === i ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleCollapse(i)}
                        className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition"
                        title={isCollapsed ? "展开" : "折叠"}
                      >
                        {isCollapsed ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronUp className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Editable content */}
                  <div
                    className={`collapsible-content ${isCollapsed ? "collapsed" : ""}`}
                    style={{ maxHeight: isCollapsed ? "0px" : "500px" }}
                  >
                    <div className="px-4 pb-4 pl-14">
                      <textarea
                        value={s.content}
                        onChange={(e) =>
                          setSections((prev) =>
                            prev.map((sec, j) =>
                              j === i ? { ...sec, content: e.target.value } : sec
                            )
                          )
                        }
                        className="w-full bg-neutral-100 text-sm text-neutral-600 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary-500/20 rounded-lg p-3"
                        rows={5}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onPrev}>
          上一步
        </Button>
        <Button onClick={onNext} disabled={sections.length === 0}>
          下一步：生成配图
        </Button>
      </div>
    </div>
  );
}
