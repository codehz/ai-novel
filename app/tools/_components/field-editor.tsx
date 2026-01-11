"use client";

import { FormField } from "@/components/form-field";
import { NumberInput } from "@/components/number-input";
import { SelectInput } from "@/components/select-input";
import { Switch } from "@/components/switch";
import { TextAreaInput } from "@/components/text-area-input";
import { TextInput } from "@/components/text-input";
import { useEventHandler } from "@/hooks/useEventHandler";
import { InputField, InputType } from "@/shared/tool-types";
import type { ChangeEvent } from "react";
import { OptionsListEditor } from "./options-list-editor";
import { ReorderControls } from "./reorder-controls";

interface FieldEditorProps {
  index: number;
  field: InputField;
  onChange: (index: number, field: InputField) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function FieldEditor({
  index,
  field,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: FieldEditorProps) {
  const handleNameChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...field, name: e.target.value });
  });

  const handleLabelChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...field, label: e.target.value });
  });

  const handleTypeChange = useEventHandler((e: { target: { value: string } }) => {
    onChange(index, { ...field, type: e.target.value as InputType });
  });

  const handlePlaceholderChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...field, placeholder: e.target.value });
  });

  const handleDescriptionChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...field, description: e.target.value });
  });

  const handleDefaultNumberChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...field, defaultValue: e.target.value ? parseFloat(e.target.value) : undefined });
  });

  const handleDefaultSelectChange = useEventHandler((e: { target: { value: string } }) => {
    onChange(index, { ...field, defaultValue: e.target.value });
  });

  const handleDefaultTextAreaChange = useEventHandler((e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(index, { ...field, defaultValue: e.target.value });
  });

  const handleDefaultTextChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...field, defaultValue: e.target.value });
  });

  const handleRequiredChange = useEventHandler((checked: boolean) => {
    onChange(index, { ...field, required: checked });
  });

  const handleMinLengthChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...field, minLength: e.target.value ? parseInt(e.target.value) : undefined });
  });

  const handleMaxLengthChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...field, maxLength: e.target.value ? parseInt(e.target.value) : undefined });
  });

  const handleOptionsChange = useEventHandler((options: typeof field.options) => {
    onChange(index, { ...field, options });
  });

  return (
    <div className="p-3 sm:p-4 rounded-xl border border-border bg-muted/10 space-y-4 relative group">
      <div className="flex items-start justify-between gap-4">
        <div className="grid sm:grid-cols-2 gap-4 flex-1">
          <FormField label="字段 ID (name)" required>
            <TextInput value={field.name} onChange={handleNameChange} placeholder="例如: topic" className="font-mono" />
          </FormField>
          <FormField label="显示名称 (label)" required>
            <TextInput value={field.label} onChange={handleLabelChange} placeholder="例如: 创意种子" />
          </FormField>
        </div>
        <ReorderControls
          onMoveUp={() => onMoveUp(index)}
          onMoveDown={() => onMoveDown(index)}
          onDelete={() => onDelete(index)}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          className="mt-7"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="类型" required>
          <SelectInput
            value={field.type}
            onChange={handleTypeChange}
            options={[
              { label: "单行文本 (text)", value: "text" },
              { label: "多行文本 (textarea)", value: "textarea" },
              { label: "数字 (number)", value: "number" },
              { label: "下拉选择 (select)", value: "select" },
            ]}
          />
        </FormField>
        <FormField label="占位符">
          <TextInput value={field.placeholder || ""} onChange={handlePlaceholderChange} placeholder="输入提示文字..." />
        </FormField>
      </div>

      <FormField label="描述说明" description="该描述将显示在生成表单的字段下方，用于指导用户填写">
        <TextInput
          value={field.description || ""}
          onChange={handleDescriptionChange}
          placeholder="对该字段的详细解释"
        />
      </FormField>

      <FormField label="默认值">
        {field.type === "number" ? (
          <NumberInput
            value={field.defaultValue ?? ""}
            onChange={handleDefaultNumberChange}
            placeholder="该字段的初始数字"
          />
        ) : field.type === "select" ? (
          <SelectInput
            value={field.defaultValue || ""}
            onChange={handleDefaultSelectChange}
            options={[{ label: "无默认值", value: "" }, ...(field.options || [])]}
          />
        ) : field.type === "textarea" ? (
          <TextAreaInput
            value={field.defaultValue || ""}
            onChange={handleDefaultTextAreaChange}
            placeholder="该字段的初始文本"
            className="min-h-20"
          />
        ) : (
          <TextInput value={field.defaultValue || ""} onChange={handleDefaultTextChange} placeholder="该字段的初始值" />
        )}
      </FormField>

      <div className="flex items-center flex-wrap gap-8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">必填</span>
          <Switch checked={!!field.required} onChange={handleRequiredChange} />
        </div>

        {(field.type === "text" || field.type === "textarea") && (
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">最小长度</span>
              <NumberInput value={field.minLength ?? ""} onChange={handleMinLengthChange} className="w-20 p-1" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">最大长度</span>
              <NumberInput value={field.maxLength ?? ""} onChange={handleMaxLengthChange} className="w-20 p-1" />
            </div>
          </div>
        )}
      </div>

      {field.type === "select" && (
        <div className="pt-2 border-t border-border/50">
          <div className="text-sm font-medium mb-2">选项配置</div>
          <OptionsListEditor options={field.options || []} onChange={handleOptionsChange} />
        </div>
      )}
    </div>
  );
}
