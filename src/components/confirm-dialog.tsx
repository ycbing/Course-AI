"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className={`relative w-full max-w-sm rounded-2xl border bg-white p-6 shadow-2xl transition-all duration-200 ${
          variant === "danger"
            ? "border-red-500/30"
            : "border-amber-500/30"
        } ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-slate-500 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            variant === "danger"
              ? "bg-red-500/10 text-red-400"
              : "bg-amber-500/10 text-amber-400"
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-1.5">{title}</h3>
        {description && (
          <p className="text-sm text-slate-500 leading-relaxed mb-6">{description}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-white text-sm font-medium transition shadow-lg ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-500 shadow-red-500/15"
                : "bg-amber-600 hover:bg-amber-500 shadow-amber-500/15"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
