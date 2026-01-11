"use client";

import { Button } from "@/components/button";
import { TextInput } from "@/components/text-input";
import { useEventHandler } from "@/hooks/useEventHandler";
import { Plus } from "lucide-react";
import type { ChangeEvent } from "react";
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

interface OptionRowProps {
  option: Option;
  index: number;
  labelPlaceholder: string;
  valuePlaceholder: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdate: (index: number, field: keyof Option, value: string) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: "up" | "down") => void;
}

function OptionRow({
  option,
  index,
  labelPlaceholder,
  valuePlaceholder,
  canMoveUp,
  canMoveDown,
  onUpdate,
  onRemove,
  onMove,
}: OptionRowProps) {
  const handleLabelChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "label", e.target.value);
  });

  const handleValueChange = useEventHandler((e: ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "value", e.target.value);
  });

  const handleMoveUp = useEventHandler(() => {
    onMove(index, "up");
  });

  const handleMoveDown = useEventHandler(() => {
    onMove(index, "down");
  });

  const handleDelete = useEventHandler(() => {
    onRemove(index);
  });

  return (
    <div className="flex items-center gap-2">
      <TextInput
        value={option.label}
        onChange={handleLabelChange}
        placeholder={labelPlaceholder}
        className="flex-1 p-1.5 focus:ring-1"
      />
      <TextInput
        value={option.value}
        onChange={handleValueChange}
        placeholder={valuePlaceholder}
        className="flex-1 p-1.5 font-mono focus:ring-1"
      />
      <ReorderControls
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onDelete={handleDelete}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      />
    </div>
  );
}

export function OptionsListEditor({
  options,
  onChange,
  labelPlaceholder = "显示名称",
  valuePlaceholder = "值",
}: OptionsListEditorProps) {
  const addOption = useEventHandler(() => {
    onChange([...options, { label: "", value: "" }]);
  });

  const updateOption = useEventHandler((index: number, field: keyof Option, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onChange(newOptions);
  });

  const removeOption = useEventHandler((index: number) => {
    onChange(options.filter((_, i) => i !== index));
  });

  const moveOption = useEventHandler((index: number, direction: "up" | "down") => {
    const newOptions = [...options];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
    onChange(newOptions);
  });

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <OptionRow
          key={index}
          option={option}
          index={index}
          labelPlaceholder={labelPlaceholder}
          valuePlaceholder={valuePlaceholder}
          canMoveUp={index > 0}
          canMoveDown={index < options.length - 1}
          onUpdate={updateOption}
          onRemove={removeOption}
          onMove={moveOption}
        />
      ))}
      <Button variant="ghost" size="sm" onClick={addOption} className="flex items-center gap-1 mt-1">
        <Plus className="w-3 h-3" />
        添加选项
      </Button>
    </div>
  );
}
