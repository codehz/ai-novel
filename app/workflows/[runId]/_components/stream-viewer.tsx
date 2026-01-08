"use client";

import { Download } from "lucide-react";
import { useState } from "react";

interface StreamViewerProps {
  streamData: Array<{
    name: string;
    content: string;
  }>;
}

function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function formatContent(content: string): { isJson: boolean; formatted: string } {
  if (isValidJSON(content)) {
    try {
      const parsed = JSON.parse(content);
      return {
        isJson: true,
        formatted: JSON.stringify(parsed, null, 2),
      };
    } catch {
      return { isJson: false, formatted: content };
    }
  }
  return { isJson: false, formatted: content };
}

export function StreamViewer({ streamData }: StreamViewerProps) {
  const [expandedStreams, setExpandedStreams] = useState<Set<string>>(new Set());

  const toggleStream = (name: string) => {
    const newExpanded = new Set(expandedStreams);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedStreams(newExpanded);
  };

  const downloadStream = (name: string, content: string, isJson: boolean) => {
    const { formatted } = formatContent(content);
    const filename = `${name}.${isJson ? "json" : "txt"}`;
    const blob = new Blob([formatted], { type: isJson ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (streamData.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card text-center">
        <p className="text-muted-foreground">暂无流数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {streamData.map(({ name, content }) => {
        const { isJson, formatted } = formatContent(content);
        const isExpanded = expandedStreams.has(name);

        return (
          <div key={name} className="rounded-lg border border-border bg-card overflow-hidden">
            <button
              onClick={() => toggleStream(name)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors text-left font-medium"
            >
              <span className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">{name}</span>
                {isJson && (
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400">
                    JSON
                  </span>
                )}
              </span>
              <span className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
            </button>

            {isExpanded && (
              <div className="border-t border-border">
                <div className="flex justify-end gap-2 px-4 py-2 bg-muted/50 border-b border-border">
                  <button
                    onClick={() => downloadStream(name, content, isJson)}
                    className="flex items-center gap-1 px-3 py-1 rounded text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 dark:bg-slate-900 text-slate-50 overflow-x-auto text-xs font-mono max-h-96">
                  {formatted}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
