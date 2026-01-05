import { Edit2, Power, Trash2 } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface ItemCardProps {
  title: ReactNode;
  subtitle?: string;
  isEnabled?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteConfirmMessage?: string;
  children?: ReactNode;
  href?: string;
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
  href,
}: ItemCardProps) {
  const content = (
    <>
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="font-bold text-foreground truncate">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono truncate" title={subtitle}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="flex gap-1 ml-2 shrink-0"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
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
    </>
  );

  const className = `p-4 min-w-0 rounded-xl border bg-card border-border shadow-sm transition-all ${
    !isEnabled ? "opacity-60 grayscale-[0.5]" : ""
  } ${href ? "hover:border-primary/50 cursor-pointer block" : ""}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
