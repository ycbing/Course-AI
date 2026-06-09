"use client";

import Link from "next/link";
import { Clock, BookOpen, Presentation, ChevronRight, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface CourseCardData {
  id: string;
  title: string;
  subject: string | null;
  grade: string | null;
  status: string;
  progressStep: string | null;
  sectionCount: number;
  coverUrl: string;
  videoUrl: string | null;
  pptxUrl?: string | null;
  duration: number | null;
  createdAt: string;
}

interface CourseCardProps {
  course: CourseCardData;
  onDelete?: (id: string) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "草稿", color: "bg-neutral-100 text-neutral-500" },
  generating: { label: "生成中", color: "bg-primary-500/10 text-primary-400 border border-primary-500/20" },
  completed: { label: "已完成", color: "bg-accent-500/10 text-accent-400 border border-accent-400/20" },
  error: { label: "错误", color: "bg-red-500/10 text-red-400 border border-red-500/20" },
};

const stepLabels: Record<string, string> = {
  created: "已创建",
  generating_script: "文案生成中",
  script_ready: "文案就绪",
  generating_images: "配图生成中",
  images_ready: "配图就绪",
  style_ready: "PPT 样式就绪",
  generating_voice: "配音生成中",
  voice_ready: "配音就绪",
  composing: "PPT 生成中",
  pptx_ready: "PPT 已生成",
  completed: "已完成",
};

export function CourseCard({ course, onDelete }: CourseCardProps) {
  const status = statusConfig[course.status] || statusConfig.draft;
  const subjectLabels: Record<string, string> = {
    math: "数学", chinese: "语文", english: "英语", physics: "物理",
    chemistry: "化学", biology: "生物", history: "历史", geography: "地理",
    programming: "编程", general: "通用",
  };

  return (
    <Link
      href={`/course/${course.id}`}
      className="group block overflow-hidden transition-all duration-150 hover:shadow"
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover */}
      <div className="aspect-video bg-neutral-100 overflow-hidden relative">
        {course.coverUrl ? (
          <img
            src={course.coverUrl}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.55 0.1 250 / 0.2), oklch(0.55 0.1 280 / 0.2))" }}>
            <BookOpen className="w-10 h-10" style={{ color: "var(--muted-foreground)" }} />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${status.color}`}>
            {status.label}
          </Badge>
        </div>
        {/* PPTX badge */}
        {course.pptxUrl && (
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="text-[10px] px-2 py-1 rounded-full font-medium bg-primary-500/20 text-primary-300 border-primary-500/30">
              <Presentation className="w-3 h-3" />
              PPT
            </Badge>
          </div>
        )}
        {/* Duration badge */}
        {course.duration && course.status === "completed" && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 text-[11px] text-white/80 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {Math.floor(course.duration / 60)}:{String(Math.floor(course.duration % 60)).padStart(2, "0")}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate transition-colors duration-200" style={{ color: "var(--foreground)" }}>
              {course.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
              {course.subject && <span>{subjectLabels[course.subject] || course.subject}</span>}
              {course.grade && <span>· {course.grade}</span>}
              {course.sectionCount > 0 && <span>· {course.sectionCount}段</span>}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 transition-all duration-200" style={{ color: "var(--border)" }} />
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            {course.progressStep ? stepLabels[course.progressStep] || course.progressStep : "草稿"}
          </span>
          <span className="text-[11px]" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
            {new Date(course.createdAt).toLocaleDateString("zh-CN")}
          </span>
        </div>
      </div>
        </Card>
    </Link>
  );
}
