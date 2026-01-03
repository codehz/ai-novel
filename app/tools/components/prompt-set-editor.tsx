"use client";

import { FormField } from "@/app/components/form-field";
import { PromptSet } from "@/src/lib/tool-types";
import { Plus, Sparkles } from "lucide-react";
import { ReorderControls } from "./reorder-controls";

interface PromptSetEditorProps {
  value: PromptSet;
  onChange: (value: PromptSet) => void;
  availableFields: string[];
}

export function PromptSetEditor({ value, onChange, availableFields }: PromptSetEditorProps) {
  const updatePrompt = (updates: Partial<PromptSet>) => {
    onChange({ ...value, ...updates });
  };

  const addExample = () => {
    const examples = [...(value.examples || []), { input: {}, output: {} }];
    updatePrompt({ examples });
  };

  const updateExample = (index: number, field: "input" | "output", jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      const examples = [...(value.examples || [])];
      examples[index] = { ...examples[index], [field]: parsed };
      updatePrompt({ examples });
    } catch {
      // Ignore invalid JSON while typing
    }
  };

  const removeExample = (index: number) => {
    const examples = (value.examples || []).filter((_, i) => i !== index);
    updatePrompt({ examples });
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
        <textarea
          value={value.systemTemplate || ""}
          onChange={(e) => updatePrompt({ systemTemplate: e.target.value })}
          placeholder="定义 AI 的角色和行为规范..."
          className="w-full p-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-24"
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
        <textarea
          id="userTemplate"
          value={value.userTemplate}
          onChange={(e) => updatePrompt({ userTemplate: e.target.value })}
          placeholder="使用 {{fieldName}} 来引用输入字段..."
          className="w-full p-3 text-sm rounded-lg border border-input bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-40"
          required
        />
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          提示：点击上方的字段名可快速插入占位符
        </p>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">少样本示例 (Few-shot Examples)</div>
          <button
            type="button"
            onClick={addExample}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            添加示例
          </button>
        </div>

        <div className="space-y-4">
          {(value.examples || []).map((example, index) => (
            <div key={index} className="p-4 rounded-xl border border-border bg-muted/10 space-y-3 relative">
              <div className="absolute top-2 right-2">
                <ReorderControls onDelete={() => removeExample(index)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">输入示例 (JSON)</label>
                  <textarea
                    defaultValue={JSON.stringify(example.input, null, 2)}
                    onBlur={(e) => updateExample(index, "input", e.target.value)}
                    className="w-full p-2 text-xs rounded border border-input bg-background font-mono min-h-24"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">输出示例 (JSON)</label>
                  <textarea
                    defaultValue={JSON.stringify(example.output, null, 2)}
                    onBlur={(e) => updateExample(index, "output", e.target.value)}
                    className="w-full p-2 text-xs rounded border border-input bg-background font-mono min-h-24"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
