"use client";

import { FormField } from "@/app/components/form-field";
import { HueColorPicker } from "@/app/components/hue-color-picker";
import { IconPicker } from "@/app/components/icon-picker";
import { SelectInput } from "@/app/components/select-input";
import { TextInput } from "@/app/components/text-input";
import { CategoryConfig, OutputRenderType, OutputSchema } from "@/src/lib/tool-types";
import { Plus } from "lucide-react";
import { ReorderControls } from "./reorder-controls";

interface OutputSchemaEditorProps {
  value: OutputSchema;
  onChange: (value: OutputSchema) => void;
}

export function OutputSchemaEditor({ value, onChange }: OutputSchemaEditorProps) {
  const updateSchema = (updates: Partial<OutputSchema>) => {
    onChange({ ...value, ...updates });
  };

  const addCategory = () => {
    const categories = { ...(value.categories || {}) };
    const id = `cat_${Object.keys(categories).length + 1}`;
    categories[id] = { label: "新分类", icon: "Tag", hue: 210 }; // Default to PRIMARY blue
    updateSchema({ categories });
  };

  const updateCategory = (id: string, updates: Partial<CategoryConfig>) => {
    const categories = { ...(value.categories || {}) };
    categories[id] = { ...categories[id], ...updates };
    updateSchema({ categories });
  };

  const removeCategory = (id: string) => {
    const categories = { ...(value.categories || {}) };
    delete categories[id];
    updateSchema({ categories });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">输出渲染配置</div>
      </div>

      <FormField label="渲染方式" required>
        <SelectInput
          value={value.type}
          onChange={(e) => updateSchema({ type: e.target.value as OutputRenderType })}
          options={[
            { label: "纯文本 (text)", value: "text" },
            { label: "Markdown (markdown)", value: "markdown" },
            { label: "卡片列表 (card-list)", value: "card-list" },
            { label: "原始 JSON (json)", value: "json" },
          ]}
        />
      </FormField>

      {value.type === "card-list" && (
        <div className="space-y-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4">
            <FormField label="标题字段">
              <TextInput
                value={value.titleField || ""}
                onChange={(e) => updateSchema({ titleField: e.target.value })}
                placeholder="输入字段名"
              />
            </FormField>
            <FormField label="描述字段">
              <TextInput
                value={value.descriptionField || ""}
                onChange={(e) => updateSchema({ descriptionField: e.target.value })}
                placeholder="输入字段名"
              />
            </FormField>
            <FormField label="分类字段">
              <TextInput
                value={value.categoryField || ""}
                onChange={(e) => updateSchema({ categoryField: e.target.value })}
                placeholder="输入字段名"
              />
            </FormField>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">分类样式配置</div>
              <button
                type="button"
                onClick={addCategory}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                添加分类
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(value.categories || {}).map(([id, cat]) => (
                <div key={id} className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">分类 ID</label>
                        <TextInput value={id} readOnly className="p-1.5 text-xs bg-muted/50 font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">显示名称</label>
                        <TextInput
                          value={cat.label}
                          onChange={(e) => updateCategory(id, { label: e.target.value })}
                          className="p-1.5 text-xs"
                        />
                      </div>
                    </div>
                    <ReorderControls onDelete={() => removeCategory(id)} className="mt-4" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">图标</label>
                      <IconPicker value={cat.icon || "Tag"} onChange={(icon) => updateCategory(id, { icon })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                        颜色 (HSL Hue)
                      </label>
                      <HueColorPicker
                        value={cat.hue}
                        onChange={(hue) => updateCategory(id, { hue })}
                        className="w-full h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
