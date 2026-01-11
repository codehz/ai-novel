"use client";

import { Button } from "@/components/button";
import { DetailsCard } from "@/components/details-card";
import { useEventHandler } from "@/hooks/useEventHandler";
import { downloadContent, formatJsonContent } from "@/src/lib/format";
import { Download } from "lucide-react";
import { useMemo } from "react";

interface StreamViewerProps {
  streamData: Array<{
    name: string;
    content: string;
  }>;
}

interface StreamItemProps {
  name: string;
  content: string;
  isJson: boolean;
  formatted: string;
  open: boolean;
}

function StreamItem({ name, content, isJson, formatted, open }: StreamItemProps) {
  const handleDownload = useEventHandler(() => {
    downloadContent(content, name, { type: isJson ? "json" : "text" });
  });

  return (
    <DetailsCard name="stream" label={`${name}${isJson ? " (JSON)" : ""}`} open={open} variant="card">
      <div className="flex justify-end gap-2 mb-3 mr-3 -mt-3">
        <Button variant="primary" size="sm" onClick={handleDownload} className="flex items-center gap-1">
          <Download className="w-4 h-4" />
          下载
        </Button>
      </div>
      <pre className="p-4 bg-slate-950 dark:bg-slate-900 text-slate-50 overflow-x-auto text-xs font-mono max-h-96">
        {formatted}
      </pre>
    </DetailsCard>
  );
}

export function StreamViewer({ streamData }: StreamViewerProps) {
  const formattedData = useMemo(() => {
    return streamData.map(({ name, content }) => {
      const { isJson, formatted } = formatJsonContent(content);
      return { name, content, isJson, formatted };
    });
  }, [streamData]);

  if (streamData.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card text-center">
        <p className="text-muted-foreground">暂无流数据</p>
      </div>
    );
  }

  return (
    <form className="space-y-4">
      {formattedData.map((item, index) => (
        <StreamItem
          key={item.name}
          name={item.name}
          content={item.content}
          isJson={item.isJson}
          formatted={item.formatted}
          open={index === 0}
        />
      ))}
    </form>
  );
}
