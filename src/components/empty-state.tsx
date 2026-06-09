"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, action, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-neutral-300 page-transition">
      {icon ? (
        <div className="mb-6 animate-float">{icon}</div>
      ) : (
        <div className="text-5xl mb-6 animate-float">📭</div>
      )}
      <p className="text-base text-neutral-500 font-medium mb-2">{title}</p>
      {description && (
        <p className="text-sm text-neutral-400 mb-6 max-w-sm text-center">{description}</p>
      )}
      {action && onAction && (
        <Button onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}
