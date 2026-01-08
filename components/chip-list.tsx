"use client";

import { clsx } from "clsx";
import React from "react";

export type ChipOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  activeBg?: string;
  activeText?: string;
};

export function ChipList({
  options,
  value,
  onChange,
  showAll = false,
  allLabel = "全部",
  className = "",
}: {
  options: ChipOption[];
  value?: string;
  onChange: (v: string) => void;
  showAll?: boolean;
  allLabel?: string;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      {showAll ? (
        <button
          aria-pressed={value === undefined || value === "all"}
          onClick={() => onChange("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            value === undefined || value === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {allLabel}
        </button>
      ) : null}

      {options.map((opt) => {
        const selected = value === opt.value;

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selected
                ? `${opt.activeBg ?? "bg-muted"} ${opt.activeText ?? "text-foreground"} shadow-sm ring-2 ring-offset-2 ring-current`
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {opt.icon ? <span className="w-4 h-4 inline-flex items-center justify-center">{opt.icon}</span> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
