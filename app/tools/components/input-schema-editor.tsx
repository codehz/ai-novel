"use client";

import { FormField } from "@/app/components/form-field";
import { InputField, InputSchema } from "@/src/lib/tool-types";
import { Plus } from "lucide-react";
import { FieldEditor } from "./field-editor";

interface InputSchemaEditorProps {
  value: InputSchema;
  onChange: (value: InputSchema) => void;
}

export function InputSchemaEditor({ value, onChange }: InputSchemaEditorProps) {
  const addField = () => {
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
  };

  const updateField = (index: number, field: InputField) => {
    const newFields = [...value.fields];
    newFields[index] = field;
    onChange({ ...value, fields: newFields });
  };

  const removeField = (index: number) => {
    const newFields = value.fields.filter((_, i) => i !== index);
    onChange({ ...value, fields: newFields });
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...value.fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    onChange({ ...value, fields: newFields });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">输入字段配置</div>
        <button
          type="button"
          onClick={addField}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          添加字段
        </button>
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
              field={field}
              onChange={(updated) => updateField(index, updated)}
              onDelete={() => removeField(index)}
              onMoveUp={() => moveField(index, "up")}
              onMoveDown={() => moveField(index, "down")}
              canMoveUp={index > 0}
              canMoveDown={index < value.fields.length - 1}
            />
          ))
        )}
      </div>

      <div className="pt-4 border-t border-border">
        <FormField label="提交按钮文字">
          <input
            type="text"
            value={value.submitLabel || ""}
            onChange={(e) => onChange({ ...value, submitLabel: e.target.value })}
            placeholder="例如: 开始生成"
            className="w-full p-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </FormField>
      </div>
    </div>
  );
}
