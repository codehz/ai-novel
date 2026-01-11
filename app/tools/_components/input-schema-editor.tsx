"use client";

import { Button } from "@/components/button";
import { FormField } from "@/components/form-field";
import { SelectInput } from "@/components/select-input";
import { TextInput } from "@/components/text-input";
import { useEventHandler } from "@/hooks/useEventHandler";
import { InputField, InputSchema } from "@/shared/tool-types";
import { Plus } from "lucide-react";
import type { ChangeEvent } from "react";
import { FieldEditor } from "./field-editor";

interface InputSchemaEditorProps {
  value: InputSchema;
  onChange: (value: InputSchema) => void;
}

export function InputSchemaEditor({ value, onChange }: InputSchemaEditorProps) {
  const addField = useEventHandler(() => {
    const newFields = [
      ...value.fields,
      {
        name: `field_${value.fields.length + 1}`,
        label: "新字段",
        type: "text" as const,
        required: false,
      },
    ];
    onChange({ ...value, fields: newFields });
  });

  const updateField = useEventHandler((index: number, field: InputField) => {
    const newFields = [...value.fields];
    newFields[index] = field;
    onChange({ ...value, fields: newFields });
  });

  const removeField = useEventHandler((index: number) => {
    const newFields = value.fields.filter((_, i) => i !== index);
    onChange({ ...value, fields: newFields });
  });

  const moveField = useEventHandler((index: number, direction: "up" | "down") => {
    const newFields = [...value.fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    onChange({ ...value, fields: newFields });
  });

  const moveUp = useEventHandler((index: number) => moveField(index, "up"));
  const moveDown = useEventHandler((index: number) => moveField(index, "down"));

  const handleTitleFieldChange = useEventHandler((e: { target: { value: string } }) => {
    onChange({ ...value, titleField: e.target.value });
  });

  const handleSubmitLabelChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, submitLabel: e.target.value });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">输入字段配置</div>
        <Button type="button" onClick={addField} variant="ghost" size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          添加字段
        </Button>
      </div>

      <div className="space-y-4">
        {value.fields.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm">
            暂无输入字段，点击上方按钮添加
          </div>
        ) : (
          value.fields.map((field, index) => (
            <FieldEditor
              key={index}
              index={index}
              field={field}
              onChange={updateField}
              onDelete={removeField}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
              canMoveUp={index > 0}
              canMoveDown={index < value.fields.length - 1}
            />
          ))
        )}
      </div>

      <div className="pt-4 border-t border-border space-y-4">
        <FormField label="标题字段" description="选择一个字段作为历史记录的标题">
          <SelectInput
            value={value.titleField || ""}
            onChange={handleTitleFieldChange}
            options={[
              { label: "自动选择", value: "" },
              ...value.fields.map((f) => ({ label: f.label || f.name, value: f.name })),
            ]}
          />
        </FormField>

        <FormField label="提交按钮文字" description="自定义表单提交按钮显示的文字">
          <TextInput value={value.submitLabel || ""} onChange={handleSubmitLabelChange} placeholder="例如: 开始生成" />
        </FormField>
      </div>
    </div>
  );
}
