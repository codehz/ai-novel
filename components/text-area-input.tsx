"use client";

import { TextareaHTMLAttributes } from "react";

interface TextAreaInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "primary";
}

export function TextAreaInput({ variant = "default", className = "", ...props }: TextAreaInputProps) {
  const baseStyles = "w-full outline-none transition-all resize-none";

  const variants = {
    default: "p-2 text-sm rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20",
    primary:
      "px-4 py-2 rounded-lg border border-input-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-primary",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  return <textarea {...props} className={combinedClassName} />;
}
