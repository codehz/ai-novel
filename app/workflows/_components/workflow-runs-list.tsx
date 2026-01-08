"use client";

import { FormField } from "@/components/form-field";
import { ItemCard } from "@/components/item-card";
import { SelectInput } from "@/components/select-input";
import { WorkflowRun, WorkflowRunStatus } from "@workflow/world";
import { AlertCircle, CheckCircle2, Clock, Pause, X } from "lucide-react";
import { useMemo, useState } from "react";

interface WorkflowRunsListProps {
  runs: WorkflowRun[];
}

const statusColors: Record<WorkflowRunStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", icon: <Clock className="w-4 h-4" /> },
  running: {
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    icon: <Clock className="w-4 h-4 animate-spin" />,
  },
  completed: {
    bg: "bg-green-500/10",
    text: "text-green-700 dark:text-green-400",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  failed: { bg: "bg-red-500/10", text: "text-red-700 dark:text-red-400", icon: <AlertCircle className="w-4 h-4" /> },
  paused: { bg: "bg-gray-500/10", text: "text-gray-700 dark:text-gray-400", icon: <Pause className="w-4 h-4" /> },
  cancelled: { bg: "bg-gray-500/10", text: "text-gray-700 dark:text-gray-400", icon: <X className="w-4 h-4" /> },
};

const statusLabels: Record<WorkflowRunStatus, string> = {
  pending: "等待中",
  running: "运行中",
  completed: "已完成",
  failed: "失败",
  paused: "已暂停",
  cancelled: "已取消",
};

export function WorkflowRunsList({ runs }: WorkflowRunsListProps) {
  const [selectedStatus, setSelectedStatus] = useState<WorkflowRunStatus | "all">("all");

  const filteredAndSorted = useMemo(() => {
    let filtered = runs;

    if (selectedStatus !== "all") {
      filtered = filtered.filter((run) => run.status === selectedStatus);
    }

    // 按创建时间倒序排序
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [runs, selectedStatus]);

  const formatDate = (date: Date | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("zh-CN");
  };

  const formatDuration = (startedAt: Date | undefined, completedAt: Date | undefined) => {
    if (!startedAt || !completedAt) return "-";
    const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    return `${duration}ms`;
  };

  return (
    <div className="space-y-6">
      <FormField label="按状态筛选：">
        <SelectInput
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as WorkflowRunStatus | "all")}
          options={[
            { value: "all", label: "全部状态" },
            { value: "pending", label: "等待中" },
            { value: "running", label: "运行中" },
            { value: "completed", label: "已完成" },
            { value: "failed", label: "失败" },
            { value: "paused", label: "已暂停" },
            { value: "cancelled", label: "已取消" },
          ]}
          placeholder="全部状态"
          className="px-3 py-2 rounded-lg border border-border bg-card text-foreground hover:border-primary/50 transition-colors"
        />
      </FormField>

      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无工作流运行</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAndSorted.map((run) => {
            const color = statusColors[run.status];
            const label = statusLabels[run.status];

            return (
              <ItemCard title={run.runId} key={run.runId} href={`/workflows/${run.runId}`} subtitle={run.runId}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${color.bg} ${color.text}`}
                    >
                      {color.icon}
                      {label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">启动时间</p>
                      <p className="font-mono">{formatDate(run.startedAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">完成时间</p>
                      <p className="font-mono">{formatDate(run.completedAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">创建时间</p>
                      <p className="font-mono">{formatDate(run.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">执行耗时</p>
                      <p className="font-mono">{formatDuration(run.startedAt, run.completedAt)}</p>
                    </div>
                  </div>
                </div>
              </ItemCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
