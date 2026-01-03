"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface ReorderControlsProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  className?: string;
}

export function ReorderControls({
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp = true,
  canMoveDown = true,
  className = "",
}: ReorderControlsProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {onMoveUp && (
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
          title="上移"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
      {onMoveDown && (
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
          title="下移"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors ml-1"
          title="删除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
