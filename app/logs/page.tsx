import { DetailsCard } from "@/components/details-card";
import { getCallLogs, getCallStatistics } from "@/src/actions/models";
import { getWorld } from "@workflow/core/runtime";
import { ItemCard } from "../../components/item-card";
import { LogsFilter } from "./_components/logs-filter";

interface PageProps {
  searchParams: Promise<{
    workflowId?: string;
  }>;
}

export default async function LogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const workflowId = params.workflowId;

  // 获取所有工作流运行
  const world = getWorld();
  const runsResponse = await world.runs.list({});
  const runs = runsResponse.data || [];

  // 获取日志
  const logs = await getCallLogs({ limit: 50 });

  // 如果选择了工作流，过滤日志（通过 callReason）
  const filteredLogs = workflowId
    ? logs.filter((log) => typeof log.callReason === "string" && log.callReason.includes(workflowId))
    : logs;

  // 计算成本统计
  const stats = await getCallStatistics();

  // 计算特定工作流的成本
  const workflowStats = { totalTokens: 0, totalCost: 0, avgCostPerStep: 0 };
  if (workflowId) {
    const workflowLogs = logs.filter(
      (log) => typeof log.callReason === "string" && log.callReason.includes(workflowId),
    );
    workflowStats.totalTokens = workflowLogs.reduce(
      (sum, log) => sum + (log.inputTokens || 0) + (log.outputTokens || 0),
      0,
    );
    workflowStats.totalCost = workflowLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
    workflowStats.avgCostPerStep = workflowLogs.length > 0 ? workflowStats.totalCost / workflowLogs.length : 0;
  }

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

        {/* 工作流筛选 */}
        <LogsFilter runs={runs} selectedWorkflowId={workflowId} />

        {/* 工作流成本统计 */}
        {workflowId && (
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold mb-3">工作流成本统计</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">运行 Token 数</p>
                <p className="font-mono text-lg font-bold">{workflowStats.totalTokens}</p>
              </div>
              <div>
                <p className="text-muted-foreground">运行总成本</p>
                <p className="font-mono text-lg font-bold text-primary">${workflowStats.totalCost.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">平均单步成本</p>
                <p className="font-mono text-lg font-bold">${workflowStats.avgCostPerStep.toFixed(6)}</p>
              </div>
            </div>
          </div>
        )}

        {/* 日志列表 */}
        <div className="grid gap-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {workflowId ? "该工作流运行暂无调用日志" : "暂无调用日志"}
            </div>
          ) : (
            filteredLogs.map((log) => {
              // 从 callReason 中提取工作流 ID
              const workflowMatch = (log.callReason || "").match(/workflows\/([a-zA-Z0-9-]+)/);
              const relatedWorkflowId = workflowMatch?.[1];

              return (
                <ItemCard key={log.id} title={`${log.providerName} - ${log.modelName} (${log.callReason})`}>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        状态:
                        <span
                          className={
                            log.status === "success" ? "text-green-500 font-medium" : "text-red-500 font-medium"
                          }
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
                    <div className="flex justify-between items-center">
                      <span>耗时: {log.durationMs}ms</span>
                      {relatedWorkflowId && (
                        <a
                          href={`/workflows/${relatedWorkflowId}`}
                          className="text-primary hover:underline text-xs font-medium"
                        >
                          查看工作流运行 →
                        </a>
                      )}
                    </div>
                    {log.errorMessage && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-red-400 mt-2 font-mono text-xs break-all">
                        错误: {log.errorMessage}
                      </div>
                    )}
                    <DetailsCard label="配置快照" variant="minimal" icon>
                      <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.modelConfigSnapshot as object, null, 2)}
                      </pre>
                    </DetailsCard>
                  </div>
                </ItemCard>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
