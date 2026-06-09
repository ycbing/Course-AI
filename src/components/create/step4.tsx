"use client";

import { useState, useEffect, useMemo } from "react";
import { Palette, Check } from "lucide-react";
import { toast } from "sonner";

interface Step4Props {
  courseId: string;
  onNext: () => void;
  onPrev: () => void;
}

interface SectionData {
  title: string;
  content: string;
  imageUrl: string;
}

const THEMES = [
  {
    id: "business",
    name: "商务蓝",
    desc: "专业稳重，适合商务培训、企业课程",
    colors: { primary: "#1E3A5F", accent: "#3B82F6", bg: "#0F172A" },
  },
  {
    id: "education",
    name: "教育绿",
    desc: "清新自然，适合学校教学、知识科普",
    colors: { primary: "#2E7D32", accent: "#66BB6A", bg: "#1B5E20" },
  },
  {
    id: "minimal",
    name: "简约灰",
    desc: "简洁大方，适合通用场景和极简风格",
    colors: { primary: "#333333", accent: "#616161", bg: "#FAFAFA" },
  },
  {
    id: "tech",
    name: "科技深色",
    desc: "现代科技感，适合技术教程、编程课程",
    colors: { primary: "#0F172A", accent: "#3B82F6", bg: "#0F172A" },
  },
];

const LAYOUTS = [
  { id: "image-left", name: "左图右文", icon: "🖼️", desc: "配图在左，文字在右" },
  { id: "image-top", name: "上图下文", icon: "📝", desc: "配图在上，文字在下" },
  { id: "text-only", name: "纯文字", icon: "📄", desc: "仅有标题和要点" },
  { id: "full-image", name: "全屏配图", icon: "🖼️", desc: "配图全屏，文字叠底" },
];

/* ─── Helpers ─── */

function proxifyImageUrl(url: string): string {
  if (!url) return "";
  if (url.includes(".cos.")) return `/api/cos/${url}`;
  return url;
}

function extractBulletPoints(content: string, max = 3): string[] {
  if (!content) return [];
  const cleaned = content.replace(/<[^>]*>/g, "");
  const sentences = cleaned
    .split(/[。！？\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 4);
  return sentences.slice(0, max);
}

function truncateText(text: string, max = 150): string {
  if (!text) return "";
  const cleaned = text.replace(/<[^>]*>/g, "");
  return cleaned.length > max ? cleaned.slice(0, max) + "…" : cleaned;
}

function slideTextColor(bg: string) {
  // For light backgrounds use dark text, for dark backgrounds use white
  const isLight = bg === "#FAFAFA";
  return isLight ? "#333333" : "#FFFFFF";
}

/* ─── Slide Components ─── */

function CoverSlide({ title, colors }: { title: string; colors: { primary: string; accent: string; bg: string } }) {
  const txt = slideTextColor(colors.bg);
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Decorative accent line top */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-16 h-[2px] rounded" style={{ backgroundColor: colors.accent }} />
      {/* Title */}
      <h2 className="text-base font-bold text-center px-6 leading-snug max-w-[80%]" style={{ color: txt }}>
        {title || "课程标题"}
      </h2>
      {/* Decorative accent line bottom */}
      <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-16 h-[2px] rounded" style={{ backgroundColor: colors.accent }} />
      {/* Corner accents */}
      <div className="absolute top-4 left-4 w-6 h-6 border-l-[2px] border-t-[2px] rounded-tl-sm" style={{ borderColor: colors.accent + "60" }} />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-r-[2px] border-b-[2px] rounded-br-sm" style={{ borderColor: colors.accent + "60" }} />
    </div>
  );
}

function ContentSlideImageLeft({ section, colors }: { section: SectionData; colors: { primary: string; accent: string; bg: string } }) {
  const points = extractBulletPoints(section.content);
  const imgUrl = proxifyImageUrl(section.imageUrl);
  const titleText = section.title || "章节标题";
  return (
    <div className="w-full h-full flex relative" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Left image area */}
      <div className="w-[40%] h-full bg-zinc-100 relative overflow-hidden">
        {imgUrl ? (
          <img src={imgUrl} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">配图区域</div>
        )}
      </div>
      {/* Right content area */}
      <div className="w-[60%] flex flex-col justify-center px-4 py-3">
        <h3 className="text-sm font-bold mb-2" style={{ color: colors.primary }}>{titleText}</h3>
        <div className="space-y-1">
          {points.map((pt, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors.accent }} />
              <span className="text-[10px] leading-relaxed text-slate-400 line-clamp-2">{pt}</span>
            </div>
          ))}
          {points.length === 0 && (
            <span className="text-[10px] text-slate-500">暂无要点内容</span>
          )}
        </div>
        {/* Bottom accent bar */}
        <div className="mt-auto h-[2px] rounded" style={{ backgroundColor: colors.accent }} />
      </div>
    </div>
  );
}

