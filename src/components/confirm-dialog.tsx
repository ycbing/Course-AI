"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className={variant === "danger" ? "border-red-500/30" : "border-amber-500/30"}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                variant === "danger"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className={variant === "warning" ? "bg-amber-600 hover:bg-amber-500" : ""}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
