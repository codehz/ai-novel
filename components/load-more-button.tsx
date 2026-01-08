"use client";

import { withAutoTransition } from "@codehz/auto-transition";

interface LoadMoreButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  text?: string;
  className?: string;
  hasMore?: boolean;
}

export const LoadMoreButton = withAutoTransition(LoadMoreButtonInner, { as: "div", className: "relative" });

function LoadMoreButtonInner({
  onClick,
  disabled = false,
  isLoading = false,
  loadingText = "加载中...",
  text = "加载更多",
  className = "",
  hasMore,
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return null;
  }
  return (
    <div key={isLoading ? "loading" : "loaded"} className="flex justify-center mt-6">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`px-6 py-2.5 border border-border bg-card text-foreground rounded-lg font-medium hover:bg-muted hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`.trim()}
      >
        {isLoading ? loadingText : text}
      </button>
    </div>
  );
}
