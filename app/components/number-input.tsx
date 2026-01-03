"use client";

import { InputHTMLAttributes } from "react";

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  variant?: "default" | "primary";
}

export function NumberInput({ variant = "default", className = "", ...props }: NumberInputProps) {
  const baseStyles = "w-full outline-none transition-all";

  const variants = {
    default: "p-2 text-sm rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20",
    primary:
      "px-4 py-2 rounded-lg border border-input-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-primary",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  return <input type="number" {...props} className={combinedClassName} />;
}
