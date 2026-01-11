"use client";

import { Button } from "@/components/button";
import { FormField } from "@/components/form-field";
import { TextAreaInput } from "@/components/text-area-input";
import { useEventHandler } from "@/hooks/useEventHandler";
import { PromptSet } from "@/shared/tool-types";
import { Sparkles } from "lucide-react";
import type { ChangeEvent } from "react";

interface FieldPlaceholderButtonProps {
  field: string;
  onInsert: (field: string) => void;
}

function FieldPlaceholderButton({ field, onInsert }: FieldPlaceholderButtonProps) {
  const handleClick = useEventHandler(() => {
    onInsert(field);
  });

  return (
    <Button onClick={handleClick} variant="ghost" size="sm" title={`插入 {{${field}}}`}>
      {`{{${field}}}`}
    </Button>
  );
}

interface PromptSetEditorProps {
  value: PromptSet;
  onChange: (value: PromptSet) => void;
  availableFields: string[];
}

export function PromptSetEditor({ value, onChange, availableFields }: PromptSetEditorProps) {
  const updatePrompt = useEventHandler((updates: Partial<PromptSet>) => {
    onChange({ ...value, ...updates });
  });

  const handleSystemChange = useEventHandler((e: ChangeEvent<HTMLTextAreaElement>) => {
    updatePrompt({ systemTemplate: e.target.value });
  });

  const handleUserChange = useEventHandler((e: ChangeEvent<HTMLTextAreaElement>) => {
    updatePrompt({ userTemplate: e.target.value });
  });

  const insertPlaceholder = (field: string) => {
    const textarea = document.getElementById("userTemplate") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = `${before}{{${field}}}${after}`;

    updatePrompt({ userTemplate: newText });

    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      const newPos = start + field.length + 4;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">提示词配置</div>
      </div>

      <FormField label="系统提示词 (System Prompt)">
        <TextAreaInput
          value={value.systemTemplate || ""}
          onChange={handleSystemChange}
          placeholder="定义 AI 的角色和行为规范..."
          className="min-h-24"
        />
      </FormField>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">用户指令模板 (User Template)</label>
          <div className="flex flex-wrap gap-1">
            {availableFields.map((field) => (
              <FieldPlaceholderButton key={field} field={field} onInsert={insertPlaceholder} />
            ))}
          </div>
        </div>
        <TextAreaInput
          id="userTemplate"
          value={value.userTemplate}
          onChange={handleUserChange}
          placeholder="使用 {{fieldName}} 来引用输入字段..."
          className="font-mono min-h-40"
          required
        />
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          提示：点击上方的字段名可快速插入占位符
        </p>
      </div>
    </div>
  );
}
