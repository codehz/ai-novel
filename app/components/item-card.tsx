import { Edit2, Power, Trash2 } from "lucide-react";
import { ReactNode } from "react";

interface ItemCardProps {
  title: string;
  subtitle?: string;
  isEnabled?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteConfirmMessage?: string;
  children?: ReactNode;
}

export function ItemCard({
  title,
  subtitle,
  isEnabled = true,
  onToggle,
  onEdit,
  onDelete,
  deleteConfirmMessage = "确定要删除吗？",
  children,
}: ItemCardProps) {
  return (
    <div
      className={`p-4 min-w-0 rounded-xl border bg-card border-border shadow-sm transition-all ${
        !isEnabled ? "opacity-60 grayscale-[0.5]" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-foreground truncate" title={title}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono truncate" title={subtitle}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex gap-1 ml-2 shrink-0">
          {onToggle && (
            <button
              onClick={onToggle}
              className={`p-1.5 rounded-lg transition-colors ${
                isEnabled ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted"
              }`}
              title={isEnabled ? "禁用" : "启用"}
            >
              <Power size={14} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="编辑"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm(deleteConfirmMessage)) {
                  onDelete();
                }
              }}
              className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="删除"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {children && <div className="text-xs space-y-1 text-muted-foreground">{children}</div>}
    </div>
  );
}
