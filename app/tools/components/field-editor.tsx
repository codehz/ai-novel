"use client";

import { FormField } from "@/app/components/form-field";
import { Switch } from "@/app/components/switch";
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
    <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-4 relative group">
      <div className="flex items-start justify-between gap-4">
        <div className="grid grid-cols-2 gap-4 flex-1">
          <FormField label="字段 ID (name)" required>
            <input
              type="text"
              value={field.name}
              onChange={(e) => updateField({ name: e.target.value })}
              placeholder="例如: topic"
              className="w-full p-2 text-sm rounded-lg border border-input bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </FormField>
          <FormField label="显示名称 (label)" required>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField({ label: e.target.value })}
              placeholder="例如: 创意种子"
              className="w-full p-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
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

      <div className="grid grid-cols-2 gap-4">
        <FormField label="类型" required>
          <select
            value={field.type}
            onChange={(e) => updateField({ type: e.target.value as InputType })}
            className="w-full p-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="text">单行文本 (text)</option>
            <option value="textarea">多行文本 (textarea)</option>
            <option value="number">数字 (number)</option>
            <option value="select">下拉选择 (select)</option>
          </select>
        </FormField>
        <FormField label="占位符">
          <input
            type="text"
            value={field.placeholder || ""}
            onChange={(e) => updateField({ placeholder: e.target.value })}
            placeholder="输入提示文字..."
            className="w-full p-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </FormField>
      </div>

      <FormField label="描述说明">
        <input
          type="text"
          value={field.description || ""}
          onChange={(e) => updateField({ description: e.target.value })}
          placeholder="对该字段的详细解释"
          className="w-full p-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </FormField>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">必填</span>
          <Switch checked={!!field.required} onChange={(checked) => updateField({ required: checked })} />
        </div>

        {(field.type === "text" || field.type === "textarea") && (
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">最小长度</span>
              <input
                type="number"
                value={field.minLength ?? ""}
                onChange={(e) => updateField({ minLength: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-20 p-1 text-sm rounded border border-input bg-background"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">最大长度</span>
              <input
                type="number"
                value={field.maxLength ?? ""}
                onChange={(e) => updateField({ maxLength: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-20 p-1 text-sm rounded border border-input bg-background"
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
