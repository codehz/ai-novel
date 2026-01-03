/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormField } from "@/app/components/form-field";
import { ModelSelector } from "@/app/components/model-selector";
import { InputSchema } from "@/src/lib/tool-types";
import { Loader2, Sparkles } from "lucide-react";

interface DynamicFormProps {
  schema: InputSchema;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  selectedProviderId?: number;
  selectedModelId?: number;
  onSelectModel: (providerId: number, modelId: number) => void;
}

export function DynamicForm({
  schema,
  values,
  onChange,
  onSubmit,
  isLoading,
  selectedProviderId,
  selectedModelId,
  onSelectModel,
}: DynamicFormProps) {
  const handleFieldChange = (name: string, value: any) => {
    onChange({ ...values, [name]: value });
  };

  const isValid = () => {
    if (!selectedProviderId || !selectedModelId) return false;
    for (const field of schema.fields) {
      const value = values[field.name];
      if (field.required && (value === undefined || value === null || value === "")) return false;
      if (field.type === "textarea" || field.type === "text") {
        if (typeof value === "string") {
          if (field.minLength && value.length < field.minLength) return false;
          if (field.maxLength && value.length > field.maxLength) return false;
        }
      }
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-border bg-card/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">选择模型</h3>
          <ModelSelector
            selectedProviderId={selectedProviderId}
            selectedModelId={selectedModelId}
            onSelectModel={onSelectModel}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-4">
        {schema.fields.map((field) => (
          <FormField key={field.name} label={field.label} required={field.required} className="relative">
            {field.type === "textarea" ? (
              <div className="relative">
                <textarea
                  value={values[field.name] || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={isLoading}
                  className="w-full min-h-[120px] p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y transition-all"
                  maxLength={field.maxLength}
                />
                {field.maxLength && (
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-1 rounded">
                    {(values[field.name] || "").length}/{field.maxLength}
                  </div>
                )}
              </div>
            ) : field.type === "select" ? (
              <select
                value={values[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                disabled={isLoading}
                className="w-full p-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="" disabled>
                  请选择
                </option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={values[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                disabled={isLoading}
                className="w-full p-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                maxLength={field.maxLength}
              />
            )}
            {field.description && <p className="text-xs text-muted-foreground mt-1">{field.description}</p>}
          </FormField>
        ))}
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading || !isValid()}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            正在生成...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {schema.submitLabel || "开始生成"}
          </>
        )}
      </button>
    </div>
  );
}
