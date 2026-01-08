import { DetailsCard } from "@/components/details-card";
import { getCallLogs, getCallStatistics } from "@/src/actions/models";
import { formatDateToLocaleString } from "@/src/lib/format";
import { ItemCard } from "../../components/item-card";
import { LogsFilter } from "./_components/logs-filter";

interface PageProps {
  searchParams: Promise<{
    callReason?: string;
  }>;
}

export default async function LogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const callReason = params.callReason;

  // 获取日志，如果选择了 callReason 则过滤
  const logs = await getCallLogs({
    limit: 50,
    ...(callReason && { callReason }),
  });

  // 计算成本统计
  const stats = await getCallStatistics(callReason ? { callReason } : undefined);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">模型调用日志</h1>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">总调用次数</p>
            <p className="text-2xl font-bold">{stats?.count || 0}</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">总 Token 数</p>
            <p className="text-2xl font-bold">{stats?.totalTokens || 0}</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">总成本</p>
            <p className="text-2xl font-bold">${(stats?.totalCost || 0).toFixed(6)}</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">成功率</p>
            <p className="text-2xl font-bold">
              {stats && stats.count > 0 ? (((stats.successCount || 0) / stats.count) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* callReason 筛选 */}
        <LogsFilter selectedCallReason={callReason} />

        {/* 日志列表 */}
        <div className="grid gap-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">暂无调用日志</div>
          ) : (
            logs.map((log) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
