"use client";

import { useEventHandler } from "@/hooks/useEventHandler";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useRef, type ButtonHTMLAttributes, type ChangeEvent, type ReactNode } from "react";
import { Dropdown } from "./dropdown";

export interface SelectOption {
  label: string;
  value: string | number;
}

function OptionItem({
  opt,
  value,
  onSelect,
  close,
}: {
  opt: SelectOption;
  value?: string | number;
  onSelect: (v: string | number) => void;
  close: () => void;
}) {
  const handleClick = useEventHandler(() => {
    onSelect(opt.value);
    close();
  });

  return (
    <button
      type="button"
      className={clsx(
        "w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
        opt.value === value ? "bg-accent/50 font-medium" : "",
      )}
      onClick={handleClick}
    >
      {opt.label}
    </button>
  );
}

interface SelectInputProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "onChange"> {
  options?: SelectOption[];
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  name?: string;
}

export function SelectInput({
  className = "",
  options = [],
  children,
  value,
  onChange,
  placeholder = "请选择...",
  disabled,
  name,
  ...rest
}: SelectInputProps): ReactNode {
  const selectRef = useRef<HTMLSelectElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);
  const label = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = useEventHandler((v: string | number) => {
    if (selectRef.current && onChange) {
      // Use native property setter to bypass React's value tracking
      const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")?.set;
      nativeValueSetter?.call(selectRef.current, String(v));

      const event = new Event("change", { bubbles: true });
      selectRef.current.dispatchEvent(event);
    }
  });

  const baseStyles =
    "px-4 py-2 rounded-lg border border-input-border bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-primary transition-all";

  const combinedClassName = clsx(
    "flex items-center justify-between w-full outline-none text-left",
    baseStyles,
    className,
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
  );

  return (
    <div className="relative w-full">
      {/* Hidden select for accessibility and form integration */}
      <select
        ref={selectRef}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <Dropdown
        className="min-w-(--anchor-width)"
        content={({ close }) => (
          <div className="py-1">
            {options.map((opt) => (
              <OptionItem key={opt.value} opt={opt} value={value} onSelect={handleSelect} close={close} />
            ))}
            {children}
          </div>
        )}
      >
        <button
          type="button"
          {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
          className={combinedClassName}
          disabled={disabled}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </Dropdown>
    </div>
  );
}
