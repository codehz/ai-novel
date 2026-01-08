import { getCallLogs, getCallStatistics } from "@/src/actions/models";
import { CallLogsList } from "./_components/call-logs-list";
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
  const result = await getCallLogs({ limit: 20, callReason });

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
        <CallLogsList
          logs={result.data}
          selectedCallReason={callReason}
          hasMore={result.hasMore}
          cursor={result.nextCursor}
        />
      </div>
    </div>
  );
}
