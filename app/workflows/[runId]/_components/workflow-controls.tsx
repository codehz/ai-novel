"use client";

import { useConfirm } from "@/hooks/useConfirm";
import { cancelWorkflowRun, pauseWorkflowRun, resumeWorkflowRun } from "@/src/actions/workflows";
import clsx from "clsx";
import { Pause, Play, X } from "lucide-react";
import { ReactNode, useState, useTransition } from "react";

type ActionButtonProps = {
  onClick: () => void;
  disabled: boolean;
  pending?: boolean;
  colorClasses: string;
  icon?: ReactNode;
  children: ReactNode;
};

function ActionButton({ onClick, disabled, pending, colorClasses, icon, children }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${colorClasses} disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm`}
    >
      {pending ? (
        <>
          <span className="animate-spin inline-block">⏳</span>
          处理中...
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

interface WorkflowControlsProps {
  runId: string;
  status: string;
}

export function WorkflowControls({ runId, status }: WorkflowControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const confirm = useConfirm();

  const handlePause = () => {
    startTransition(async () => {
      const result = await pauseWorkflowRun(runId);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  const handleResume = () => {
    startTransition(async () => {
      const result = await resumeWorkflowRun(runId);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  const handleCancel = async () => {
    if (!(await confirm("确定要取消工作流运行吗？此操作无法撤销。"))) {
      return;
    }
    startTransition(async () => {
      const result = await cancelWorkflowRun(runId);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  const showControls = status === "running" || status === "paused";

  if (!showControls) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {status === "running" && (
          <>
            <ActionButton
              onClick={handlePause}
              disabled={isPending}
              pending={isPending}
              colorClasses="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400"
              icon={<Pause className="w-4 h-4" />}
            >
              暂停
            </ActionButton>
            <ActionButton
              onClick={handleCancel}
              disabled={isPending}
              pending={isPending}
              colorClasses="bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400"
              icon={<X className="w-4 h-4" />}
            >
              取消
            </ActionButton>
          </>
        )}

        {status === "paused" && (
          <>
            <ActionButton
              onClick={handleResume}
              disabled={isPending}
              pending={isPending}
              colorClasses="bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-400"
              icon={<Play className="w-4 h-4" />}
            >
              恢复
            </ActionButton>
            <ActionButton
              onClick={handleCancel}
              disabled={isPending}
              pending={isPending}
              colorClasses="bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400"
              icon={<X className="w-4 h-4" />}
            >
              取消
            </ActionButton>
          </>
        )}
      </div>

      {message && (
        <div
          className={clsx(
            "p-3 rounded-lg text-sm font-medium",
            message.type === "success"
              ? "bg-green-500/10 text-green-700 dark:text-green-400"
              : "bg-red-500/10 text-red-700 dark:text-red-400",
          )}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
