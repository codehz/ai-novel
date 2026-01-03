"use client";

import { SelectHTMLAttributes } from "react";

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "primary";
  options?: { label: string; value: string | number }[];
}

export function SelectInput({
  variant = "default",
  className = "",
  options = [],
  children,
  ...props
}: SelectInputProps) {
  const baseStyles =
    "w-full outline-none transition-all appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em]";

  // Note: Standard select doesn't easily support custom icons without more complex CSS or a wrapper.
  // For now, we'll keep it simple and match the existing style which didn't have a custom arrow.

  const variants = {
    default: "p-2 text-sm rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20",
    primary:
      "px-4 py-2 rounded-lg border border-input-border bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-primary",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  return (
    <select {...props} className={combinedClassName}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
      {children}
    </select>
  );
}
