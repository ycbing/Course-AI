"use client";

import { GripVertical, Edit3, RefreshCw, Loader2, ImageIcon } from "lucide-react";

export interface SectionCardData {
  id: string;
  sectionNumber: number;
  title: string;
  content: string;
  imageUrl: string;
  audioUrl: string;
  duration: number | null;
}

interface SectionCardProps {
  section: SectionCardData;
  index: number;
  onEditContent?: (index: number, content: string) => void;
  onRegenerateSection?: (index: number) => void;
  onRegenerateImage?: (index: number) => void;
  imageGenerating?: boolean;
  sectionRegenerating?: number | null;
  onPlayAudio?: (index: number) => void;
  isPlaying?: number | null;
  mode?: "script" | "images" | "voiceover";
}

export function SectionCard({
  section,
  index,
  onEditContent,
  onRegenerateSection,
  onRegenerateImage,
  imageGenerating,
  sectionRegenerating,
  onPlayAudio,
  isPlaying,
  mode = "script",
}: SectionCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
        <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {section.sectionNumber}
        </div>
        <h3 className="text-sm font-medium flex-1 min-w-0 truncate">{section.title}</h3>
        <div className="flex items-center gap-1.5">
          {(mode === "script" || mode === "images") && onRegenerateSection && (
            <button
              onClick={() => onRegenerateSection(index)}
              disabled={sectionRegenerating === index}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-600 transition disabled:opacity-30"
              title="重新生成此段"
            >
              {sectionRegenerating === index ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          {mode === "images" && onRegenerateImage && (
            <button
              onClick={() => onRegenerateImage(index)}
              disabled={imageGenerating}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-600 transition disabled:opacity-30"
              title="重新生成配图"
            >
              {imageGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          {mode === "voiceover" && onPlayAudio && section.audioUrl && (
            <button
              onClick={() => onPlayAudio(index)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium transition ${
                isPlaying === index
                  ? "bg-primary-500/20 text-primary-400"
                  : "bg-neutral-100 text-neutral-500 hover:bg-primary-50"
              }`}
            >
              {isPlaying === index ? "暂停" : "播放"}
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="p-4">
        {mode === "script" && (
          <textarea
            value={section.content}
            onChange={(e) => onEditContent?.(index, e.target.value)}
            className="w-full bg-transparent text-sm text-neutral-600 leading-relaxed resize-none focus:outline-none placeholder:text-slate-400"
            rows={6}
            placeholder="教学文案内容..."
          />
        )}

        {mode === "images" && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="text-sm text-neutral-500 leading-relaxed line-clamp-4">{section.content}</p>
            </div>
            <div className="w-full sm:w-48 h-32 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
              {section.imageUrl ? (
                <img src={section.imageUrl} alt={section.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-neutral-300" />
                </div>
              )}
            </div>
          </div>
        )}

        {mode === "voiceover" && (
          <div className="space-y-3">
            <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3">{section.content}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{section.audioUrl ? "✓ 配音已生成" : "○ 待生成"}</span>
              {section.duration && <span>· {section.duration.toFixed(1)}s</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
