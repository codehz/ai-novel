"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
  feedbackDuration?: number;
  size?: "sm" | "md";
  className?: string;
}

export function CopyButton({
  text,
  label = "复制",
  feedbackDuration = 2000,
  size = "sm",
  className = "",
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), feedbackDuration);
  };

  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const baseClasses =
    "flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground";
  const classes = [baseClasses, className].filter(Boolean).join(" ");

  return (
    <button onClick={handleCopy} className={classes} title="复制到剪贴板">
      {isCopied ? <Check className={iconSize} /> : <Copy className={iconSize} />}
      {label && <span className="text-xs">{isCopied ? "已复制" : label}</span>}
    </button>
  );
}
