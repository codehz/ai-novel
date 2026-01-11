import { formatDateToLocaleString } from "@/components/lib/format";
import { getWorld } from "@workflow/core/runtime";
import { Step } from "@workflow/world";
import { clsx } from "clsx";
import { AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { StepDetail } from "./step-detail";

interface StepsTimelineProps {
  runId: string;
}

const statusLabels: Record<string, string> = {
  pending: "等待中",
  running: "运行中",
  completed: "已完成",
  failed: "失败",
  cancelled: "已取消",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Circle className="w-5 h-5" />,
  running: <Loader2 className="w-5 h-5 animate-spin" />,
  completed: <CheckCircle2 className="w-5 h-5 text-success" />,
  failed: <AlertCircle className="w-5 h-5 text-destructive" />,
  cancelled: <Circle className="w-5 h-5 text-muted-foreground" />,
};

const statusColors: Record<string, string> = {
  pending: "border-amber-500",
  running: "border-blue-500",
  completed: "border-success",
  failed: "border-destructive",
  cancelled: "border-muted-foreground",
};

const formatDuration = (startedAt: Date | undefined, completedAt: Date | undefined) => {
  if (!startedAt || !completedAt) return "-";
  const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  return `${duration}ms`;
};

function StepItem({
  step,
  isLast,
  icon,
  label,
  borderColor,
}: {
  step: Step;
  isLast: boolean;
  icon: React.ReactNode;
  label: string;
  borderColor: string;
}) {
  return (
    <div className="flex gap-4 mb-4">
      <div className="flex flex-col items-center">
        <div className={clsx("p-1.5 rounded-full border-2 bg-card", borderColor)}>{icon}</div>
        {!isLast && <div className="w-0.5 flex-1 bg-border" />}
      </div>

      <div className="flex-1">
        <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{step.stepName}</h3>
                <p className="text-xs text-muted-foreground mt-1">步骤 ID: {step.stepId}</p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">开始时间</p>
                <p className="font-mono">{formatDateToLocaleString(step.startedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">完成时间</p>
                <p className="font-mono">{formatDateToLocaleString(step.completedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">执行耗时</p>
                <p className="font-mono">{formatDuration(step.startedAt, step.completedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">重试次数</p>
                <p className="font-mono">{step.attempt}</p>
              </div>
            </div>

            <StepDetail step={step} />
          </div>
        </div>
      </div>
    </div>
  );
}

export async function StepsTimeline({ runId }: StepsTimelineProps) {
  const world = getWorld();
  const stepsResponse = await world.steps.list({ runId });
  const steps = stepsResponse.data || [];

  if (steps.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">暂无执行步骤</p>
      </div>
    );
  }

  return (
    <div>
      {steps.map((step: Step, index: number) => (
        <StepItem
          key={step.stepId}
          step={step}
          isLast={index === steps.length - 1}
          icon={statusIcons[step.status] || statusIcons.pending}
          label={statusLabels[step.status] || step.status}
          borderColor={statusColors[step.status] || statusColors.pending}
        />
      ))}
    </div>
  );
}
