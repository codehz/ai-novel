"use client";

import { IconButton } from "@/components/icon-button";
import { formatDateToShortLocaleString } from "@/components/lib/format";
import { useEventHandler } from "@/hooks/useEventHandler";
import { ToolHistoryItem } from "@/shared/tool-types";
import { clsx } from "clsx";
import { ChevronRight, Clock, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";

interface HistoryItemProps {
  item: ToolHistoryItem;
  currentId?: number;
  titleField?: string;
  onSelect: (item: ToolHistoryItem) => void;
  onDelete: (id: number) => void;
}

export function HistoryItem({ item, currentId, titleField, onSelect, onDelete }: HistoryItemProps) {
  // Try to find a meaningful title from inputs
  const title =
    titleField && item.inputs[titleField] !== undefined && item.inputs[titleField] !== null
      ? String(item.inputs[titleField])
      : Object.values(item.inputs).find((v) => typeof v === "string" && v.length > 0) || "Untitled Execution";
  const isText = typeof item.outputs === "string";
  const resultCount = Array.isArray(item.outputs) ? item.outputs.length : 1;

  const handleClick = useEventHandler(() => {
    onSelect(item);
  });

  const handleDeleteClick = useEventHandler((e: MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  });

  return (
    <div
      className={clsx(
        "group relative flex flex-col gap-2 p-3 rounded-xl border transition-all cursor-pointer min-w-0",
        currentId === item.id
          ? "bg-primary/5 border-primary/30 ring-1 ring-primary/30"
          : "bg-card border-border hover:border-primary/20 hover:bg-muted/50",
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" title={String(title)}>
            {String(title)}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <IconButton
            onClick={handleDeleteClick}
            color="destructive"
            title="删除"
            className="opacity-0 group-hover:opacity-100 h-auto w-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </IconButton>
          <ChevronRight
            className={clsx(
              "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
              currentId === item.id ? "translate-x-0.5 text-primary" : "group-hover:translate-x-0.5",
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 shrink-0" />
          <span className="truncate">{formatDateToShortLocaleString(item.timestamp)}</span>
        </div>
        {item.providerName && item.modelName && (
          <div className="text-[10px] px-2 py-1 rounded bg-muted text-muted-foreground truncate">
            {item.providerName} - {item.modelName}
          </div>
        )}
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground inline-flex w-fit">
          {isText ? `${item.outputs.length} 字` : `${resultCount} 个结果`}
        </span>
      </div>
    </div>
  );
}
