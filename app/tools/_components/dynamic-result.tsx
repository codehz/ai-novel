/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CopyButton } from "@/components/copy-button";
import { Icon } from "@/components/icon";
import { type OutputSchema } from "@/shared/tool-types";
import { getCategoryStyle } from "@/src/constants/colors";
import { AutoTransition, withAutoTransition } from "@codehz/auto-transition";
import * as Icons from "lucide-react";
import { type ReactNode } from "react";

interface DynamicResultProps {
  schema: OutputSchema;
  results: any[] | string;
  isLoading: boolean;
}

export const DynamicResult = withAutoTransition(DynamicResultInner, {
  as: "div",
  className: "relative",
});
function DynamicResultInner({ schema, results, isLoading }: DynamicResultProps): ReactNode {
  if (schema.type === "card-list") {
    return <CardListResult schema={schema} results={results} isLoading={isLoading} />;
  }

  return <TextResult results={results} isLoading={isLoading} />;
}

interface TextResultProps {
  results: any;
  isLoading: boolean;
}

function TextResult({ results, isLoading }: TextResultProps): ReactNode {
  const text = Array.isArray(results) ? results.join("") : String(results || "");

  if (isLoading && !text) {
    return (
      <div key="loading-text" className="p-6 rounded-2xl border border-border bg-card animate-pulse space-y-4">
        <div className="h-4 w-24 bg-muted rounded-full" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-5/6 bg-muted rounded" />
          <div className="h-3 w-4/6 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!text) return null;

  return (
    <div className="space-y-4">
      <div
        key="text"
        className="group relative p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <Icons.FileText className="w-3 h-3" />
            文本结果
          </div>
          <CopyButton text={text} label="" size="md" />
        </div>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-mono">
          {text}
          {isLoading && (
            <span className="inline-flex ml-1 w-1.5 h-4 bg-primary animate-[pulse_1s_infinite] align-middle" />
          )}
        </pre>
      </div>
    </div>
  );
}

interface CardListResultProps {
  schema: OutputSchema;
  results: any;
  isLoading: boolean;
}

function CardListResult({ schema, results, isLoading }: CardListResultProps): ReactNode {
  const resultsArray = Array.isArray(results) ? results : [];

  if (isLoading && resultsArray.length === 0) {
    return (
      <div key="loading" className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 rounded-2xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (resultsArray.length === 0) return null;

  return (
    <div className="space-y-6">
      <AutoTransition as="div" key="card-list" className="grid gap-6 md:grid-cols-2">
        {resultsArray.map((result, index) => (
          <ResultCard key={result.id || index} result={result} schema={schema} />
        ))}
        {isLoading && <div className="h-48 rounded-2xl border border-border bg-card animate-pulse" />}
      </AutoTransition>
    </div>
  );
}

interface ResultCardProps {
  result: any;
  schema: OutputSchema;
}

function ResultCard({ result, schema }: ResultCardProps): ReactNode {
  const title = result.title || "Result";
  const description = result.description || (typeof result === "string" ? result : JSON.stringify(result));
  const categoryId = result.category;

  const category = categoryId
    ? schema.categories?.find((c) => c.id === categoryId) || {
        id: categoryId,
        label: categoryId,
        icon: "Tag",
        hue: 210,
      }
    : null;

  return (
    <div className="group relative flex flex-col p-6 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        {category ? (
          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium"
            style={getCategoryStyle(category.hue ?? 210)}
          >
            <Icon iconName={category.icon ?? "Tag"} defaultIcon={Icons.Tag} className="w-3 h-3" />
            {category.label}
          </div>
        ) : (
          <div />
        )}
        <AutoTransition as="div" className="flex gap-2">
          <CopyButton text={`${title}\n${description}`} label="" size="md" />
        </AutoTransition>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
