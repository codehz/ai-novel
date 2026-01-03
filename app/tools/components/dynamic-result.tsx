/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { OutputSchema } from "@/src/lib/tool-types";
import { AutoTransition } from "@codehz/auto-transition";
import * as Icons from "lucide-react";
import { Check, Copy, Heart } from "lucide-react";
import { useState } from "react";

interface DynamicResultProps {
  schema: OutputSchema;
  results: any[];
  isLoading: boolean;
}

export function DynamicResult(props: DynamicResultProps) {
  return (
    <AutoTransition as="div" className="relative">
      <DynamicResultInner {...props} />
    </AutoTransition>
  );
}
function DynamicResultInner({ schema, results, isLoading }: DynamicResultProps) {
  if (isLoading) {
    return (
      <div key="loading" className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 rounded-2xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  if (schema.type === "card-list") {
    return (
      <AutoTransition as="div" key="card-list" className="grid gap-6 md:grid-cols-2">
        {results.map((result, index) => (
          <ResultCard key={result.id || index} result={result} schema={schema} />
        ))}
      </AutoTransition>
    );
  }

  return (
    <div key="json" className="p-4 rounded-xl border border-border bg-card">
      <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}

function ResultCard({ result, schema }: { result: any; schema: OutputSchema }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const title = schema.titleField ? result[schema.titleField] : "Result";
  const description = schema.descriptionField ? result[schema.descriptionField] : JSON.stringify(result);
  const category = schema.categoryField ? result[schema.categoryField] : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${title}\n${description}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  let categoryEl = null;
  if (category) {
    const config = schema.categories?.[category] || {
      label: category,
      icon: "Tag",
      color: "text-muted-foreground bg-muted",
    };
    const Icon = (Icons as any)[config.icon || "Tag"] || Icons.Tag;
    categoryEl = (
      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col p-6 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        {categoryEl || <div />}
        <div className="flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            {isCopied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
