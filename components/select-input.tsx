"use client";

import { ChevronDown } from "lucide-react";
import { ButtonHTMLAttributes, SelectHTMLAttributes } from "react";
import { Dropdown } from "./dropdown";

interface SelectInputProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options?: { label: string; value: string | number }[];
  onChange?: (e: { target: { value: string } }) => void;
  placeholder?: string;
}

export function SelectInput({
  className = "",
  options = [],
  children,
  value,
  onChange,
  placeholder = "请选择...",
  disabled,
  ...props
}: SelectInputProps) {
  const selectedOption = options.find((opt) => opt.value === value);
  const label = selectedOption ? selectedOption.label : placeholder;

  const baseStyles =
    "px-4 py-2 rounded-lg border border-input-border bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-primary";

  const combinedClassName = `flex items-center justify-between w-full outline-none transition-all text-left ${baseStyles} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`;

  return (
    <Dropdown
      className="min-w-(--anchor-width)"
      content={({ close }) => (
        <div className="py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                opt.value === value ? "bg-accent/50 font-medium" : ""
              }`}
              onClick={() => {
                if (onChange) {
                  onChange({ target: { value: String(opt.value) } });
                }
                close();
              }}
            >
              {opt.label}
            </button>
          ))}
          {children}
        </div>
      )}
    >
      <button
        type="button"
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
        className={combinedClassName}
        disabled={disabled}
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>
    </Dropdown>
  );
}
