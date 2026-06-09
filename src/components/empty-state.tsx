"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, action, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-slate-300 page-transition">
      {icon ? (
        <div className="mb-6 animate-float">{icon}</div>
      ) : (
        <div className="text-5xl mb-6 animate-float">📭</div>
      )}
      <p className="text-base text-slate-500 font-medium mb-2">{title}</p>
      {description && (
        <p className="text-sm text-slate-400 mb-6 max-w-sm text-center">{description}</p>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-all"
        >
          {action}
        </button>
      )}
    </div>
  );
}
