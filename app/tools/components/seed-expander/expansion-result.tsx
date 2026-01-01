"use client";

import { type ExpansionCategory, type ExpansionResult } from "@/src/actions/seed-expander";
import { Check, Copy, Flag, Heart, LucideIcon, MapPin, Zap } from "lucide-react";
import { useState } from "react";

interface ExpansionResultListProps {
  results: ExpansionResult[];
  isLoading: boolean;
}

export function ExpansionResultList({ results, isLoading }: ExpansionResultListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 rounded-2xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {results.map((result) => (
        <ResultCard key={result.id} result={result} />
      ))}
    </div>
  );
}

function ResultCard({ result }: { result: ExpansionResult }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${result.title}\n${result.description}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const categoryConfig: Record<ExpansionCategory, { label: string; icon: LucideIcon; color: string }> = {
    plot_direction: {
      label: "情节方向",
      icon: MapPin,
      color: "text-blue-500 bg-blue-500/10",
    },
    conflict: {
      label: "冲突点",
      icon: Zap,
      color: "text-amber-500 bg-amber-500/10",
    },
    ending_variant: {
      label: "结局变体",
      icon: Flag,
      color: "text-purple-500 bg-purple-500/10",
    },
  };

  const config = categoryConfig[result.category];
  const Icon = config.icon;

  return (
    <div className="group relative flex flex-col p-6 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </div>
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
        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{result.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{result.description}</p>
      </div>
    </div>
  );
}
