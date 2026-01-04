"use client";

import { FormField } from "@/app/components/form-field";
import { TextAreaInput } from "@/app/components/text-area-input";
import { PromptSet } from "@/src/lib/tool-types";
import { Sparkles } from "lucide-react";

interface PromptSetEditorProps {
  value: PromptSet;
  onChange: (value: PromptSet) => void;
  availableFields: string[];
}

export function PromptSetEditor({ value, onChange, availableFields }: PromptSetEditorProps) {
  const updatePrompt = (updates: Partial<PromptSet>) => {
    onChange({ ...value, ...updates });
  };

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
          onChange={(e) => updatePrompt({ systemTemplate: e.target.value })}
          placeholder="定义 AI 的角色和行为规范..."
          className="min-h-24"
        />
      </FormField>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">用户指令模板 (User Template)</label>
          <div className="flex flex-wrap gap-1">
            {availableFields.map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => insertPlaceholder(field)}
                className="px-2 py-0.5 text-[10px] bg-primary/5 text-primary border border-primary/20 rounded hover:bg-primary/10 transition-colors"
                title={`插入 {{${field}}}`}
              >
                {field}
              </button>
            ))}
          </div>
        </div>
        <TextAreaInput
          id="userTemplate"
          value={value.userTemplate}
          onChange={(e) => updatePrompt({ userTemplate: e.target.value })}
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
