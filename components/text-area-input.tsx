import { TextareaHTMLAttributes } from "react";

export function TextAreaInput({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const baseStyles =
    "w-full outline-none transition-all resize-none px-4 py-2 rounded-lg border border-input-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-primary";

  const combinedClassName = `${baseStyles} ${className}`;

  return <textarea {...props} className={combinedClassName} />;
}
