import { DetailsCard } from "@/components/details-card";
import { formatDateToLocaleString } from "@/src/lib/format";
import { getWorld } from "@workflow/core/runtime";
import { Event } from "@workflow/world";
import { clsx } from "clsx";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ runId: string }>;
}

const eventTypeLabels: Record<string, string> = {
  step_started: "步骤开始",
  step_completed: "步骤完成",
  step_failed: "步骤失败",
  step_retrying: "步骤重试",
  hook_created: "钩子创建",
  hook_received: "钩子接收",
  hook_disposed: "钩子处理",
  wait_created: "等待创建",
  wait_completed: "等待完成",
  workflow_started: "工作流开始",
  workflow_completed: "工作流完成",
  workflow_failed: "工作流失败",
};

const eventTypeColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  step_started: {
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    icon: <Zap className="w-4 h-4" />,
  },
  step_completed: {
    bg: "bg-green-500/10",
    text: "text-green-700 dark:text-green-400",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  step_failed: {
    bg: "bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  step_retrying: {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    icon: <Clock className="w-4 h-4" />,
  },
  hook_created: {
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-400",
    icon: <Zap className="w-4 h-4" />,
  },
  hook_received: {
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-400",
    icon: <Zap className="w-4 h-4" />,
  },
  hook_disposed: {
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-400",
    icon: <Zap className="w-4 h-4" />,
  },
  wait_created: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-700 dark:text-cyan-400",
    icon: <Clock className="w-4 h-4" />,
  },
  wait_completed: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-700 dark:text-cyan-400",
    icon: <Clock className="w-4 h-4" />,
  },
  workflow_started: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-700 dark:text-indigo-400",
    icon: <Zap className="w-4 h-4" />,
  },
  workflow_completed: {
    bg: "bg-green-500/10",
    text: "text-green-700 dark:text-green-400",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  workflow_failed: {
    bg: "bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    icon: <AlertCircle className="w-4 h-4" />,
  },
};

export default async function EventsPage({ params }: PageProps) {
  const { runId } = await params;
  const world = getWorld();

  // 验证运行存在
  const run = await world.runs.get(runId);
  if (!run) {
    notFound();
  }

  // 获取该运行的所有事件
  let events: Event[] = [];
  try {
    const eventsResponse = await world.events.list({ runId });
    events = eventsResponse.data || [];
  } catch (err) {
    console.error(`Failed to fetch events for run ${runId}:`, err);
  }

  // 按时间戳倒序排序（最新的事件在上）
  const sortedEvents = events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          href={`/workflows/${runId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回工作流详情
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">工作流事件</h1>
          <p className="text-muted-foreground">运行 ID: {run.runId}</p>
        </div>
      </div>

      {/* 事件时间线 */}
      <section className="space-y-6">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">尚无事件</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event, index) => (
              <WorkflowEventItem key={`${event.eventId}-${index}`} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* 总结统计 */}
      {sortedEvents.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">事件统计</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(
              sortedEvents.reduce(
                (acc, event) => {
                  acc[event.eventType] = (acc[event.eventType] || 0) + 1;
                  return acc;
                },
                {} as Record<string, number>,
              ),
            ).map(([eventType, count]) => (
              <div key={eventType} className="p-4 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">
                  {eventTypeLabels[eventType] || eventType}
                </p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))}
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">总事件数</p>
              <p className="text-2xl font-bold">{sortedEvents.length}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

interface WorkflowEventItemProps {
  event: Event;
}

function WorkflowEventItem({ event }: WorkflowEventItemProps) {
  const color = eventTypeColors[event.eventType] || {
    bg: "bg-gray-500/10",
    text: "text-gray-700 dark:text-gray-400",
    icon: <Clock className="w-4 h-4" />,
  };
  const label = eventTypeLabels[event.eventType] || event.eventType;

  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/50">
      <div className="space-y-4">
        {/* 事件头部 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                color.bg,
                color.text,
              )}
            >
              {color.icon}
              {label}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">事件 ID</p>
              <p className="font-mono text-sm text-muted-foreground">{event.eventId.substring(0, 12)}...</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">时间</p>
            <p className="font-mono text-sm">{formatDateToLocaleString(event.createdAt)}</p>
          </div>
        </div>

        {/* 关联 ID */}
        {event.correlationId && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mb-1">关联 ID（步骤）</p>
            <p className="font-mono text-sm text-muted-foreground">{event.correlationId.substring(0, 16)}...</p>
          </div>
        )}

        {/* 事件 Payload */}
        {"eventData" in event && event.eventData && (
          <DetailsCard label="事件数据" variant="default">
            <div className="mt-3">
              <pre className="p-4 bg-muted rounded-lg overflow-auto text-xs font-mono text-foreground max-h-96">
                {JSON.stringify(event.eventData, null, 2)}
              </pre>
            </div>
          </DetailsCard>
        )}
      </div>
    </div>
  );
}
