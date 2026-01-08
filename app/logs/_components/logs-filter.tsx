"use client";

import { Dropdown } from "@/components/dropdown";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface Run {
  runId: string;
  workflowName: string;
  status: string;
  createdAt?: Date;
}

interface LogsFilterProps {
  runs: Run[];
  selectedWorkflowRunId?: string;
}

export function LogsFilter({ runs, selectedWorkflowRunId }: LogsFilterProps) {
  const router = useRouter();

  const handleSelect = (workflowRunId: string | null) => {
    if (workflowRunId) {
      router.push(`/logs?workflowRunId=${workflowRunId}`);
    } else {
      router.push("/logs");
    }
  };

  const selectedRun = runs.find((r) => r.runId === selectedWorkflowRunId);

  return (
    <Dropdown
      content={({ close }) => (
        <div>
          <button
            onClick={() => {
              handleSelect(null);
              close();
            }}
            className={`w-full text-left px-4 py-2 hover:bg-muted transition-colors ${
              !selectedWorkflowRunId ? "bg-primary/10 font-medium" : ""
            }`}
          >
            全部日志
          </button>

          {runs.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">暂无工作流运行</div>
          ) : (
            runs.map((run) => (
              <button
                key={run.runId}
                onClick={() => {
                  handleSelect(run.runId);
                  close();
                }}
                className={`w-full text-left px-4 py-2 hover:bg-muted transition-colors border-t border-border flex items-center justify-between ${
                  selectedWorkflowRunId === run.runId ? "bg-primary/10 font-medium" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{run.workflowName}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{run.runId}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ml-2 ${
                    run.status === "completed"
                      ? "bg-green-500/10 text-green-700 dark:text-green-400"
                      : run.status === "running"
                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                        : run.status === "failed"
                          ? "bg-red-500/10 text-red-700 dark:text-red-400"
                          : "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                  }`}
                >
                  {run.status}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    >
      <button className="flex w-full justify-between items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors font-medium text-sm">
        <span className="truncate min-w-0">
          {selectedRun ? `工作流运行: ${selectedRun.workflowName}` : "筛选工作流运行"}
        </span>
        <ChevronDown className="w-4 h-4 shrink-0" />
      </button>
    </Dropdown>
  );
}
