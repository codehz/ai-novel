"use client";

import { InputHTMLAttributes } from "react";

export function NumberInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const baseStyles =
    "w-full outline-none transition-all px-4 py-2 rounded-lg border border-input-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-primary";

  const combinedClassName = `${baseStyles} ${className}`;

  return <input type="number" {...props} className={combinedClassName} />;
}
