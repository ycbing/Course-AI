"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toPublicUrl } from "@/lib/cos-url";
import {
  Plus, Loader2, LayoutDashboard, Settings, ArrowLeft, Trash2,
  BookOpen, GraduationCap, Search, Filter, BarChart3, FolderOpen,
  FileText, Image, Mic, Video, Check, Grid3X3, List, Play,
  Share2, Copy, Sparkles
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface Course {
  id: string;
  title: string;
  subject: string | null;
  grade: string | null;
  status: string;
  progressStep: string | null;
  sectionCount: number;
  coverUrl: string;
  videoUrl: string | null;
  duration: number | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  draft: { label: "草稿", color: "bg-slate-100 text-slate-500", dotColor: "" },
  generating: { label: "生成中", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20", dotColor: "bg-blue-500" },
  script_ready: { label: "文案就绪", color: "bg-green-500/10 text-green-400 border border-green-500/20", dotColor: "bg-green-500" },
  images_ready: { label: "配图就绪", color: "bg-purple-500/10 text-purple-400 border border-purple-500/20", dotColor: "bg-purple-500" },
  completed: { label: "已完成", color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", dotColor: "bg-emerald-500" },
  error: { label: "错误", color: "bg-red-500/10 text-red-400 border border-red-500/20", dotColor: "bg-red-500" },
};

const STEP_LABELS: Record<string, string> = {
  created: "已创建",
  generating_script: "文案生成中",
  script_ready: "文案就绪",
  generating_images: "配图生成中",
  images_ready: "配图就绪",
  generating_voice: "配音生成中",
  voice_ready: "配音就绪",
  composing: "视频合成中",
  completed: "已完成",
};

const SUBJECT_LABELS: Record<string, string> = {
  math: "数学", chinese: "语文", english: "英语", physics: "物理",
  chemistry: "化学", biology: "生物", history: "历史", geography: "地理",
  programming: "编程", general: "通用", music: "音乐", art: "美术",
};

const SUBJECT_OPTIONS = [
  { value: "", label: "全部学科" },
  { value: "math", label: "数学" },
  { value: "chinese", label: "语文" },
  { value: "english", label: "英语" },
  { value: "physics", label: "物理" },
  { value: "chemistry", label: "化学" },
  { value: "biology", label: "生物" },
  { value: "history", label: "历史" },
  { value: "programming", label: "编程" },
  { value: "general", label: "通用" },
];

const STATUS_FILTERS = [
  { value: "", label: "全部" },
  { value: "draft", label: "草稿" },
  { value: "generating", label: "进行中" },
  { value: "completed", label: "已完成" },
];

function getProgressBadges(progressStep: string | null): { key: string; label: string; done: boolean }[] {
  const steps = [
    { key: "script", label: "文案", check: ["script_ready", "generating_images", "images_ready", "generating_voice", "voice_ready", "composing", "completed"] },
    { key: "images", label: "配图", check: ["images_ready", "generating_voice", "voice_ready", "composing", "completed"] },
    { key: "voice", label: "配音", check: ["voice_ready", "composing", "completed"] },
    { key: "video", label: "视频", check: ["completed"] },
  ];
  return steps.map((s) => ({
    key: s.key,
    label: s.label,
    done: progressStep ? s.check.includes(progressStep) : false,
  }));
}

export default function DashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [quickCreate, setQuickCreate] = useState("");
  const [quickCreateSubject, setQuickCreateSubject] = useState("");
  const [userCredits, setUserCredits] = useState<number>(0);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses((data.courses || []).map((c: any) => ({
          ...c,
          coverUrl: c.cover_url || '',
          progressStep: c.progress_step,
          sectionCount: c.section_count,
          videoUrl: c.video_url,
          shareToken: c.share_token,
          shareCount: c.share_count,
          pptxUrl: c.pptx_url,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })));
      }
      const userRes = await fetch("/api/user");
      if (userRes.ok) {
        const userData = await userRes.json();
        setUserCredits(userData.user?.credits ?? 0);
      }
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/courses/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("已删除");
        await fetchList();
      } else {
        toast.error("删除失败");
      }
    } catch {
      toast.error("删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuickCreate = async () => {
    if (!quickCreate.trim()) {
      toast.error("请输入课程主题");
      return;
    }
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quickCreate.trim(),
          subject: quickCreateSubject || "general",
        }),
      });
      const data = await res.json();
      if (data.course?.id) {
        toast.success("课程已创建");
        router.push(`/create?courseId=${data.course.id}&step=1`);
      } else {
        toast.error(data.error || "创建失败");
      }
    } catch {
      toast.error("创建失败");
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (subjectFilter && c.subject !== subjectFilter) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      return true;
    });
  }, [courses, search, subjectFilter, statusFilter]);

  const totalCount = courses.length;
  const completedCount = courses.filter((c) => c.status === "completed").length;
  const inProgressCount = courses.filter((c) => c.status === "generating").length;

  const getStatusConfig = (course: Course) => {
    // Map progressStep to a more granular status
    const step = course.progressStep;
    if (step === "completed") return STATUS_CONFIG.completed;
    if (step === "script_ready") return STATUS_CONFIG.script_ready;
    if (step === "images_ready") return STATUS_CONFIG.images_ready;
    return STATUS_CONFIG[course.status] || STATUS_CONFIG.draft;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster theme="light" position="top-center" />
      <ConfirmDialog
        open={!!deleteTarget}
        title="确定删除课程？"
        description={`删除「${deleteTarget?.title}」后将无法恢复。`}
        confirmText="删除"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Top nav */}
      <header className="border-b border-slate-200 glass sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition">
            <ArrowLeft className="w-4 h-4" />
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-[10px]">
              C
            </div>
          </Link>
          <div className="h-5 w-px bg-slate-100" />
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-sm">我的课程</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/create"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/15"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">创建课程</span>
            </Link>
            <Link href="/settings" className="text-slate-500 hover:text-slate-600 transition">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 mobile-nav-spacer">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 animate-fade-up">
          {[
            { icon: FolderOpen, label: "总课程数", value: totalCount, color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: Check, label: "已完成", value: completedCount, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { icon: Loader2, label: "创作中", value: inProgressCount, color: "text-amber-400", bg: "bg-amber-500/10" },
            { icon: BarChart3, label: "积分余额", value: userCredits, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}>
                  <s.icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-lg font-bold">{s.value}</div>
                  <div className="text-[11px] text-slate-400">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick create bar */}
        <div className="mb-6 animate-fade-up-delay-1">
          <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white">
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <input
              type="text"
              value={quickCreate}
              onChange={(e) => setQuickCreate(e.target.value)}
              placeholder="快速创建：输入课程主题..."
              className="flex-1 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleQuickCreate()}
            />
            <select
              value={quickCreateSubject}
              onChange={(e) => setQuickCreateSubject(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-500 appearance-none focus:outline-none cursor-pointer"
            >
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={handleQuickCreate}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3" /> 创建
            </button>
          </div>
        </div>

        {/* Header with search/filter and view toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-fade-up-delay-1">
          <div>
            <h1 className="text-xl font-bold">课程列表</h1>
            <p className="text-sm text-slate-500 mt-1">管理你的 AI 课件和教学视频</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-slate-100 text-blue-400" : "text-slate-400 hover:text-slate-500"}`}
                title="网格视图"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-slate-100 text-blue-400" : "text-slate-400 hover:text-slate-500"}`}
                title="列表视图"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 animate-fade-up-delay-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索课程..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-500 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            {SUBJECT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                  statusFilter === s.value
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course display */}
        {loading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {viewMode === "grid" && <div className="aspect-video skeleton" />}
                <div className="p-4 space-y-3">
                  <div className="skeleton-text w-3/4" />
                  <div className="skeleton-text w-1/2 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-dashed border-slate-300 page-transition">
            <div className="text-6xl mb-6 animate-float">📚</div>
            <p className="text-base text-slate-500 font-medium mb-2">
              {courses.length === 0 ? "还没有课程" : "没有匹配的课程"}
            </p>
            <p className="text-sm text-slate-400 mb-6">
              {courses.length === 0 ? "点击上方按钮创建你的第一个 AI 课件" : "试试调整筛选条件"}
            </p>
            {courses.length === 0 && (
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" /> 创建第一个课程
              </Link>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid view */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                statusConfig={getStatusConfig(course)}
                badges={getProgressBadges(course.progressStep)}
                deletingId={deletingId}
                onDelete={(c) => setDeleteTarget(c)}
              />
            ))}
          </div>
        ) : (
          /* List view */
          <div className="space-y-2 stagger-children">
            {filteredCourses.map((course) => (
              <CourseRow
                key={course.id}
                course={course}
                statusConfig={getStatusConfig(course)}
                badges={getProgressBadges(course.progressStep)}
                deletingId={deletingId}
                onDelete={(c) => setDeleteTarget(c)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Course Card (Grid) ─── */
function CourseCard({
  course, statusConfig, badges, deletingId, onDelete,
}: {
  course: Course;
  statusConfig: { label: string; color: string; dotColor: string };
  badges: { key: string; label: string; done: boolean }[];
  deletingId: string | null;
  onDelete: (c: Course) => void;
}) {
  return (
    <div className="relative group">
      <Link
        href={`/course/${course.id}`}
        className="block rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 card-hover overflow-hidden"
      >
        {/* Cover */}
        <div className="aspect-video bg-slate-100 overflow-hidden relative">
          {course.coverUrl ? (
            <img src={toPublicUrl(course.coverUrl)} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-indigo-900/30 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
          )}
          {/* Status badge with dot */}
          <div className="absolute top-3 right-3">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${statusConfig.color}`}>
              {statusConfig.dotColor && course.status === "generating" && (
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} pulse-dot`} />
              )}
              {statusConfig.label}
            </span>
          </div>
          {/* Video play overlay */}
          {course.videoUrl && course.status === "completed" && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
              </div>
            </div>
          )}
          {/* Duration */}
          {course.duration && course.status === "completed" && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 text-[11px] text-white/80">
              {Math.floor(course.duration / 60)}:{String(Math.floor(course.duration % 60)).padStart(2, "0")}
            </div>
          )}
          {/* Hover quick actions */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all z-10">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-slate-500 hover:text-white transition"
              title="分享"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(course); }}
              disabled={deletingId === course.id}
              className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-slate-500 hover:text-red-400 transition disabled:opacity-30"
              title="删除"
            >
              {deletingId === course.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-sm font-semibold group-hover:text-blue-600 transition truncate mb-1.5">
            {course.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            {course.subject && <span>{SUBJECT_LABELS[course.subject] || course.subject}</span>}
            {course.grade && <span>· {course.grade}</span>}
            {course.sectionCount > 0 && <span>· {course.sectionCount}段</span>}
          </div>
          {course.progressStep && (
            <div className="flex items-center gap-1.5 mb-3">
              {badges.map((b) => (
                <span key={b.key} className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  b.done ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" : "border-slate-200 text-slate-400 bg-slate-50"
                }`}>
                  {b.label} {b.done ? "✓" : "○"}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-[11px] text-slate-400">{STEP_LABELS[course.progressStep || ""] || "草稿"}</span>
            <span className="text-[11px] text-slate-300">{new Date(course.createdAt).toLocaleDateString("zh-CN")}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ─── Course Row (List) ─── */
function CourseRow({
  course, statusConfig, badges, deletingId, onDelete,
}: {
  course: Course;
  statusConfig: { label: string; color: string; dotColor: string };
  badges: { key: string; label: string; done: boolean }[];
  deletingId: string | null;
  onDelete: (c: Course) => void;
}) {
  return (
    <div className="relative group">
      <Link
        href={`/course/${course.id}`}
        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all"
      >
        {/* Thumbnail */}
        <div className="w-20 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative">
          {course.coverUrl ? (
            <img src={toPublicUrl(course.coverUrl)} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-slate-300" />
            </div>
          )}
          {course.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-4 h-4 text-white" fill="white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold truncate group-hover:text-blue-600 transition">{course.title}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusConfig.color}`}>
              {course.status === "generating" && (
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${statusConfig.dotColor} pulse-dot`} />
              )}
              {statusConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-400">
              {course.subject && `${SUBJECT_LABELS[course.subject] || course.subject}`}
              {course.grade && ` · ${course.grade}`}
              {course.sectionCount > 0 && ` · ${course.sectionCount}段`}
            </span>
            {badges.some((b) => b.done) && (
              <div className="hidden sm:flex items-center gap-1">
                {badges.map((b) => (
                  <span key={b.key} className={`text-[9px] px-1 py-0.5 rounded ${
                    b.done ? "text-emerald-400 bg-emerald-500/5" : "text-slate-300"
                  }`}>
                    {b.label}{b.done ? "✓" : "○"}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: date + actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[11px] text-slate-300">{new Date(course.createdAt).toLocaleDateString("zh-CN")}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(course); }}
              disabled={deletingId === course.id}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-400 transition disabled:opacity-30"
            >
              {deletingId === course.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
