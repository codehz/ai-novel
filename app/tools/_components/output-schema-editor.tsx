"use client";

import { Button } from "@/components/button";
import { FormField } from "@/components/form-field";
import { HueColorPicker } from "@/components/hue-color-picker";
import { IconPicker } from "@/components/icon-picker";
import { SelectInput } from "@/components/select-input";
import { TextInput } from "@/components/text-input";
import { useEventHandler } from "@/hooks/useEventHandler";
import { CategoryConfig, OutputRenderType, OutputSchema } from "@/shared/tool-types";
import { Plus } from "lucide-react";
import type { ChangeEvent } from "react";
import { ReorderControls } from "./reorder-controls";

interface OutputSchemaEditorProps {
  value: OutputSchema;
  onChange: (value: OutputSchema) => void;
}

export function OutputSchemaEditor({ value, onChange }: OutputSchemaEditorProps) {
  const updateSchema = useEventHandler((updates: Partial<OutputSchema>) => {
    onChange({ ...value, ...updates });
  });

  const addCategory = useEventHandler(() => {
    const categories = [...(value.categories || [])];
    const id = `cat_${categories.length + 1}`;
    categories.push({ id, label: "新分类", icon: "Tag", hue: 210 }); // Default to PRIMARY blue
    updateSchema({ categories });
  });

  const updateCategory = useEventHandler((index: number, updates: Partial<CategoryConfig>) => {
    const categories = [...(value.categories || [])];
    categories[index] = { ...categories[index], ...updates };
    updateSchema({ categories });
  });

  const removeCategory = useEventHandler((index: number) => {
    const categories = (value.categories || []).filter((_, i) => i !== index);
    updateSchema({ categories });
  });

  const moveCategory = useEventHandler((index: number, direction: "up" | "down") => {
    const categories = [...(value.categories || [])];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;
    [categories[index], categories[newIndex]] = [categories[newIndex], categories[index]];
    updateSchema({ categories });
  });

  const handleMoveUp = useEventHandler((index: number) => {
    moveCategory(index, "up");
  });

  const handleMoveDown = useEventHandler((index: number) => {
    moveCategory(index, "down");
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">输出渲染配置</div>
      </div>

      <FormField label="渲染方式" required description="选择生成结果的展示形式">
        <SelectInput
          value={value.type}
          onChange={useEventHandler((e: { target: { value: string } }) =>
            updateSchema({ type: e.target.value as OutputRenderType }),
          )}
          options={[
            { label: "纯文本 (text)", value: "text" },
            { label: "卡片列表 (card-list)", value: "card-list" },
          ]}
        />
      </FormField>

      {value.type === "card-list" && (
        <div className="space-y-6 pt-4 border-t border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">分类样式配置</div>
              <Button variant="ghost" size="sm" onClick={addCategory} className="flex items-center gap-1">
                <Plus className="w-3 h-3" />
                添加分类
              </Button>
            </div>

            <div className="space-y-3">
              {(value.categories || []).map((cat, index) => (
                <CategoryItem
                  key={index}
                  category={cat}
                  index={index}
                  totalCategories={value.categories?.length || 0}
                  onUpdate={updateCategory}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onDelete={removeCategory}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryItemProps {
  category: CategoryConfig;
  index: number;
  totalCategories: number;
  onUpdate: (index: number, updates: Partial<CategoryConfig>) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (index: number) => void;
}

function CategoryItem({
  category,
  index,
  totalCategories,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: CategoryItemProps) {
  const handleIdChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, { id: e.target.value });
  });

  const handleLabelChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, { label: e.target.value });
  });

  const handleIconChange = useEventHandler((icon: string) => {
    onUpdate(index, { icon });
  });

  const handleHueChange = useEventHandler((hue?: number) => {
    if (hue !== undefined) {
      onUpdate(index, { hue });
    }
  });

  const handleMoveUp = useEventHandler(() => {
    onMoveUp(index);
  });

  const handleMoveDown = useEventHandler(() => {
    onMoveDown(index);
  });

  const handleDelete = useEventHandler(() => {
    onDelete(index);
  });

  return (
    <div className="p-3 sm:p-4 rounded-xl border border-border bg-muted/10 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">分类 ID</label>
            <TextInput value={category.id} onChange={handleIdChange} className="p-1.5 text-xs font-mono" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">显示名称</label>
            <TextInput value={category.label} onChange={handleLabelChange} className="p-1.5 text-xs" />
          </div>
        </div>
        <ReorderControls
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDelete={handleDelete}
          canMoveUp={index > 0}
          canMoveDown={index < totalCategories - 1}
          className="mt-4"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">图标</label>
          <IconPicker value={category.icon || "Tag"} onChange={handleIconChange} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">颜色 (HSL Hue)</label>
          <HueColorPicker value={category.hue} onChange={handleHueChange} className="w-full h-9" />
        </div>
      </div>
    </div>
  );
}
