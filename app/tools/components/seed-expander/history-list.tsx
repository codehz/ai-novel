"use client";

import { type HistoryItem } from "@/src/actions/seed-expander";
import { ChevronRight, Clock, History, Trash2 } from "lucide-react";

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  currentId?: string;
}

export function HistoryList({ history, onSelect, onDelete, onClear, currentId }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
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
        <button
          onClick={() => {
            if (confirm("确定要清空所有历史记录吗？")) {
              onClear();
            }
          }}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          清空
        </button>
      </div>

      <div className="grid gap-2 max-h-100 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
        {history.map((item) => (
          <div
            key={item.id}
            className={`group relative flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer min-w-0 ${
              currentId === item.id
                ? "bg-primary/5 border-primary/30 ring-1 ring-primary/30"
                : "bg-card border-border hover:border-primary/20 hover:bg-muted/50"
            }`}
            onClick={() => onSelect(item)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate pr-6" title={item.seed}>
                {item.seed}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-[10px] text-muted-foreground truncate">
                  {new Date(item.timestamp).toLocaleString("zh-CN", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                  {item.results.length} 个结果
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                title="删除"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ChevronRight
                className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${currentId === item.id ? "translate-x-0.5 text-primary" : "group-hover:translate-x-0.5"}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
