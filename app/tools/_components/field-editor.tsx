"use client";

import { FormField } from "@/components/form-field";
import { NumberInput } from "@/components/number-input";
import { SelectInput } from "@/components/select-input";
import { Switch } from "@/components/switch";
import { TextAreaInput } from "@/components/text-area-input";
import { TextInput } from "@/components/text-input";
import { InputField, InputType } from "@/src/lib/tool-types";
import { OptionsListEditor } from "./options-list-editor";
import { ReorderControls } from "./reorder-controls";

interface FieldEditorProps {
  field: InputField;
  onChange: (field: InputField) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function FieldEditor({
  field,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: FieldEditorProps) {
  const updateField = (updates: Partial<InputField>) => {
    onChange({ ...field, ...updates });
  };

  return (
    <div className="p-3 sm:p-4 rounded-xl border border-border bg-muted/10 space-y-4 relative group">
      <div className="flex items-start justify-between gap-4">
        <div className="grid sm:grid-cols-2 gap-4 flex-1">
          <FormField label="字段 ID (name)" required>
            <TextInput
              value={field.name}
              onChange={(e) => updateField({ name: e.target.value })}
              placeholder="例如: topic"
              className="font-mono"
            />
          </FormField>
          <FormField label="显示名称 (label)" required>
            <TextInput
              value={field.label}
              onChange={(e) => updateField({ label: e.target.value })}
              placeholder="例如: 创意种子"
            />
          </FormField>
        </div>
        <ReorderControls
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          className="mt-7"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="类型" required>
          <SelectInput
            value={field.type}
            onChange={(e) => updateField({ type: e.target.value as InputType })}
            options={[
              { label: "单行文本 (text)", value: "text" },
              { label: "多行文本 (textarea)", value: "textarea" },
              { label: "数字 (number)", value: "number" },
              { label: "下拉选择 (select)", value: "select" },
            ]}
          />
        </FormField>
        <FormField label="占位符">
          <TextInput
            value={field.placeholder || ""}
            onChange={(e) => updateField({ placeholder: e.target.value })}
            placeholder="输入提示文字..."
          />
        </FormField>
      </div>

      <FormField label="描述说明" description="该描述将显示在生成表单的字段下方，用于指导用户填写">
        <TextInput
          value={field.description || ""}
          onChange={(e) => updateField({ description: e.target.value })}
          placeholder="对该字段的详细解释"
        />
      </FormField>

      <FormField label="默认值">
        {field.type === "number" ? (
          <NumberInput
            value={field.defaultValue ?? ""}
            onChange={(e) => updateField({ defaultValue: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="该字段的初始数字"
          />
        ) : field.type === "select" ? (
          <SelectInput
            value={field.defaultValue || ""}
            onChange={(e) => updateField({ defaultValue: e.target.value })}
            options={[{ label: "无默认值", value: "" }, ...(field.options || [])]}
          />
        ) : field.type === "textarea" ? (
          <TextAreaInput
            value={field.defaultValue || ""}
            onChange={(e) => updateField({ defaultValue: e.target.value })}
            placeholder="该字段的初始文本"
            className="min-h-20"
          />
        ) : (
          <TextInput
            value={field.defaultValue || ""}
            onChange={(e) => updateField({ defaultValue: e.target.value })}
            placeholder="该字段的初始值"
          />
        )}
      </FormField>

      <div className="flex items-center flex-wrap gap-8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">必填</span>
          <Switch checked={!!field.required} onChange={(checked) => updateField({ required: checked })} />
        </div>

        {(field.type === "text" || field.type === "textarea") && (
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">最小长度</span>
              <NumberInput
                value={field.minLength ?? ""}
                onChange={(e) => updateField({ minLength: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-20 p-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">最大长度</span>
              <NumberInput
                value={field.maxLength ?? ""}
                onChange={(e) => updateField({ maxLength: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-20 p-1"
              />
            </div>
          </div>
        )}
      </div>

      {field.type === "select" && (
        <div className="pt-2 border-t border-border/50">
          <div className="text-sm font-medium mb-2">选项配置</div>
          <OptionsListEditor options={field.options || []} onChange={(options) => updateField({ options })} />
        </div>
      )}
    </div>
  );
}
