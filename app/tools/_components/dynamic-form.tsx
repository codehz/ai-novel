/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/button";
import { FormField } from "@/components/form-field";
import { ModelSelector } from "@/components/model-selector";
import { SelectInput } from "@/components/select-input";
import { TextAreaInput } from "@/components/text-area-input";
import { TextInput } from "@/components/text-input";
import { useEventHandler } from "@/hooks/useEventHandler";
import { InputSchema } from "@/shared/tool-types";
import { Sparkles } from "lucide-react";
import type { ChangeEvent } from "react";

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
  const handleFieldChange = useEventHandler((name: string, value: any) => {
    onChange({ ...values, [name]: value });
  });

  const handleSelectModel = useEventHandler((modelId: number) => {
    onSelectModel(modelId);
  });

  const handleSubmitClick = useEventHandler(() => {
    onSubmit();
  });

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
        <ModelSelector selectedModelId={selectedModelId} onSelectModel={handleSelectModel} disabled={isLoading} />
      </FormField>

      <div className="space-y-4">
        {schema.fields.map((field) => (
          <FormFieldWrapper
            key={field.name}
            field={field}
            value={values[field.name]}
            isLoading={isLoading}
            onFieldChange={handleFieldChange}
          />
        ))}
      </div>

      <Button
        onClick={handleSubmitClick}
        disabled={!isValid()}
        loading={isLoading}
        loadingText="正在生成..."
        className="w-full"
      >
        <Sparkles className="w-4 h-4" />
        {schema.submitLabel || "开始生成"}
      </Button>
    </div>
  );
}

interface FormFieldWrapperProps {
  field: InputSchema["fields"][0];
  value: any;
  isLoading: boolean;
  onFieldChange: (name: string, value: any) => void;
}

function FormFieldWrapper({ field, value, isLoading, onFieldChange }: FormFieldWrapperProps) {
  const handleTextAreaChange = useEventHandler((e: ChangeEvent<HTMLTextAreaElement>) => {
    onFieldChange(field.name, e.target.value);
  });

  const handleSelectChange = useEventHandler((e: { target: { value: string } }) => {
    onFieldChange(field.name, e.target.value);
  });

  const handleInputChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onFieldChange(field.name, e.target.value);
  });

  return (
    <FormField label={field.label} required={field.required} description={field.description} className="relative">
      {field.type === "textarea" ? (
        <div className="relative">
          <TextAreaInput
            value={value ?? ""}
            onChange={handleTextAreaChange}
            placeholder={field.placeholder}
            disabled={isLoading}
            className="min-h-30 resize-y"
            maxLength={field.maxLength}
          />
          {field.maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-1 rounded">
              {(value ?? "").length}/{field.maxLength}
            </div>
          )}
        </div>
      ) : field.type === "select" ? (
        <SelectInput
          value={value ?? ""}
          onChange={handleSelectChange}
          disabled={isLoading}
          options={[{ label: "请选择", value: "" }, ...(field.options || [])]}
        />
      ) : (
        <TextInput
          type={field.type}
          value={value ?? ""}
          onChange={handleInputChange}
          placeholder={field.placeholder}
          disabled={isLoading}
          maxLength={field.maxLength}
        />
      )}
    </FormField>
  );
}
