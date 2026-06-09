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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  draft: { label: "草稿", color: "bg-neutral-100 text-neutral-500", dotColor: "" },
  generating: { label: "生成中", color: "bg-primary-50 text-primary-700 border border-primary-200", dotColor: "bg-primary-500" },
  script_ready: { label: "文案就绪", color: "bg-primary-50 text-primary-700 border border-primary-200", dotColor: "bg-primary-500" },
  images_ready: { label: "配图就绪", color: "bg-primary-50 text-primary-700 border border-primary-200", dotColor: "bg-primary-500" },
  completed: { label: "已完成", color: "bg-primary-50 text-primary-700 border border-primary-200", dotColor: "bg-primary-500" },
  error: { label: "错误", color: "bg-neutral-100 text-neutral-500", dotColor: "" },
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
    const step = course.progressStep;
    if (step === "completed") return STATUS_CONFIG.completed;
    if (step === "script_ready") return STATUS_CONFIG.script_ready;
    if (step === "images_ready") return STATUS_CONFIG.images_ready;
    return STATUS_CONFIG[course.status] || STATUS_CONFIG.draft;
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
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
      <header className="glass sticky top-0 z-40 border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition">
            <ArrowLeft className="w-4 h-4" />
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-[10px]">
              C
            </div>
          </Link>
          <div className="h-5 w-px bg-neutral-100" />
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-neutral-400" />
            <span className="font-semibold text-sm">我的课程</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/create">
              <Button size="sm">
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">创建课程</span>
              </Button>
            </Link>
            <Link href="/settings" className="text-neutral-400 hover:text-neutral-600 transition">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 mobile-nav-spacer">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 animate-fade-up">
          {[
            { icon: FolderOpen, label: "总课程数", value: totalCount, color: "text-neutral-900", bg: "bg-neutral-100" },
            { icon: Check, label: "已完成", value: completedCount, color: "text-neutral-900", bg: "bg-neutral-100" },
            { icon: Loader2, label: "创作中", value: inProgressCount, color: "text-neutral-900", bg: "bg-neutral-100" },
            { icon: BarChart3, label: "积分余额", value: userCredits, color: "text-neutral-900", bg: "bg-neutral-100" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0 text-neutral-500`}>
                    <s.icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-neutral-900">{s.value}</div>
                    <div className="section-label text-[10px]">{s.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick create bar */}
        <div className="mb-6 animate-fade-up-delay-1">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <Input
                  type="text"
                  value={quickCreate}
                  onChange={(e) => setQuickCreate(e.target.value)}
                  placeholder="快速创建：输入课程主题..."
                  className="flex-1 h-9 border-0 shadow-none focus-visible:ring-0"
                  onKeyDown={(e) => e.key === "Enter" && handleQuickCreate()}
                />
                <Select value={quickCreateSubject} onValueChange={(v) => setQuickCreateSubject(v || "")}>
                  <SelectTrigger className="w-[100px] h-9 border-neutral-200 text-xs">
                    <SelectValue placeholder="学科" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECT_OPTIONS.filter(s => s.value).map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleQuickCreate} size="sm">
                  <Plus className="w-3 h-3" /> 创建
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header with search/filter and view toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-fade-up-delay-1">
          <div>
            <h1 className="text-xl font-bold">课程列表</h1>
            <p className="text-sm text-neutral-500 mt-1">管理你的 AI 课件和教学视频</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100 border border-neutral-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400 hover:text-neutral-500"}`}
                title="网格视图"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400 hover:text-neutral-500"}`}
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索课程..."
              className="pl-9"
            />
          </div>
          <Select value={subjectFilter || "all"} onValueChange={(v) => setSubjectFilter(v === "all" ? "" : (v ?? ""))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="全部学科" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value || "all"}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            {STATUS_FILTERS.map((s) => (
              <Button
                key={s.value}
                variant={statusFilter === s.value ? "default" : "outline"}
                size="sm"
                className="text-xs h-9"
                onClick={() => setStatusFilter(s.value)}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Course display */}
        {loading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
                {viewMode === "grid" && <div className="aspect-video skeleton" />}
                <div className="p-4 space-y-3">
                  <div className="skeleton-text w-3/4" />
                  <div className="skeleton-text w-1/2 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-dashed border-neutral-300 page-transition">
            <div className="text-6xl mb-6 animate-float">📚</div>
            <p className="text-base text-neutral-500 font-medium mb-2">
              {courses.length === 0 ? "还没有课程" : "没有匹配的课程"}
            </p>
            <p className="text-sm text-neutral-400 mb-6">
              {courses.length === 0 ? "点击上方按钮创建你的第一个 AI 课件" : "试试调整筛选条件"}
            </p>
            {courses.length === 0 && (
              <Link href="/create">
                <Button>
                  <Plus className="w-4 h-4" /> 创建第一个课程
                </Button>
              </Link>
            )}
          </div>
        ) : viewMode === "grid" ? (
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
        className="block rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-100 card-hover overflow-hidden"
      >
        {/* Cover */}
        <div className="aspect-video bg-neutral-100 overflow-hidden relative">
          {course.coverUrl ? (
            <img src={toPublicUrl(course.coverUrl)} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-900/30 to-primary-900/30 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-neutral-400" />
            </div>
          )}
          {/* Status badge with dot */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className={`text-[10px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${statusConfig.color}`}>
              {statusConfig.dotColor && course.status === "generating" && (
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} pulse-dot`} />
              )}
              {statusConfig.label}
            </Badge>
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
              className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-neutral-500 hover:text-white transition"
              title="分享"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(course); }}
              disabled={deletingId === course.id}
              className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-neutral-500 hover:text-red-400 transition disabled:opacity-30"
              title="删除"
            >
              {deletingId === course.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-sm font-semibold group-hover:text-neutral-900 transition truncate mb-1.5">
            {course.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3">
            {course.subject && <span>{SUBJECT_LABELS[course.subject] || course.subject}</span>}
            {course.grade && <span>· {course.grade}</span>}
            {course.sectionCount > 0 && <span>· {course.sectionCount}段</span>}
          </div>
          {course.progressStep && (
            <div className="flex items-center gap-1.5 mb-3">
              {badges.map((b) => (
                <Badge key={b.key} variant={b.done ? "default" : "outline"} className="text-[10px] px-1.5 py-0.5">
                  {b.label} {b.done ? "✓" : "○"}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
            <span className="text-[11px] text-neutral-400">{STEP_LABELS[course.progressStep || ""] || "草稿"}</span>
            <span className="text-[11px] text-neutral-300">{new Date(course.createdAt).toLocaleDateString("zh-CN")}</span>
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
        className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-all"
      >
        {/* Thumbnail */}
        <div className="w-20 h-14 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0 relative">
          {course.coverUrl ? (
            <img src={toPublicUrl(course.coverUrl)} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-neutral-300" />
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
            <h3 className="text-sm font-semibold truncate group-hover:text-neutral-900 transition">{course.title}</h3>
            <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusConfig.color}`}>
              {course.status === "generating" && (
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${statusConfig.dotColor} pulse-dot`} />
              )}
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-neutral-400">
              {course.subject && `${SUBJECT_LABELS[course.subject] || course.subject}`}
              {course.grade && ` · ${course.grade}`}
              {course.sectionCount > 0 && ` · ${course.sectionCount}段`}
            </span>
            {badges.some((b) => b.done) && (
              <div className="hidden sm:flex items-center gap-1">
                {badges.map((b) => (
                  <Badge key={b.key} variant={b.done ? "default" : "outline"} className={`text-[9px] px-1 py-0.5 rounded ${b.done ? "text-accent-400 bg-accent-500/5" : "text-neutral-300"}`}>
                    {b.label}{b.done ? "✓" : "○"}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: date + actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[11px] text-neutral-300">{new Date(course.createdAt).toLocaleDateString("zh-CN")}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(course); }}
              disabled={deletingId === course.id}
              className="p-1.5 rounded-md text-neutral-400 hover:text-red-400 transition disabled:opacity-30"
            >
              {deletingId === course.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