function ContentSlideImageTop({ section, colors }: { section: SectionData; colors: { primary: string; accent: string; bg: string } }) {
  const points = extractBulletPoints(section.content);
  const imgUrl = proxifyImageUrl(section.imageUrl);
  const titleText = section.title || "章节标题";
  const subtitle = truncateText(section.content, 80);
  return (
    <div className="w-full h-full flex flex-col relative" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Top image area */}
      <div className="h-[50%] bg-zinc-100 relative overflow-hidden">
        {imgUrl ? (
          <img src={imgUrl} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">配图区域</div>
        )}
      </div>
      {/* Bottom content area */}
      <div className="h-[50%] flex flex-col justify-center px-4 py-2">
        <h3 className="text-sm font-bold mb-1.5" style={{ color: colors.primary }}>{titleText}</h3>
        <p className="text-[10px] text-slate-500 leading-relaxed mb-1.5 line-clamp-3">{subtitle}</p>
        <div className="space-y-1">
          {points.slice(0, 2).map((pt, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors.accent }} />
              <span className="text-[10px] leading-relaxed text-slate-400 line-clamp-1">{pt}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: colors.accent }} />
    </div>
  );
}

function ContentSlideTextOnly({ section, colors }: { section: SectionData; colors: { primary: string; accent: string; bg: string } }) {
  const points = extractBulletPoints(section.content);
  const titleText = section.title || "章节标题";
  const isLight = colors.bg === "#FAFAFA";
  const txt = slideTextColor(colors.bg);
  return (
    <div
      className="w-full h-full flex flex-col justify-center relative px-6 py-4"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: colors.accent }} />
      <h3 className="text-sm font-bold mb-3" style={{ color: isLight ? colors.primary : "#FFFFFF" }}>{titleText}</h3>
      <div className="space-y-2">
        {points.map((pt, i) => (
          <div key={i} className="flex items-start gap-2">
            <span
              className="mt-0.5 w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0"
              style={{ backgroundColor: colors.accent, color: "#FFFFFF" }}
            >
              {i + 1}
            </span>
            <span className="text-[10px] leading-relaxed" style={{ color: isLight ? "#555" : "rgba(255,255,255,0.8)", lineHeight: "1.5" }}>
              {pt}
            </span>
          </div>
        ))}
        {points.length === 0 && (
          <span className="text-[10px]" style={{ color: isLight ? "#999" : "rgba(255,255,255,0.4)" }}>暂无要点内容</span>
        )}
      </div>
    </div>
  );
}

function ContentSlideFullImage({ section, colors }: { section: SectionData; colors: { primary: string; accent: string; bg: string } }) {
  const imgUrl = proxifyImageUrl(section.imageUrl);
  const titleText = section.title || "章节标题";
  const subtitle = truncateText(section.content, 80);
  return (
    <div className="w-full h-full relative overflow-hidden">
      {imgUrl ? (
        <img src={imgUrl} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm" style={{ backgroundColor: colors.bg }}>配图区域</div>
      )}
      {/* Bottom text overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-4 py-3">
        <h3 className="text-xs font-bold text-white mb-0.5">{titleText}</h3>
        <p className="text-[9px] text-white/80 leading-relaxed line-clamp-2">{subtitle}</p>
      </div>
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: colors.accent }} />
    </div>
  );
}

function EndingSlide({ colors }: { colors: { primary: string; accent: string; bg: string } }) {
  const txt = slideTextColor(colors.bg);
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-12 h-[1px]" style={{ backgroundColor: colors.accent }} />
      <p className="text-lg font-bold" style={{ color: txt }}>谢谢观看</p>
      <p className="text-[9px] mt-2" style={{ color: colors.accent }}>THANK YOU</p>
      <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-12 h-[1px]" style={{ backgroundColor: colors.accent }} />
      {/* Corner accents */}
      <div className="absolute top-3 right-3 w-5 h-5 border-r-[2px] border-t-[2px] rounded-tr-sm" style={{ borderColor: colors.accent + "40" }} />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-l-[2px] border-b-[2px] rounded-bl-sm" style={{ borderColor: colors.accent + "40" }} />
    </div>
  );
}

function ContentSlide({ section, layout, colors }: { section: SectionData; layout: string; colors: { primary: string; accent: string; bg: string } }) {
  switch (layout) {
    case "image-top":
      return <ContentSlideImageTop section={section} colors={colors} />;
    case "text-only":
      return <ContentSlideTextOnly section={section} colors={colors} />;
    case "full-image":
      return <ContentSlideFullImage section={section} colors={colors} />;
    default:
      return <ContentSlideImageLeft section={section} colors={colors} />;
  }
}

