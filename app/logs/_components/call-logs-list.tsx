"use client";

import { DetailsCard } from "@/components/details-card";
import { ItemCard } from "@/components/item-card";
import { formatDateToLocaleString } from "@/components/lib/format";
import { LoadMoreButton } from "@/components/load-more-button";
import { usePagination } from "@/hooks/usePagination";
import { getCallLogs } from "@/src/actions/models";
import { AutoTransition } from "@codehz/auto-transition";
import { useCallback } from "react";

interface CallLog {
  id: number;
  modelName: string;
  providerName: string;
  callReason: string;
  status: string;
  createdAt: Date;
  inputTokens: number | null;
  outputTokens: number | null;
  totalCost: number | null;
  durationMs: number | null;
  workflowRunId: string | null;
  errorMessage: string | null;
  modelConfigSnapshot: unknown;
}

interface CallLogsListProps {
  logs: CallLog[];
  selectedCallReason?: string;
  hasMore: boolean;
  cursor: string | null;
}

function CallLogItem({ log }: { log: CallLog }) {
  return (
    <ItemCard key={log.id} title={`${log.providerName} - ${log.modelName}`} subtitle={log.callReason || "Unknown"}>
      <div className="text-sm text-muted-foreground space-y-2">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            状态:
            <span className={log.status === "success" ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
              {log.status === "success" ? "成功" : "失败"}
            </span>
          </span>
          <span>时间: {formatDateToLocaleString(log.createdAt)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>
            Tokens: {log.inputTokens ?? "-"} (入) / {log.outputTokens ?? "-"} (出)
          </span>
          <span className="font-mono text-primary">成本: ${(log.totalCost ?? 0).toFixed(6)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>耗时: {log.durationMs ?? "-"}ms</span>
          <div className="flex items-center gap-2">
            {log.workflowRunId && (
              <a
                href={`/workflows/${log.workflowRunId}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                🔗 工作流 {log.workflowRunId.slice(0, 8)}...
              </a>
            )}
          </div>
        </div>
        {log.errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-red-400 mt-2 font-mono text-xs break-all">
            错误: {log.errorMessage}
          </div>
        )}
        <DetailsCard label="配置快照" variant="minimal">
          <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
            {JSON.stringify(log.modelConfigSnapshot as object, null, 2)}
          </pre>
        </DetailsCard>
      </div>
    </ItemCard>
  );
}

export function CallLogsList({ logs, selectedCallReason, hasMore: initialHasMore, cursor }: CallLogsListProps) {
  const {
    items: allLogs,
    isPending,
    loadMore,
    hasMore,
  } = usePagination({
    initialItems: logs,
    initialCursor: cursor,
    initialHasMore: initialHasMore,
    onLoadMore: useCallback(
      async (loadCursor) => {
        const result = await getCallLogs({ callReason: selectedCallReason, cursor: loadCursor, limit: 20 });
        return {
          data: result.data,
          cursor: result.nextCursor,
          hasMore: result.hasMore,
        };
      },
      [selectedCallReason],
    ),
  });

  return (
    <div className="grid gap-4">
      <AutoTransition as="div" className="grid relative gap-4">
        {allLogs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">暂无调用日志</div>
        ) : (
          allLogs.map((log) => <CallLogItem key={log.id} log={log} />)
        )}
      </AutoTransition>

      <LoadMoreButton onClick={loadMore} isLoading={isPending} hasMore={hasMore} />
    </div>
  );
}
