"use client";

import { FormField } from "@/components/form-field";
import { ItemCard } from "@/components/item-card";
import { SelectInput } from "@/components/select-input";
import { usePagination } from "@/hooks/usePagination";
import { loadMoreWorkflowRuns } from "@/src/actions/workflows";
import { formatDateToLocaleString } from "@/src/lib/format";
import { AutoTransition } from "@codehz/auto-transition";
import { WorkflowRun, WorkflowRunStatus } from "@workflow/world";
import { AlertCircle, CheckCircle2, Clock, Pause, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface WorkflowRunsListProps {
  runs: WorkflowRun[];
  selectedStatus?: WorkflowRunStatus;
  hasMore: boolean;
  cursor: string | null;
}

const statusConfigs: Record<WorkflowRunStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  pending: {
    label: "等待中",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    icon: <Clock className="w-4 h-4" />,
  },
  running: {
    label: "运行中",
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    icon: <Clock className="w-4 h-4 animate-spin" />,
  },
  completed: {
    label: "已完成",
    bg: "bg-green-500/10",
    text: "text-green-700 dark:text-green-400",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  failed: {
    label: "失败",
    bg: "bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  paused: {
    label: "已暂停",
    bg: "bg-gray-500/10",
    text: "text-gray-700 dark:text-gray-400",
    icon: <Pause className="w-4 h-4" />,
  },
  cancelled: {
    label: "已取消",
    bg: "bg-gray-500/10",
    text: "text-gray-700 dark:text-gray-400",
    icon: <X className="w-4 h-4" />,
  },
};

const statusOptions = [
  { value: "all", label: "全部状态" },
  ...Object.entries(statusConfigs).map(([status, config]) => ({ value: status, label: config.label })),
];

function WorkflowRunItem({ run }: { run: WorkflowRun }) {
  const formatDuration = (startedAt: Date | undefined, completedAt: Date | undefined) => {
    if (!startedAt || !completedAt) return "-";
    const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    return `${duration}ms`;
  };

  const config = statusConfigs[run.status];

  return (
    <ItemCard title={run.workflowName} href={`/workflows/${run.runId}`} subtitle={run.runId}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}
          >
            {config.icon}
            {config.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">启动时间</p>
            <p className="font-mono">{formatDateToLocaleString(run.startedAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">完成时间</p>
            <p className="font-mono">{formatDateToLocaleString(run.completedAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">创建时间</p>
            <p className="font-mono">{formatDateToLocaleString(run.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">执行耗时</p>
            <p className="font-mono">{formatDuration(run.startedAt, run.completedAt)}</p>
          </div>
        </div>
      </div>
    </ItemCard>
  );
}

export function WorkflowRunsList({ runs, selectedStatus, hasMore, cursor }: WorkflowRunsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    items: allRuns,
    isPending,
    loadMore,
  } = usePagination({
    initialItems: runs,
    initialCursor: cursor,
    initialHasMore: hasMore,
    onLoadMore: useCallback(
      async (loadCursor) => {
        const result = await loadMoreWorkflowRuns(loadCursor, selectedStatus);
        return result;
      },
      [selectedStatus],
    ),
  });

  const handleStatusChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value === "all") {
        params.delete("status");
      } else {
        params.set("status", value);
      }
      router.push(`/workflows?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-6">
      <FormField label="按状态筛选：">
        <SelectInput
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          options={statusOptions}
          placeholder="全部状态"
          className="px-3 py-2 rounded-lg border border-border bg-card text-foreground hover:border-primary/50 transition-colors"
        />
      </FormField>

      <AutoTransition as="div" className="grid relative gap-4">
        {allRuns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无工作流运行</p>
          </div>
        ) : (
          allRuns.map((run) => <WorkflowRunItem key={run.runId} run={run} />)
        )}
      </AutoTransition>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="px-6 py-2.5 border border-border bg-card text-foreground rounded-lg font-medium hover:bg-muted hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "加载中..." : "加载更多"}
          </button>
        </div>
      )}
    </div>
  );
}
