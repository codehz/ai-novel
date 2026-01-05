"use client";

import { X } from "lucide-react";
import React, { ReactNode } from "react";

interface ModalFormProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  children: ReactNode;
  submitLabel?: string;
  loadingLabel?: string;
  className?: string;
  maxWidth?: string;
}

export function ModalForm({
  title,
  onClose,
  onSubmit,
  loading = false,
  children,
  submitLabel = "保存",
  loadingLabel = "保存中...",
  className = "",
  maxWidth = "max-w-md",
}: ModalFormProps) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`bg-card rounded-2xl shadow-2xl w-full ${maxWidth} max-h-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200`}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border flex-none">
          <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className={`p-4 sm:p-6 space-y-4 ${className} overflow-y-auto flex-1`}>
          {children}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? loadingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
