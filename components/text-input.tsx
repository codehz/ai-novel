"use client";

import { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "default";
}

export function TextInput({ variant = "default", className = "", ...props }: TextInputProps) {
  const baseStyles = "w-full outline-none transition-all";

  const variants = {
    default:
      "px-4 py-2 rounded-lg border border-input-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-primary",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  return <input {...props} className={combinedClassName} />;
}
