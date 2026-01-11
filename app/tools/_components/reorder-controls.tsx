import { IconButton } from "@/components/icon-button";
import clsx from "clsx";
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
    <div className={clsx("flex items-center gap-1", className)}>
      {onMoveUp && (
        <IconButton onClick={onMoveUp} disabled={!canMoveUp} color="default" title="上移" className="p-1 h-auto w-auto">
          <ChevronUp className="w-4 h-4" />
        </IconButton>
      )}
      {onMoveDown && (
        <IconButton
          onClick={onMoveDown}
          disabled={!canMoveDown}
          color="default"
          title="下移"
          className="p-1 h-auto w-auto"
        >
          <ChevronDown className="w-4 h-4" />
        </IconButton>
      )}
      {onDelete && (
        <IconButton onClick={onDelete} color="destructive" title="删除" className="p-1 h-auto w-auto ml-1">
          <Trash2 className="w-4 h-4" />
        </IconButton>
      )}
    </div>
  );
}
