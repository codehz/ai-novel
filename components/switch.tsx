"use client";

import { useEventHandler } from "@/hooks/useEventHandler";
import { clsx } from "clsx";
import type { ChangeEvent } from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Switch({ checked, onChange, disabled, label }: SwitchProps) {
  const handleChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  });

  return (
    <label className={clsx("flex items-center gap-3", disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}>
      <div className="relative inline-flex items-center">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={handleChange} disabled={disabled} />
        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </div>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
    </label>
  );
}
