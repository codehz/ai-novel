"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

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
  const buttonSize = size === "sm" ? "sm" : "md";

  return (
    <Button variant="ghost" size={buttonSize} onClick={handleCopy} className={className} title="复制到剪贴板">
      {isCopied ? <Check className={iconSize} /> : <Copy className={iconSize} />}
      {label && <span className="ml-1">{isCopied ? "已复制" : label}</span>}
    </Button>
  );
}
