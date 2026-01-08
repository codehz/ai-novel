"use client";

import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DetailsCardProps {
  label: string;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "minimal";
  icon?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  isControlled?: boolean;
  className?: string;
}

export function DetailsCard({
  label,
  children,
  variant = "default",
  icon = false,
  open: externalOpen = false,
  onToggle,
  isControlled = false,
  className,
}: DetailsCardProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [currentOpen, setCurrentOpen] = useState(externalOpen);

  // 对于受控组件，同步外部状态到原生 details 元素
  useEffect(() => {
    if (isControlled && detailsRef.current) {
      if (detailsRef.current.open !== externalOpen) {
        detailsRef.current.open = externalOpen;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentOpen(externalOpen);
      }
    }
  }, [externalOpen, isControlled]);

  // 处理原生 details 的 toggle 事件
  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    const target = event.target as HTMLDetailsElement;
    const isOpen = target.open;
    setCurrentOpen(isOpen);
    onToggle?.(isOpen);
  };

  // 根据 variant 生成样式类名
  const getDetailsClasses = () => {
    switch (variant) {
      case "destructive":
        return "border-t border-border pt-6";
      case "minimal":
        return "mt-2";
      case "default":
      default:
        return "border-t border-border pt-6";
    }
  };

  const getSummaryClasses = () => {
    const baseClasses = "cursor-pointer transition-colors";

    switch (variant) {
      case "destructive":
        return clsx(baseClasses, "font-semibold text-destructive hover:text-destructive/80");
      case "minimal":
        return clsx(baseClasses, "hover:text-foreground");
      case "default":
      default:
        return clsx(baseClasses, "font-semibold hover:text-primary");
    }
  };

  return (
    <details
      ref={detailsRef}
      className={getDetailsClasses()}
      open={isControlled ? externalOpen : undefined}
      onToggle={handleToggle}
    >
      <summary className={clsx("flex items-center justify-between text-sm", getSummaryClasses())}>
        <span>{label}</span>
        {icon && (
          <div className="flex items-center">
            {currentOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        )}
      </summary>
      <div className={clsx("pt-3", className)}>{children}</div>
    </details>
  );
}
