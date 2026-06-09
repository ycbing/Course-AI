"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2, ArrowLeft, Play, Download, Share2, Copy, Check, BookOpen,
  ChevronDown, ChevronUp, Trash2, FolderPlus, Edit, GraduationCap,
  FileText, Clock, Image, Volume2, LayoutList, Sparkles, Presentation
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { toPublicUrl } from "@/lib/cos-url";

type DetailTab = "overview" | "chapters" | "quiz";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [cloning, setCloning] = useState(false);

  // Video player state
  const [videoSpeed, setVideoSpeed] = useState(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.course) {
          setCourse(d.course);
          if (d.course.share_token)
            setShareLink(`${window.location.origin}/share/${d.course.share_token}`);
        }
        if (d?.sections) setSections(d.sections);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    return () => {
      audioEl?.pause();
    };
  }, [audioEl]);

  const copyLink = () => {
    if (!shareLink) return;
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        setCopied(true);
        toast.success("已复制");
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const playSection = (idx: number) => {
    const s = sections[idx];
    if (!s?.audioUrl) return;
    if (playing === idx) {
      audioEl?.pause();
      setPlaying(null);
      return;
    }
    const audio = new Audio(s.audioUrl);
    setAudioEl(audio);
    audio.play();
    setPlaying(idx);
    audio.onended = () => setPlaying(null);
  };

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除这个课程吗？此操作不可撤销。")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("已删除");
        router.push("/dashboard");
      } else {
        toast.error("删除失败");
      }
    } catch {
      toast.error("删除失败");
    } finally {
      setDeleting(false);
    }
  };

  const handleClone = async () => {
    setCloning(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `${course?.title || "课程"} (副本)`, cloneFrom: courseId }),
      });
      const data = await res.json();
      if (data.course?.id) {
        toast.success("已复制到新课程");
        router.push(`/create?courseId=${data.course.id}&step=1`);
      } else {
        toast.error(data.error || "复制失败");
      }
    } catch {
      toast.error("复制失败");
    } finally {
      setCloning(false);
    }
  };

  const changeVideoSpeed = (speed: number) => {
    setVideoSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
  };

  const subjectLabels: Record<string, string> = {
    math: "数学", chinese: "语文", english: "英语", physics: "物理",
    chemistry: "化学", biology: "生物", history: "历史", geography: "地理",
    programming: "编程", general: "通用",
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: "草稿", color: "bg-slate-100 text-slate-500" },
    generating: { label: "生成中", color: "bg-amber-500/10 text-amber-400" },
    completed: { label: "已完成", color: "bg-emerald-500/10 text-emerald-400" },
    error: { label: "错误", color: "bg-red-500/10 text-red-400" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
          <div className="skeleton w-full h-48 rounded-2xl" />
          <div className="space-y-3">
            <div className="skeleton-text w-2/3 h-6" />
            <div className="skeleton-text w-1/3 h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😔</div>
          <p className="text-slate-500">课程不存在</p>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-600 text-sm mt-2 inline-block">
            返回课程列表
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[course.status] || statusConfig.draft;
  const nextStep = course.status === "completed" ? 5 : course.section_count > 0 ? 2 : 1;
  const quizCount = course.quiz_data ? (Array.isArray(course.quiz_data) ? course.quiz_data.length : 0) : 0;

  const TABS: { key: DetailTab; label: string; icon: typeof LayoutList }[] = [
    { key: "overview", label: "概览", icon: LayoutList },
    { key: "chapters", label: "章节内容", icon: BookOpen },
    { key: "quiz", label: "随堂测验", icon: GraduationCap },
  ];

  // Compute cumulative time offsets for chapter markers
  const sectionTimeOffsets: number[] = [];
  let cumTime = 0;
  for (const s of sections) {
    sectionTimeOffsets.push(cumTime);
    cumTime += (s.duration || 0);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster theme="light" position="top-center" />

      <header className="border-b border-slate-200 glass sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-sm truncate">{course.title}</span>
          <div className="ml-auto">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 page-transition">
        {/* Hero banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6 animate-fade-up">
          {course.coverUrl || course.video_url ? (
            <div className="aspect-video relative">
              <img
                src={toPublicUrl(course.coverUrl || course.video_url)}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-2xl font-bold mb-2 text-white">{course.title}</h1>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  {course.subject && (
                    <span className="badge badge-blue">
                      {subjectLabels[course.subject] || course.subject}
                    </span>
                  )}
                  {course.grade && <span>{course.grade}</span>}
                  {course.section_count > 0 && <span>{course.section_count} 段</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-blue-900/40 to-indigo-900/40 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-3">📖</div>
                <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
                <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                  {course.subject && (
                    <span className="badge badge-blue">
                      {subjectLabels[course.subject] || course.subject}
                    </span>
                  )}
                  {course.grade && <span>{course.grade}</span>}
                  {course.section_count > 0 && <span>{course.section_count} 段</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 mb-6 animate-fade-up-delay-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.key === "quiz" && quizCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                  {quizCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ─── */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-up-delay-2">
            {/* Course info cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <BookOpen className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <div className="text-lg font-bold">{course.section_count}</div>
                <div className="text-[10px] text-slate-500">教学段落</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <div className="text-lg font-bold">
                  {sections.length > 0
                    ? `${Math.round(sections.reduce((sum: number, s: any) => sum + (s.duration || 0), 0))}`
                    : "0"}
                </div>
                <div className="text-[10px] text-slate-500">总时长（秒）</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <Image className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <div className="text-lg font-bold">
                  {sections.filter((s: any) => s.image_url).length}
                </div>
                <div className="text-[10px] text-slate-500">已配图</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <GraduationCap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                <div className="text-lg font-bold">{quizCount}</div>
                <div className="text-[10px] text-slate-500">测验题</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/create?courseId=${courseId}&step=${nextStep}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/15"
              >
                <Edit className="w-4 h-4" />
                {course.status === "completed" ? "预览" : "继续创作"}
              </Link>

              {/* PPTX download button */}
              {course.pptx_url && (
                <a
                  href={toPublicUrl(course.pptx_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/15"
                >
                  <Presentation className="w-4 h-4" />
                  下载 PPTX
                </a>
              )}

              {shareLink && (
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copied ? "已复制" : "分享"}
                </button>
              )}

              <button
                onClick={handleClone}
                disabled={cloning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-all disabled:opacity-40"
              >
                {cloning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
                复制
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-all disabled:opacity-40"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                删除
              </button>
            </div>

            {/* Video with enhanced player */}
            {course.video_url && course.status === "completed" && (
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="aspect-video bg-black relative">
                  <video
                    ref={videoRef}
                    src={course.video_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Speed controls */}
                <div className="flex items-center gap-2 p-3 border-t border-slate-200">
                  <span className="text-[10px] text-slate-500">播放速度</span>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changeVideoSpeed(speed)}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition ${
                        videoSpeed === speed
                          ? "bg-blue-500/20 text-blue-400"
                          : "text-slate-500 hover:text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
                {/* Chapter markers */}
                {sections.length > 0 && (
                  <div className="p-3 border-t border-slate-200">
                    <div className="text-[10px] text-slate-500 mb-2">章节跳转</div>
                    <div className="flex flex-wrap gap-2">
                      {sections.map((s: any, i: number) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            const video = document.querySelector("video");
                            if (video) video.currentTime = sectionTimeOffsets[i];
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
                        >
                          <span className="w-4 h-4 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center text-[8px] font-bold">
                            {s.section_number}
                          </span>
                          {s.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Chapters Tab ─── */}
        {activeTab === "chapters" && (
          <div className="animate-fade-up-delay-2">
            {sections.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed border-slate-300">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-slate-500 font-medium mb-2">还没有教学段落</p>
                <p className="text-xs text-slate-400 mb-4">在编辑页面生成教学文案</p>
                <Link
                  href={`/create?courseId=${courseId}&step=2`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm transition-all"
                >
                  开始生成
                </Link>
              </div>
            ) : (
              <div className="space-y-3 stagger-children">
                {sections.map((s: any, i: number) => {
                  const isExpanded = expandedSections.has(i);
                  return (
                    <div
                      key={s.id}
                      className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-slate-200 transition-colors"
                    >
                      <button
                        onClick={() => toggleSection(i)}
                        className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-200 hover:bg-slate-50 transition text-left"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {s.section_number}
                        </div>
                        <h3 className="text-sm font-medium flex-1 min-w-0 truncate">{s.title}</h3>
                        <div className="flex items-center gap-2">
                          {s.image_url && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/20 text-emerald-400 bg-emerald-500/5">
                              配图✓
                            </span>
                          )}
                          {s.audio_url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSection(i);
                              }}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition ${
                                playing === i
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-slate-100 text-slate-500 hover:bg-blue-50"
                              }`}
                            >
                              {playing === i ? "暂停" : "配音"}
                            </button>
                          )}
                          {s.duration > 0 && (
                            <span className="text-[10px] text-slate-400">{Math.round(s.duration)}s</span>
                          )}
                          <div className="text-slate-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </button>

                      <div
                        className={`collapsible-content ${isExpanded ? "" : "collapsed"}`}
                        style={{ maxHeight: isExpanded ? "600px" : "0px" }}
                      >
                        <div className="p-4">
                          <p className="text-sm text-slate-500 leading-relaxed">{s.content}</p>
                          <div className="flex gap-3 mt-3">
                            {s.image_url && (
                              <div className="rounded-lg overflow-hidden inline-block">
                                <img src={toPublicUrl(s.image_url)} alt={s.title} className="w-48 h-32 object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Quiz Tab ─── */}
        {activeTab === "quiz" && (
          <div className="animate-fade-up-delay-2">
            {quizCount > 0 ? (
              <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-lg font-bold mb-2">随堂测验</h3>
                <p className="text-sm text-slate-500 mb-6">共 {quizCount} 道题，涵盖所有教学章节</p>
                <Link
                  href={`/course/${courseId}/quiz`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/15"
                >
                  <Sparkles className="w-4 h-4" />
                  开始测验
                </Link>
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl border border-dashed border-slate-300">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-slate-500 font-medium mb-2">还没有测验题目</p>
                <p className="text-xs text-slate-400 mb-4">使用 AI 自动生成测验题</p>
                <Link
                  href={`/course/${courseId}/quiz`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  AI 生成测验
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
