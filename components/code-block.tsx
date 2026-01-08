"use client";

interface CodeBlockProps {
  content: string;
  maxHeight?: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ content, maxHeight = "max-h-48", language, className = "" }: CodeBlockProps) {
  const baseClasses =
    "p-3 bg-muted rounded overflow-auto font-mono text-foreground text-xs whitespace-pre-wrap word-break-break-word";
  const classes = [baseClasses, maxHeight, className].filter(Boolean).join(" ");

  return (
    <pre className={classes} data-language={language}>
      {content}
    </pre>
  );
}
