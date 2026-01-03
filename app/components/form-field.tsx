"use client";

import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export function FormField({ label, children, required, className = "" }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
