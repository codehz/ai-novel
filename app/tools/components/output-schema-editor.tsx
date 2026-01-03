"use client";

import { FormField } from "@/app/components/form-field";
import { IconPicker } from "@/app/components/icon-picker";
import { CategoryConfig, OutputField, OutputRenderType, OutputSchema } from "@/src/lib/tool-types";
import { Plus, Settings2 } from "lucide-react";
import { ReorderControls } from "./reorder-controls";

interface OutputSchemaEditorProps {
  value: OutputSchema;
  onChange: (value: OutputSchema) => void;
}

export function OutputSchemaEditor({ value, onChange }: OutputSchemaEditorProps) {
  const updateSchema = (updates: Partial<OutputSchema>) => {
    onChange({ ...value, ...updates });
  };

  const addField = () => {
    const newFields = [...(value.fields || []), { name: "", label: "", type: "string" as const }];
    updateSchema({ fields: newFields });
  };

  const updateField = (index: number, fieldUpdates: Partial<OutputField>) => {
    const newFields = [...(value.fields || [])];
    newFields[index] = { ...newFields[index], ...fieldUpdates };
    updateSchema({ fields: newFields });
  };

  const removeField = (index: number) => {
    const newFields = (value.fields || []).filter((_, i) => i !== index);
    updateSchema({ fields: newFields });
  };

  const addCategory = () => {
    const categories = { ...(value.categories || {}) };
    const id = `cat_${Object.keys(categories).length + 1}`;
    categories[id] = { label: "新分类", icon: "Tag", color: "text-primary bg-primary/10" };
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
        <select
          value={value.type}
          onChange={(e) => updateSchema({ type: e.target.value as OutputRenderType })}
          className="w-full p-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="text">纯文本 (text)</option>
          <option value="markdown">Markdown (markdown)</option>
          <option value="card-list">卡片列表 (card-list)</option>
          <option value="json">原始 JSON (json)</option>
        </select>
      </FormField>

      {value.type === "card-list" && (
        <div className="space-y-6 pt-4 border-t border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                结构化字段定义
              </div>
              <button
                type="button"
                onClick={addField}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                添加字段
              </button>
            </div>

            <div className="space-y-2">
              {(value.fields || []).map((field, index) => (
                <div key={index} className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/5">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, { name: e.target.value })}
                    placeholder="字段名"
                    className="w-32 p-1.5 text-xs rounded border border-input bg-background font-mono"
                  />
                  <input
                    type="text"
                    value={field.label || ""}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="显示标签"
                    className="flex-1 p-1.5 text-xs rounded border border-input bg-background"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value as OutputField["type"] })}
                    className="w-24 p-1.5 text-xs rounded border border-input bg-background"
                  >
                    <option value="string">字符串</option>
                    <option value="number">数字</option>
                    <option value="boolean">布尔值</option>
                    <option value="json">JSON</option>
                  </select>
                  <ReorderControls onDelete={() => removeField(index)} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="标题字段">
              <select
                value={value.titleField || ""}
                onChange={(e) => updateSchema({ titleField: e.target.value })}
                className="w-full p-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">请选择...</option>
                {(value.fields || []).map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.label || f.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="描述字段">
              <select
                value={value.descriptionField || ""}
                onChange={(e) => updateSchema({ descriptionField: e.target.value })}
                className="w-full p-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">请选择...</option>
                {(value.fields || []).map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.label || f.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="分类字段">
              <select
                value={value.categoryField || ""}
                onChange={(e) => updateSchema({ categoryField: e.target.value })}
                className="w-full p-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">请选择...</option>
                {(value.fields || []).map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.label || f.name}
                  </option>
                ))}
              </select>
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
                        <input
                          type="text"
                          value={id}
                          readOnly
                          className="w-full p-1.5 text-xs rounded border border-input bg-muted/50 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">显示名称</label>
                        <input
                          type="text"
                          value={cat.label}
                          onChange={(e) => updateCategory(id, { label: e.target.value })}
                          className="w-full p-1.5 text-xs rounded border border-input bg-background"
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
                        颜色样式 (Tailwind)
                      </label>
                      <input
                        type="text"
                        value={cat.color || ""}
                        onChange={(e) => updateCategory(id, { color: e.target.value })}
                        placeholder="text-blue-500 bg-blue-500/10"
                        className="w-full p-1.5 text-xs rounded border border-input bg-background font-mono"
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
