"use client";

import { clsx } from "clsx";
import { X } from "lucide-react";
import React, { ReactNode, useCallback, useEffect, useRef } from "react";
import { useOverlayRef } from "./overlay/overlay-context";

interface ModalFormProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  children: ReactNode;
  submitLabel?: string;
  loadingLabel?: string;
  className?: string;
  maxWidth?: string;
  onClose?: () => void;
}

export function ModalForm({
  title,
  onSubmit,
  loading = false,
  children,
  submitLabel = "保存",
  loadingLabel = "保存中...",
  className = "",
  maxWidth = "max-w-xl",
  onClose,
}: ModalFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const overlayRef = useOverlayRef();

  const performClose = useCallback(async () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.close();
    // 执行后置回调
    if (onClose) {
      onClose();
    }
    // 等待动画完成
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 关闭 overlay
    overlayRef.close();
  }, [onClose, overlayRef]);

  // 监听 dialog 的 cancel 事件，触发关闭流程
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();

    const handleCancel = (e: Event) => {
      e.preventDefault();
      performClose();
    };

    dialog.addEventListener("cancel", handleCancel);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [performClose]);

  return (
    <dialog
      ref={dialogRef}
      className="
        max-h-full max-w-full grid items-center justify-center w-full h-full p-0 
        starting:opacity-0 starting:scale-95 starting:duration-100
        not-dialog-open:opacity-0 not-dialog-open:scale-95
        transition-all duration-200 ease-out
        transition-discrete bg-transparent
        backdrop:transition-all backdrop:transition-discrete
        starting:backdrop:opacity-0 starting:backdrop:duration-100
        not-dialog-open:backdrop:opacity-0
        backdrop:bg-black/30
      "
    >
      <div className={clsx("bg-card rounded-2xl shadow-2xl w-screen flex-1 flex flex-col overflow-hidden", maxWidth)}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border flex-none">
          <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
          <button onClick={performClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className={clsx("p-4 sm:p-6 space-y-4 overflow-y-auto flex-1", className)}>
          {children}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={performClose}
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
