import { getCallLogs } from "@/src/actions/models";
import { ItemCard } from "../components/item-card";

export default async function LogsPage() {
  const logs = await getCallLogs({ limit: 50 });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">模型调用日志</h1>
      <div className="grid gap-4">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">暂无调用日志</div>
        ) : (
          logs.map((log) => (
            <ItemCard key={log.id} title={`${log.provider?.providerName || "未知提供商"} - ${log.callReason}`}>
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
                <div className="flex justify-between items-center">
                  <span>耗时: {log.durationMs}ms</span>
                </div>
                {log.errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-red-400 mt-2 font-mono text-xs break-all">
                    错误: {log.errorMessage}
                  </div>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer hover:text-foreground transition-colors">查看配置快照</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                    {JSON.stringify(log.modelConfigSnapshot as object, null, 2)}
                  </pre>
                </details>
              </div>
            </ItemCard>
          ))
        )}
      </div>
    </div>
  );
}
