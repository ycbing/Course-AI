"use client";

import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  subtext?: string;
}

export function LoadingOverlay({ visible, text, subtext }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-4 animate-scale-in">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
          </div>
          <div className="absolute -inset-3 rounded-3xl border border-blue-500/10 animate-ping opacity-30" />
        </div>
        {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
        {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
      </div>
    </div>
  );
}
