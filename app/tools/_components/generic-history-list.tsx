"use client";

import { Button } from "@/components/button";
import { useConfirm } from "@/hooks/useConfirm";
import { useEventHandler } from "@/hooks/useEventHandler";
import { ToolHistoryItem } from "@/shared/tool-types";
import { AutoTransition, withAutoTransition } from "@codehz/auto-transition";
import { History } from "lucide-react";
import { HistoryItem } from "./history-item";

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
  const confirm = useConfirm();
  const handleClearClick = useEventHandler(async () => {
    if (await confirm("确定要清空所有历史记录吗？")) {
      onClear();
    }
  });

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
          onClick={handleClearClick}
          className="h-7 text-xs text-muted-foreground hover:text-destructive"
        >
          清空
        </Button>
      </div>

      <AutoTransition
        as="div"
        className="grid gap-2 max-h-150 overflow-y-auto overflow-x-hidden -m-1 p-1 pr-2 custom-scrollbar"
      >
        {history.map((item) => (
          <HistoryItem
            key={item.id}
            item={item}
            currentId={currentId}
            titleField={titleField}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </AutoTransition>
    </div>
  );
}
