"use client";

import { useEventHandler } from "@/hooks/useEventHandler";
import { clsx } from "clsx";
import { ReactNode } from "react";

export type ChipOption = {
  value: string;
  label: string;
  icon?: ReactNode;
  activeBg?: string;
  activeText?: string;
};

function Chip({ opt, selected, onChange }: { opt: ChipOption; selected: boolean; onChange: (v: string) => void }) {
  const handleClick = useEventHandler(() => {
    onChange(opt.value);
  });

  return (
    <button
      key={opt.value}
      onClick={handleClick}
      aria-pressed={selected}
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
        selected
          ? clsx(
              opt.activeBg ?? "bg-muted",
              opt.activeText ?? "text-foreground",
              "shadow-sm ring-2 ring-offset-2 ring-current",
            )
          : "bg-muted text-muted-foreground hover:bg-muted/80",
      )}
    >
      {opt.icon ? <span className="w-4 h-4 inline-flex items-center justify-center">{opt.icon}</span> : null}
      {opt.label}
    </button>
  );
}

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
  const handleAllClick = useEventHandler(() => {
    onChange("all");
  });

  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      {showAll ? (
        <button
          aria-pressed={value === undefined || value === "all"}
          onClick={handleAllClick}
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

        return <Chip key={opt.value} opt={opt} selected={selected} onChange={onChange} />;
      })}
    </div>
  );
}