export default function Step4({ courseId, onNext, onPrev }: Step4Props) {
  const [selectedTheme, setSelectedTheme] = useState("business");
  const [selectedLayout, setSelectedLayout] = useState("image-left");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [sections, setSections] = useState<SectionData[]>([]);

  useEffect(() => {
    if (loaded) return;
    fetch(`/api/courses/${courseId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.course?.theme) setSelectedTheme(d.course.theme);
        if (d?.course?.title) setCourseTitle(d.course.title);
        if (d?.sections?.length) setSections(d.sections);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [courseId, loaded]);

  const currentTheme = THEMES.find((t) => t.id === selectedTheme)!;
  const { colors } = currentTheme;

  // Pick sections for preview: one with image (slide 2) and one for text-only (slide 3)
  const previewSlides = useMemo(() => {
    const withImage = sections.find((s) => s.imageUrl);
    const anySection = sections[0];
    return {
      cover: courseTitle,
      contentWithImage: withImage || anySection || { title: "章节一", content: "这是示例章节的内容，展示幻灯片的排版效果。", imageUrl: "" },
      contentTextOnly: (withImage ? sections.find((s) => s !== withImage) : sections[1]) || anySection || { title: "章节二", content: "这是纯文字章节的示例内容。", imageUrl: "" },
    };
  }, [courseTitle, sections]);

  const saveAndNext = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: selectedTheme, progressStep: "style_ready" }),
      });
      if (res.ok) {
        toast.success("PPT 样式已保存");
        onNext();
      } else {
        toast.error("保存失败");
      }
    } catch {
      toast.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary-400" />
            PPT 样式
          </h2>
          <p className="text-sm text-slate-500">选择主题配色和幻灯片布局</p>
        </div>
      </div>

      {/* Theme selection */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 animate-fade-up-delay-1">
        <label className="text-xs font-medium text-slate-500 mb-4 block">选择主题</label>
        <div className="grid grid-cols-2 gap-4">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedTheme(theme.id)}
              className={`relative p-4 rounded-xl border text-left transition-all ${
                selectedTheme === theme.id
                  ? "border-primary-500/40 bg-primary-500/10 shadow-lg shadow-md"
                  : "border-slate-200 bg-slate-100 hover:bg-slate-50"
              }`}
            >
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Mini preview */}
              <div className="flex gap-2 mb-3">
                <div
                  className="w-8 h-6 rounded"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div className="flex-1 rounded overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: theme.colors.accent }} />
                  <div className="h-4 mt-0.5" style={{ backgroundColor: theme.colors.primary + "20" }} />
                </div>
              </div>

              <div className={`text-sm font-medium ${selectedTheme === theme.id ? "text-primary-400" : "text-slate-600"}`}>
                {theme.name}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                <span className="w-3 h-3 rounded-full border border-zinc-600" style={{ backgroundColor: theme.colors.bg }} />
                <span className="text-[10px] text-slate-400">{theme.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Layout preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 animate-fade-up-delay-2">
        <label className="text-xs font-medium text-slate-500 mb-4 block">布局方式（有配图的章节自动使用选中的布局）</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              type="button"
              onClick={() => setSelectedLayout(layout.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                selectedLayout === layout.id
                  ? "border-primary-500/40 bg-primary-500/10"
                  : "border-slate-200 bg-slate-100 hover:bg-slate-50"
              }`}
            >
              <div className="text-2xl mb-1">{layout.icon}</div>
              <div className={`text-xs font-medium ${selectedLayout === layout.id ? "text-primary-400" : "text-slate-600"}`}>
                {layout.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{layout.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Real slide preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 animate-fade-up-delay-3">
        <label className="text-xs font-medium text-slate-500 mb-4 block">效果预览</label>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {/* Slide 1: Cover */}
          <div className="flex-shrink-0 w-[320px] snap-center">
            <div className="aspect-[16/9] rounded-lg overflow-hidden shadow-lg ring-1 ring-white/5">
              <CoverSlide title={previewSlides.cover} colors={colors} />
            </div>
            <span className="text-[10px] text-slate-500 mt-1.5 block text-center">封面</span>
          </div>

          {/* Slide 2: Content with selected layout */}
          <div className="flex-shrink-0 w-[320px] snap-center">
            <div className="aspect-[16/9] rounded-lg overflow-hidden shadow-lg ring-1 ring-white/5">
              <ContentSlide
                section={previewSlides.contentWithImage}
                layout={selectedLayout}
                colors={colors}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1.5 block text-center">
              {selectedLayout === "text-only" ? "纯文字" : "内容页 · " + LAYOUTS.find((l) => l.id === selectedLayout)?.name}
            </span>
          </div>

          {/* Slide 3: Text-only layout */}
          <div className="flex-shrink-0 w-[320px] snap-center">
            <div className="aspect-[16/9] rounded-lg overflow-hidden shadow-lg ring-1 ring-white/5">
              <ContentSlide
                section={previewSlides.contentTextOnly}
                layout="text-only"
                colors={colors}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1.5 block text-center">纯文字</span>
          </div>

          {/* Slide 4: Ending */}
          <div className="flex-shrink-0 w-[320px] snap-center">
            <div className="aspect-[16/9] rounded-lg overflow-hidden shadow-lg ring-1 ring-white/5">
              <EndingSlide colors={colors} />
            </div>
            <span className="text-[10px] text-slate-500 mt-1.5 block text-center">结尾</span>
          </div>
        </div>
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
          onClick={saveAndNext}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium text-sm transition-all disabled:opacity-40 shadow-lg shadow-md"
        >
          {saving ? "保存中..." : "下一步：导出 PPTX"}
        </button>
      </div>
    </div>
  );
}
