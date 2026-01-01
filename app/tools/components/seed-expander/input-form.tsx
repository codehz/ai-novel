"use client";

import { FormField } from "@/app/components/form-field";
import { Loader2, Send, Trash2 } from "lucide-react";

interface InputFormProps {
  value: string;
  onChange: (value: string) => void;
  onExpand: (idea: string) => void;
  isLoading: boolean;
}

export function InputForm({ value, onChange, onExpand, isLoading }: InputFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().length >= 5) {
      onExpand(value);
    }
  };

  const examples = [
    "一个失去记忆的侦探在未来城市追查自己",
    "在一颗永远是白昼的星球上，人们开始集体失眠",
    "一个能听见古董说话的修复师，卷入了一场跨越百年的谋杀案",
  ];

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[120px] text-lg leading-relaxed";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField label="你的种子想法" required>
        <div className="relative">
          <textarea
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="输入一个简短的创意种子，例如：一个失去记忆的侦探在未来城市追查自己..."
            className={inputClass}
            disabled={isLoading}
          />
          {value && !isLoading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-3 bottom-3 p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-muted-foreground">建议 5-200 字，越具体效果越好。</p>
          <p className="text-xs text-muted-foreground">{value.length} / 200</p>
        </div>
      </FormField>

      <div className="flex flex-wrap gap-2">
        {examples.map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(ex)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
          >
            {ex.length > 20 ? ex.slice(0, 20) + "..." : ex}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading || value.trim().length < 5}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            正在探索可能性...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            生成扩展想法
          </>
        )}
      </button>
    </form>
  );
}
