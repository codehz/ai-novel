/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/button";
import { FormField } from "@/components/form-field";
import { ModelSelector } from "@/components/model-selector";
import { SelectInput } from "@/components/select-input";
import { TextAreaInput } from "@/components/text-area-input";
import { TextInput } from "@/components/text-input";
import { InputSchema } from "@/src/lib/tool-types";
import { Sparkles } from "lucide-react";

interface DynamicFormProps {
  schema: InputSchema;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  selectedModelId?: number;
  onSelectModel: (modelId: number) => void;
}

export function DynamicForm({
  schema,
  values,
  onChange,
  onSubmit,
  isLoading,
  selectedModelId,
  onSelectModel,
}: DynamicFormProps) {
  const handleFieldChange = (name: string, value: any) => {
    onChange({ ...values, [name]: value });
  };

  const isValid = () => {
    if (!selectedModelId) return false;
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
      <FormField label="选择模型" required>
        <ModelSelector selectedModelId={selectedModelId} onSelectModel={onSelectModel} disabled={isLoading} />
      </FormField>

      <div className="space-y-4">
        {schema.fields.map((field) => (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            description={field.description}
            className="relative"
          >
            {field.type === "textarea" ? (
              <div className="relative">
                <TextAreaInput
                  value={values[field.name] ?? ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={isLoading}
                  className="min-h-30 resize-y"
                  maxLength={field.maxLength}
                />
                {field.maxLength && (
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-1 rounded">
                    {(values[field.name] ?? "").length}/{field.maxLength}
                  </div>
                )}
              </div>
            ) : field.type === "select" ? (
              <SelectInput
                value={values[field.name] ?? ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                disabled={isLoading}
                options={[{ label: "请选择", value: "" }, ...(field.options || [])]}
              />
            ) : (
              <TextInput
                type={field.type}
                value={values[field.name] ?? ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                disabled={isLoading}
                maxLength={field.maxLength}
              />
            )}
          </FormField>
        ))}
      </div>

      <Button onClick={onSubmit} disabled={!isValid()} loading={isLoading} loadingText="正在生成..." className="w-full">
        <Sparkles className="w-4 h-4" />
        {schema.submitLabel || "开始生成"}
      </Button>
    </div>
  );
}
