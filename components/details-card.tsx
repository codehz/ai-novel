import clsx from "clsx";
import { ChevronDown } from "lucide-react";

interface DetailsCardProps {
  label: string;
  name?: string;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "minimal" | "card";
  open?: boolean;
  className?: string;
}

export function DetailsCard({ label, name, children, variant = "default", open = false, className }: DetailsCardProps) {
  const detailsClasses = variant === "minimal" ? "mt-2" : "border-t border-border";
  const isCard = variant === "card";

  const summaryClasses = clsx(
    "flex items-center justify-between text-sm cursor-pointer transition-colors",
    variant === "minimal" ? "hover:text-foreground" : "font-semibold hover:text-primary",
    isCard ? "px-4 py-3" : "pt-6",
  );

  return (
    <details
      className={clsx("group", isCard && "rounded-lg border border-border bg-card overflow-hidden", detailsClasses)}
      name={name}
      open={open}
    >
      <summary className={summaryClasses}>
        <span>{label}</span>
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className={clsx("pt-3", className)}>{children}</div>
    </details>
  );
}
