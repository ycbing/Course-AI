"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Play, Clock, BookOpen, Download, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.course) {
          setCourse(d.course);
          setSections(d.sections || []);
        } else {
          setError("分享内容不存在或已过期");
        }
      })
      .catch(() => setError("加载失败"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="skeleton w-16 h-16 rounded-2xl" />
          <div className="skeleton-text w-48 h-4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">😔</div>
          <p className="text-lg font-medium mb-2">{error}</p>
          <Link href="/" className="text-blue-400 hover:text-blue-600 text-sm">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2 animate-fade-up">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
              C
            </div>
            <div>
              <h1 className="text-xl font-bold animate-fade-up-delay-1">{course.title}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="text-gradient-blue font-medium">CourseAI</span>
                <span>·</span>
                <span>AI 生成</span>
                {course.share_count !== undefined && (
                  <>
                    <span>·</span>
                    <span>{course.share_count} 次浏览</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Video player */}
        {course.video_url && (
          <div className="rounded-2xl border border-slate-200 overflow-hidden mb-10 animate-fade-up-delay-2">
            <div className="aspect-video bg-black relative group">
              <video
                src={course.video_url}
                controls
                className="w-full h-full object-contain"
                preload="metadata"
              />
              {/* Download button overlay */}
              <a
                href={course.video_url}
                download
                className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-black/60 backdrop-blur-sm text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all z-10"
                title="下载视频"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
            {course.duration && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>
                    {Math.floor(course.duration / 60)}:
                    {String(Math.floor(course.duration % 60)).padStart(2, "0")}
                  </span>
                </div>
                {course.video_url && (
                  <a
                    href={course.video_url}
                    download
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-600 transition"
                  >
                    <Download className="w-3 h-3" />
                    下载视频
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cover fallback */}
        {!course.video_url && course.cover_url && (
          <div className="rounded-2xl border border-slate-200 overflow-hidden mb-10">
            <div className="aspect-video">
              <img
                src={course.cover_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Sections content - Timeline style */}
        {sections.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              教学内容
              <span className="text-xs text-slate-400 font-normal">
                共 {sections.length} 段
              </span>
            </h2>

            {/* Timeline layout */}
            <div className="relative pl-8">
              {/* Timeline line */}
              <div className="timeline-line" />

              <div className="space-y-8">
                {sections.map((s, i) => (
                  <div key={i} className="relative animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                    {/* Timeline dot */}
                    <div className="absolute -left-8 top-1">
                      <div className="timeline-dot" />
                    </div>

                    {/* Content card */}
                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3 px-4 py-3 border-b bg-slate-100/30 bg-white">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold">
                          {s.section_number}
                        </div>
                        <h3 className="text-sm font-medium">{s.title}</h3>
                      </div>

                      {s.image_url && (
                        <div className="border-b bg-slate-100/30">
                          <img
                            src={s.image_url}
                            alt={s.title}
                            className="w-full max-h-72 object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="p-4">
                        <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
                          {s.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Download video CTA (if no video shown inline) */}
        {course.video_url && sections.length > 0 && (
          <div className="mb-10 text-center">
            <a
              href={course.video_url}
              download
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/15"
            >
              <Download className="w-4 h-4" />
              下载教学视频
            </a>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 mt-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-[10px]">
                C
              </div>
              <span className="text-sm font-semibold text-slate-600">CourseAI</span>
              <span className="text-xs text-slate-400">— AI 课件/教学视频生成器</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>GLM-4</span>
              <span className="text-slate-200">·</span>
              <span>CogView-3</span>
              <span className="text-slate-200">·</span>
              <span>Edge-TTS</span>
              <span className="text-slate-200">·</span>
              <span>FFmpeg</span>
            </div>
          </div>
          <div className="text-center text-xs text-slate-300 mt-4">
            © {new Date().getFullYear()} CourseAI. Powered by GLM-4 + CogView + Edge-TTS + FFmpeg
          </div>
        </div>
      </footer>
    </div>
  );
}
