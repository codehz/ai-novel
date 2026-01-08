"use client";

import { Button } from "@/components/button";
import { TextInput } from "@/components/text-input";
import { Plus } from "lucide-react";
import { ReorderControls } from "./reorder-controls";

interface Option {
  label: string;
  value: string | number;
}

interface OptionsListEditorProps {
  options: Option[];
  onChange: (options: Option[]) => void;
  labelPlaceholder?: string;
  valuePlaceholder?: string;
}

export function OptionsListEditor({
  options,
  onChange,
  labelPlaceholder = "显示名称",
  valuePlaceholder = "值",
}: OptionsListEditorProps) {
  const addOption = () => {
    onChange([...options, { label: "", value: "" }]);
  };

  const updateOption = (index: number, field: keyof Option, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onChange(newOptions);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const moveOption = (index: number, direction: "up" | "down") => {
    const newOptions = [...options];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
    onChange(newOptions);
  };

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <TextInput
            value={option.label}
            onChange={(e) => updateOption(index, "label", e.target.value)}
            placeholder={labelPlaceholder}
            className="flex-1 p-1.5 focus:ring-1"
          />
          <TextInput
            value={option.value}
            onChange={(e) => updateOption(index, "value", e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1 p-1.5 font-mono focus:ring-1"
          />
          <ReorderControls
            onMoveUp={() => moveOption(index, "up")}
            onMoveDown={() => moveOption(index, "down")}
            onDelete={() => removeOption(index)}
            canMoveUp={index > 0}
            canMoveDown={index < options.length - 1}
          />
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={addOption} className="flex items-center gap-1 mt-1">
        <Plus className="w-3 h-3" />
        添加选项
      </Button>
    </div>
  );
}
