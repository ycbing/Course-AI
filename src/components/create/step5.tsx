"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2, Download, Check, Copy, FileText, Sparkles,
  Share2, FolderPlus, ExternalLink, Presentation
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Step5Props {
  courseId: string;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step5({ courseId, onNext, onPrev }: Step5Props) {
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pptxUrl, setPptxUrl] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    fetch("/api/courses/" + courseId)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.course) {
          setCourse(d.course);
          if (d.course.pptx_url) setPptxUrl(d.course.pptx_url);
          if (d.course.share_token) {
            setShareLink(window.location.origin + "/share/" + d.course.share_token);
          }
        }
        if (d && d.sections) setSections(d.sections);
      })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }, [courseId]);

  const handleExportPptx = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/courses/" + courseId + "/export-pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: courseId }),
      });
      const data = await res.json();
      if (res.ok) {
        const url = data.pptxUrl || data.downloadUrl;
        setPptxUrl(url);
        // Trigger browser download
        const a = document.createElement('a');
        a.href = url;
        a.download = (course?.title || '课件') + '.pptx';
        a.click();
        toast.success("PPTX 导出成功！共 " + data.slideCount + " 页幻灯片");
      } else {
        toast.error(data.error || "导出失败");
      }
    } catch (e) {
      toast.error("导出失败");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setPdfExporting(true);
    try {
      const res = await fetch("/api/courses/" + courseId + "/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: courseId }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = (course?.title || "课件") + ".pdf";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("PDF 课件已下载");
      } else {
        const d = await res.json();
        toast.error(d.error || "PDF 导出失败");
      }
    } catch (e) {
      toast.error("PDF 导出失败");
    } finally {
      setPdfExporting(false);
    }
  };

  const handleClone = async () => {
    setCloning(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: (course?.title || "课程") + " (副本)", cloneFrom: courseId }),
      });
      const data = await res.json();
      if (data.course?.id) {
        toast.success("已复制到新课程");
        window.location.href = "/create?courseId=" + data.course.id + "&step=1";
      } else {
        toast.error(data.error || "复制失败");
      }
    } catch (e) {
      toast.error("复制失败");
    } finally {
      setCloning(false);
    }
  };

  const copyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink).then(function () {
      setCopied(true);
      toast.success("链接已复制");
      setTimeout(function () { setCopied(false); }, 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 page-transition">
        <div className="skeleton w-16 h-16 rounded-2xl mb-4" />
        <div className="skeleton-text w-48 h-4 mb-2" />
        <div className="skeleton-text w-32 h-3" />
      </div>
    );
  }

  const hasScript = sections.some(function (s: any) { return s.content; });
  const hasImagesAll = sections.length > 0 && sections.every(function (s: any) { return s.image_url; });
  const hasPptx = !!pptxUrl;
  const themeName = course?.theme || "business";
  const themeLabels: Record<string, string> = {
    business: "商务蓝", education: "教育绿", minimal: "简约灰", tech: "科技深色",
  };

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="animate-fade-up">
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <Presentation className="w-5 h-5 text-primary-400" />
          导出 PPTX
        </h2>
        <p className="text-sm text-neutral-500">预览课程内容，一键导出 PPT 课件</p>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-3 animate-fade-up-delay-1">
        <Badge variant={hasScript ? "default" : "outline"} className="text-xs">
          文案{hasScript ? "✓" : "○"}
        </Badge>
        <Badge variant={hasImagesAll ? "default" : "outline"} className="text-xs">
          配图{hasImagesAll ? "✓" : "○"}
        </Badge>
        <Badge variant={hasPptx ? "default" : "outline"} className="text-xs">
          PPT{hasPptx ? "✓" : "○"}
        </Badge>
        <span className="text-xs text-neutral-400 ml-auto">
          主题: {themeLabels[themeName] || themeName} · {sections.length} 章节
        </span>
      </div>

      {/* Course summary */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 animate-fade-up-delay-1">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-3xl">📊</div>
          <div>
            <h3 className="text-base font-semibold">{course?.title || "课程标题"}</h3>
            <p className="text-xs text-neutral-500">
              {course?.subject || "通用"} · {course?.grade || "全年级"} · {sections.length} 个章节
            </p>
          </div>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {sections.map(function (s: any, i: number) {
            return (
              <div key={s.id || i} className="flex items-center gap-3 p-2 rounded-lg border border-neutral-200 bg-neutral-50">
                <div className="w-6 h-6 rounded bg-primary-500/10 text-primary-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {s.section_number}
                </div>
                <span className="text-xs text-neutral-600 truncate flex-1">{s.title}</span>
                {s.image_url && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-accent-400/20 text-accent-400 bg-accent-500/5">图</span>
                )}
                {s.audio_url && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-primary-500/20 text-primary-400 bg-primary-500/5">音</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Export actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up-delay-2">
        {/* Export PPTX */}
        <button
          onClick={handleExportPptx}
          disabled={exporting || sections.length === 0}
          className="flex items-center justify-center gap-3 p-4 rounded-xl border border-primary-500/30 bg-primary-500/5 hover:bg-primary-500/10 transition-all disabled:opacity-40"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center flex-shrink-0">
            {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Presentation className="w-5 h-5" />}
          </div>
          <div className="text-left">
            <span className="text-sm font-medium block">{hasPptx ? "重新导出 PPTX" : "导出 PPTX"}</span>
            <span className="text-[10px] text-neutral-400">PowerPoint 课件 · 扣 5 积分</span>
          </div>
        </button>

        {/* Export PDF */}
        <button
          onClick={handleExportPdf}
          disabled={pdfExporting || sections.length === 0}
          className="flex items-center justify-center gap-3 p-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-all disabled:opacity-40"
        >
          <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-400 flex items-center justify-center flex-shrink-0">
            {pdfExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
          </div>
          <div className="text-left">
            <span className="text-sm font-medium block">导出 PDF 课件</span>
            <span className="text-[10px] text-neutral-400">可打印的教学课件</span>
          </div>
        </button>

        {/* Copy share link */}
        <button
          onClick={copyLink}
          disabled={!shareLink}
          className={"flex items-center justify-center gap-3 p-4 rounded-xl border transition-all disabled:opacity-40 " + (copied ? "border-accent-400/30 bg-accent-500/5" : "border-neutral-200 bg-white hover:bg-neutral-50")}
        >
          <div className={"w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 " + (copied ? "bg-accent-500/20 text-accent-400" : "bg-primary-500/10 text-primary-400")}>
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </div>
          <div className="text-left">
            <span className="text-sm font-medium block">{copied ? "已复制！" : "复制分享链接"}</span>
            <span className="text-[10px] text-neutral-400">学生可免登录查看</span>
          </div>
        </button>

        {/* Clone course */}
        <button
          onClick={handleClone}
          disabled={cloning}
          className="flex items-center justify-center gap-3 p-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-all disabled:opacity-40"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
            {cloning ? <Loader2 className="w-5 h-5 animate-spin" /> : <FolderPlus className="w-5 h-5" />}
          </div>
          <div className="text-left">
            <span className="text-sm font-medium block">复制课程</span>
            <span className="text-[10px] text-neutral-400">基于当前内容创建副本</span>
          </div>
        </button>
      </div>

      {/* Already exported */}
      {hasPptx && (
        <div className="rounded-xl border border-accent-400/20 bg-accent-500/5 p-4 flex items-center gap-3 animate-fade-up-delay-3">
          <Check className="w-5 h-5 text-accent-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-accent-400">PPTX 已生成</p>
            <p className="text-[10px] text-neutral-400 truncate">{pptxUrl}</p>
          </div>
          <button
            onClick={function () {
              const a = document.createElement('a');
              a.href = pptxUrl;
              a.download = (course?.title || '课件') + '.pptx';
              a.click();
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-500/20 text-accent-400 hover:bg-accent-500/30 transition flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            下载
          </button>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-r from-neutral-50 to-white p-6 text-center animate-fade-up-delay-3">
        <div className="text-3xl mb-3 animate-float">🎓</div>
        <p className="text-sm font-medium text-neutral-600 mb-1">继续创作更多课程</p>
        <p className="text-xs text-neutral-400 mb-4">AI 帮你快速生成更多高质量 PPT 课件</p>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          制作下一个课程
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          上一步
        </Button>
        <Link
          href="/dashboard"
        >
          <Button variant="secondary">
            <ExternalLink className="w-4 h-4" />
            返回课程列表
          </Button>
        </Link>
      </div>
    </div>
  );
}
