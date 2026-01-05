"use client";

import { X } from "lucide-react";
import React, { ReactNode, useEffect, useRef } from "react";

interface ModalFormProps {
  open: boolean;
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
  open,
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
  const dialogRef = useRef<HTMLDialogElement>(null);

  // 监听 open prop 变化，控制 dialog 的显示/隐藏
  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  // 监听 dialog 的 cancel 和 close 事件，触发 onClose 回调
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = () => {
      onClose();
    };

    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="p-0 rounded-2xl shadow-2xl backdrop:bg-black/50 dialog-open:animate-in dialog-open:fade-in dialog-open:zoom-in dialog-open:duration-200 backdrop:dialog-open:animate-in backdrop:dialog-open:fade-in"
    >
      <div className={`bg-card rounded-2xl shadow-2xl w-full ${maxWidth} max-h-full flex flex-col overflow-hidden`}>
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
    </dialog>
  );
}
