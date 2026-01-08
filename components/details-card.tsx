"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

interface DetailsCardProps {
  label: string;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "minimal" | "card";
  open?: boolean;
  onToggle?: (open: boolean) => void;
  isControlled?: boolean;
  className?: string;
}

export function DetailsCard({
  label,
  children,
  variant = "default",
  open: externalOpen = false,
  onToggle,
  isControlled = false,
  className,
}: DetailsCardProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // 对于受控组件，同步外部状态到原生 details 元素
  useEffect(() => {
    if (isControlled && detailsRef.current) {
      if (detailsRef.current.open !== externalOpen) {
        detailsRef.current.open = externalOpen;
      }
    }
  }, [externalOpen, isControlled]);

  // 处理原生 details 的 toggle 事件
  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    const target = event.target as HTMLDetailsElement;
    const isOpen = target.open;
    onToggle?.(isOpen);
  };

  // 根据 variant 生成样式类名
  const getDetailsClasses = () => {
    switch (variant) {
      case "destructive":
        return "border-t border-border";
      case "minimal":
        return "mt-2";
      case "card":
        return "rounded-lg border border-border bg-card overflow-hidden";
      case "default":
      default:
        return "border-t border-border";
    }
  };

  const getSummaryClasses = () => {
    const baseClasses = "cursor-pointer transition-colors";

    switch (variant) {
      case "destructive":
        return clsx(baseClasses, "font-semibold text-destructive hover:text-destructive/80 pt-6");
      case "minimal":
        return clsx(baseClasses, "hover:text-foreground");
      case "card":
        return clsx(baseClasses, "font-semibold hover:text-primary px-4 py-3");
      case "default":
      default:
        return clsx(baseClasses, "font-semibold hover:text-primary pt-6");
    }
  };

  return (
    <details
      ref={detailsRef}
      className={clsx("group", getDetailsClasses())}
      open={isControlled ? externalOpen : undefined}
      onToggle={handleToggle}
    >
      <summary className={clsx("flex items-center justify-between text-sm", getSummaryClasses())}>
        <span>{label}</span>
        <div className="flex items-center">
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </div>
      </summary>
      <div className={clsx("pt-3", className)}>{children}</div>
    </details>
  );
}
