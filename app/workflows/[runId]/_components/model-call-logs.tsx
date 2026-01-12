"use client";

import { DetailsCard } from "@/components/details-card";
import { ItemCard } from "@/components/item-card";
import { formatDateToLocaleString } from "@/components/lib/format";
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

  // 提取统计数据，避免重复计算
  const successCount = callLogs.filter((log) => log.status === "success").length;
  const totalTokens = callLogs.reduce((sum, log) => sum + (log.inputTokens || 0) + (log.outputTokens || 0), 0);
  const totalCost = callLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
  const successRate = callLogs.length > 0 ? (successCount / callLogs.length) * 100 : 0;

  const statsCards = [
    { label: "调用次数", value: callLogs.length },
    { label: "总 Token 数", value: totalTokens },
    { label: "总成本", value: `$${totalCost.toFixed(6)}` },
    { label: "成功率", value: `${successRate.toFixed(1)}%` },
  ];

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
        {statsCards.map((stat, index) => (
          <div key={index} className="p-4 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
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
                <span>时间: {formatDateToLocaleString(log.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>
                  Tokens: {log.inputTokens} (入) / {log.outputTokens} (出)
                </span>
                <span className="font-mono text-primary">成本: ${log.totalCost?.toFixed(6)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>耗时: {log.durationMs}ms</span>
                <Link
                  href={`/logs?callReason=${encodeURIComponent(log.callReason || "")}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  🔗 相同 callReason
                </Link>
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

  return showSection ? <section className="space-y-6">{content}</section> : content;
}
