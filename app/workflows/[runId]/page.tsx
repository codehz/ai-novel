import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { DetailsCard } from "@/components/details-card";
import { Tabs } from "@/components/tabs";
import { getCallLogs } from "@/src/actions/models";
import { formatDateToLocaleString, formatJson } from "@/src/lib/format";
import { getWorld } from "@workflow/core/runtime";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Pause, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ModelCallLogs } from "./_components/model-call-logs";
import { StepsTimeline } from "./_components/steps-timeline";
import { StreamViewer } from "./_components/stream-viewer";
import { WorkflowControls } from "./_components/workflow-controls";

interface PageProps {
  params: Promise<{ runId: string }>;
}

const statusLabels: Record<string, string> = {
  pending: "等待中",
  running: "运行中",
  completed: "已完成",
  failed: "失败",
  paused: "已暂停",
  cancelled: "已取消",
};

const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", icon: <Clock className="w-5 h-5" /> },
  running: {
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    icon: <Clock className="w-5 h-5 animate-spin" />,
  },
  completed: {
    bg: "bg-green-500/10",
    text: "text-green-700 dark:text-green-400",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  failed: { bg: "bg-red-500/10", text: "text-red-700 dark:text-red-400", icon: <AlertCircle className="w-5 h-5" /> },
  paused: { bg: "bg-gray-500/10", text: "text-gray-700 dark:text-gray-400", icon: <Pause className="w-5 h-5" /> },
  cancelled: { bg: "bg-gray-500/10", text: "text-gray-700 dark:text-gray-400", icon: <X className="w-5 h-5" /> },
};

const LoadingPlaceholder = () => (
  <div className="flex items-center justify-center py-12">
    <Clock className="w-6 h-6 animate-spin text-muted-foreground" />
    <span className="ml-2 text-muted-foreground">加载中...</span>
  </div>
);

const TabContent = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingPlaceholder />}>{children}</Suspense>
);

export default async function WorkflowRunDetailPage({ params }: PageProps) {
  const { runId } = await params;
  const world = getWorld();

  const run = await world.runs.get(runId);

  if (!run) {
    notFound();
  }

  // 获取该工作流的日志
  const callLogsResult = await getCallLogs({
    workflowRunId: runId,
    limit: 20,
  });
  const callLogs = callLogsResult.data;

  // 获取流数据
  const streams: Array<{ name: string; content: string }> = [];
  try {
    const streamNames = await world.listStreamsByRunId(runId);

    for (const streamName of streamNames) {
      try {
        const readable = await world.readFromStream(streamName);
        if (readable) {
          const chunks: Uint8Array[] = [];
          const reader = readable.getReader();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(value);
            }
          } finally {
            reader.releaseLock();
          }

          const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
          const content = buffer.toString("utf-8");
          streams.push({ name: streamName, content });
        }
      } catch (err) {
        console.error(`Failed to read stream ${streamName}:`, err);
      }
    }
  } catch (err) {
    console.error("Failed to list streams:", err);
  }

  const formatDuration = (startedAt: Date | undefined, completedAt: Date | undefined) => {
    if (!startedAt || !completedAt) return "-";
    const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    return `${duration}ms`;
  };

  const showControls = run.status === "running" || run.status === "paused";

  const color = statusColors[run.status];
  const label = statusLabels[run.status];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          href="/workflows"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回工作流列表
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">工作流运行详情</h1>
          <p className="text-muted-foreground">运行 ID: {run.runId}</p>
        </div>
      </div>

      {/* 基本信息面板 */}
      <section className="space-y-6">
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-4">运行信息</h2>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${color.bg} ${color.text}`}
              >
                {color.icon}
                {label}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">运行 ID</p>
                <p className="font-mono text-sm break-all">{run.runId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">工作流名称</p>
                <p className="text-sm break-all">{run.workflowName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">创建时间</p>
                <p className="text-sm">{formatDateToLocaleString(run.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">开始时间</p>
                <p className="text-sm">{formatDateToLocaleString(run.startedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">完成时间</p>
                <p className="text-sm">{formatDateToLocaleString(run.completedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">执行耗时</p>
                <p className="text-sm">{formatDuration(run.startedAt, run.completedAt)}</p>
              </div>
            </div>

            {/* 控制面板 */}
            {showControls && (
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-3">工作流控制</h3>
                <WorkflowControls runId={run.runId} status={run.status} />
              </div>
            )}

            {/* 输入参数 */}
            <DetailsCard label="输入参数" variant="default">
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground uppercase tracking-wider font-mono font-semibold text-xs">
                  参数内容
                </p>
                <CopyButton text={formatJson(run.input)} />
              </div>
              <CodeBlock content={formatJson(run.input)} />
            </DetailsCard>

            {/* 输出结果 */}
            {run.status === "completed" && run.output && (
              <DetailsCard label="输出结果" variant="default">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground uppercase tracking-wider font-mono font-semibold text-xs">
                    结果内容
                  </p>
                  <CopyButton text={formatJson(run.output)} />
                </div>
                <CodeBlock content={formatJson(run.output)} />
              </DetailsCard>
            )}

            {/* 错误信息 */}
            {run.status === "failed" && run.error && (
              <DetailsCard label="错误信息" variant="destructive" className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-mono">错误信息</p>
                  <p className="text-sm text-destructive break-all">{run.error.message}</p>
                </div>
                {run.error.code && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-mono">错误代码</p>
                    <p className="text-sm font-mono break-all">{run.error.code}</p>
                  </div>
                )}
                {run.error.stack && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">堆栈跟踪</p>
                      <CopyButton text={run.error.stack} />
                    </div>
                    <CodeBlock content={run.error.stack} maxHeight="max-h-64" />
                  </div>
                )}
              </DetailsCard>
            )}
          </div>
        </div>
      </section>
      <Tabs
        defaultTab="model-logs"
        tabs={[
          {
            id: "model-logs",
            label: "模型调用日志",
            content: (
              <TabContent>
                <ModelCallLogs callLogs={callLogs} showSection={false} />
              </TabContent>
            ),
          },
          {
            id: "steps",
            label: "执行步骤",
            content: (
              <TabContent>
                <StepsTimeline runId={run.runId} />
              </TabContent>
            ),
          },
          {
            id: "streams",
            label: "流输出数据",
            content: (
              <TabContent>
                {streams.length > 0 ? (
                  <StreamViewer streamData={streams} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">暂无流数据</div>
                )}
              </TabContent>
            ),
          },
        ]}
      />
    </div>
  );
}
