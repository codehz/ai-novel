"use client";

import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { DetailsCard } from "@/components/details-card";
import { formatJson } from "@/components/lib/format";
import { Step } from "@workflow/world";

interface StepDetailProps {
  step: Step;
}

export function StepDetail({ step }: StepDetailProps) {
  const hasDetails = step.input || step.output || step.error;

  if (!hasDetails) {
    return null;
  }

  return (
    <DetailsCard label="详细信息" variant="default" className="space-y-3 text-xs">
      {/* 输入参数 */}
      {step.input && step.input.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground uppercase tracking-wider font-mono font-semibold">输入参数</p>
            <CopyButton text={formatJson(step.input)} />
          </div>
          <CodeBlock content={formatJson(step.input)} />
        </div>
      )}

      {/* 输出结果 */}
      {step.output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground uppercase tracking-wider font-mono font-semibold">输出结果</p>
            <CopyButton text={formatJson(step.output)} />
          </div>
          <CodeBlock content={formatJson(step.output)} />
        </div>
      )}

      {/* 错误信息 */}
      {step.error && (
        <div>
          <p className="text-destructive uppercase tracking-wider font-mono font-semibold mb-2">错误信息</p>
          <div className="space-y-2">
            <div>
              <p className="text-muted-foreground mb-1">消息：</p>
              <p className="text-destructive font-mono">{step.error.message}</p>
            </div>
            {step.error.code && (
              <div>
                <p className="text-muted-foreground mb-1">代码：</p>
                <p className="font-mono">{step.error.code}</p>
              </div>
            )}
            {step.error.stack && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground">堆栈跟踪：</p>
                  <CopyButton text={step.error.stack} />
                </div>
                <CodeBlock content={step.error.stack} />
              </div>
            )}
          </div>
        </div>
      )}
    </DetailsCard>
  );
}
