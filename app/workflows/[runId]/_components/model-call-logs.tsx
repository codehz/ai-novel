"use client";

import { DetailsCard } from "@/components/details-card";
import { ItemCard } from "@/components/item-card";
import Link from "next/link";

interface ModelCallLog {
  id: number;
  modelName: string;
  providerName: string;
  callReason: string | null;
  status: string;
  inputTokens: number | null;
  outputTokens: number | null;
  totalCost: number | null;
  durationMs: number | null;
  errorMessage: string | null;
  modelConfigSnapshot: unknown;
  createdAt: Date;
}

interface ModelCallLogsProps {
  callLogs: ModelCallLog[];
  showSection?: boolean;
}

export function ModelCallLogs({ callLogs, showSection = true }: ModelCallLogsProps) {
  if (callLogs.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">暂无模型调用日志</div>;
  }

  const content = (
    <>
      {showSection && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">模型调用日志</h2>
          <Link href="/logs" className="text-sm font-medium text-primary hover:underline">
            查看全部 →
          </Link>
        </div>
      )}

      {/* 日志统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">调用次数</p>
          <p className="text-2xl font-bold">{callLogs.length}</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">总 Token 数</p>
          <p className="text-2xl font-bold">
            {callLogs.reduce((sum, log) => sum + (log.inputTokens || 0) + (log.outputTokens || 0), 0)}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">总成本</p>
          <p className="text-2xl font-bold">
            ${callLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0).toFixed(6)}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">成功率</p>
          <p className="text-2xl font-bold">
            {callLogs.length > 0
              ? ((callLogs.filter((l) => l.status === "success").length / callLogs.length) * 100).toFixed(1)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* 日志列表 */}
      <div className="grid gap-4">
        {callLogs.map((log) => (
          <ItemCard
            key={log.id}
            title={`${log.providerName} - ${log.modelName}`}
            subtitle={log.callReason || "Unknown"}
          >
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  状态:
                  <span
                    className={log.status === "success" ? "text-green-500 font-medium" : "text-red-500 font-medium"}
                  >
                    {log.status === "success" ? "成功" : "失败"}
                  </span>
                </span>
                <span>时间: {log.createdAt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>
                  Tokens: {log.inputTokens} (入) / {log.outputTokens} (出)
                </span>
                <span className="font-mono text-primary">成本: ${log.totalCost?.toFixed(6)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>耗时: {log.durationMs}ms</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`/logs?callReason=${encodeURIComponent(log.callReason || "")}`}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    🔗 相同 callReason
                  </a>
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
        ))}
      </div>
    </>
  );

  if (showSection) {
    return <section className="space-y-6">{content}</section>;
  }

  return content;
}
