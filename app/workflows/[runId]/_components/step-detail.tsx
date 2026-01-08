"use client";

import { Step } from "@workflow/world";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useState } from "react";

interface StepDetailProps {
  step: Step;
}

export function StepDetail({ step }: StepDetailProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatJson = (data: unknown) => {
    return JSON.stringify(data, null, 2);
  };

  const hasDetails = step.input || step.output || step.error;

  if (!hasDetails) {
    return null;
  }

  return (
    <details
      className="border-t border-border pt-3 cursor-pointer"
      open={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <summary className="flex items-center justify-between text-sm font-medium hover:text-primary transition-colors">
        <span>详细信息</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </summary>

      <div className="mt-3 space-y-3 text-xs">
        {/* 输入参数 */}
        {step.input && step.input.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground uppercase tracking-wider font-mono font-semibold">输入参数</p>
              <button
                onClick={() => copyToClipboard(formatJson(step.input), "input")}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="复制到剪贴板"
              >
                <Copy className="w-3 h-3" />
                {copied === "input" ? "已复制" : "复制"}
              </button>
            </div>
            <pre className="p-3 bg-muted rounded overflow-auto max-h-48 font-mono text-foreground text-xs whitespace-pre-wrap word-break-break-word">
              {formatJson(step.input)}
            </pre>
          </div>
        )}

        {/* 输出结果 */}
        {step.output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground uppercase tracking-wider font-mono font-semibold">输出结果</p>
              <button
                onClick={() => copyToClipboard(formatJson(step.output), "output")}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="复制到剪贴板"
              >
                <Copy className="w-3 h-3" />
                {copied === "output" ? "已复制" : "复制"}
              </button>
            </div>
            <pre className="p-3 bg-muted rounded overflow-auto max-h-48 font-mono text-foreground text-xs whitespace-pre-wrap word-break-break-word">
              {formatJson(step.output)}
            </pre>
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
                    <button
                      onClick={() => copyToClipboard(step.error!.stack || "", "stack")}
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="复制到剪贴板"
                    >
                      <Copy className="w-3 h-3" />
                      {copied === "stack" ? "已复制" : "复制"}
                    </button>
                  </div>
                  <pre className="p-3 bg-muted rounded overflow-auto max-h-48 font-mono text-foreground text-xs whitespace-pre-wrap word-break-break-word">
                    {step.error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
