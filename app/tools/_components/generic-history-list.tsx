"use client";

import { Button } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import { formatDateToShortLocaleString } from "@/src/lib/format";
import { ToolHistoryItem } from "@/src/lib/tool-types";
import { AutoTransition, withAutoTransition } from "@codehz/auto-transition";
import { clsx } from "clsx";
import { ChevronRight, Clock, History, Trash2 } from "lucide-react";

interface GenericHistoryListProps {
  history: ToolHistoryItem[];
  onSelect: (item: ToolHistoryItem) => void;
  onDelete: (id: number) => void;
  onClear: () => void;
  currentId?: number;
  titleField?: string;
}

export const GenericHistoryList = withAutoTransition(GenericHistoryListInner, { as: "div", className: "relative" });

function GenericHistoryListInner({
  history,
  onSelect,
  onDelete,
  onClear,
  currentId,
  titleField,
}: GenericHistoryListProps) {
  if (history.length === 0) {
    return (
      <div
        key="no-history"
        className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl"
      >
        <History className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm">暂无历史记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <History className="w-4 h-4" />
          历史记录
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm("确定要清空所有历史记录吗？")) {
              onClear();
            }
          }}
          className="h-7 text-xs text-muted-foreground hover:text-destructive"
        >
          清空
        </Button>
      </div>

      <AutoTransition
        as="div"
        className="grid gap-2 max-h-150 overflow-y-auto overflow-x-hidden -m-1 p-1 pr-2 custom-scrollbar"
      >
        {history.map((item) => {
          // Try to find a meaningful title from inputs
          const title =
            titleField && item.inputs[titleField] !== undefined && item.inputs[titleField] !== null
              ? String(item.inputs[titleField])
              : Object.values(item.inputs).find((v) => typeof v === "string" && v.length > 0) || "Untitled Execution";
          const isText = typeof item.outputs === "string";
          const resultCount = Array.isArray(item.outputs) ? item.outputs.length : 1;

          return (
            <div
              key={item.id}
              className={clsx(
                "group relative flex flex-col gap-2 p-3 rounded-xl border transition-all cursor-pointer min-w-0",
                currentId === item.id
                  ? "bg-primary/5 border-primary/30 ring-1 ring-primary/30"
                  : "bg-card border-border hover:border-primary/20 hover:bg-muted/50",
              )}
              onClick={() => onSelect(item)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={String(title)}>
                    {String(title)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
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
        })}
      </AutoTransition>
    </div>
  );
}
