/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormField } from "@/app/components/form-field";
import { IconPicker } from "@/app/components/icon-picker";
import { ModalForm } from "@/app/components/modal-form";
import { upsertToolConfig } from "@/src/actions/tools";
import { InputSchema, OutputSchema, PromptSet, ToolConfig } from "@/src/lib/tool-types";
import { useState } from "react";

interface ToolFormProps {
  tool?: ToolConfig;
  onClose: () => void;
}

export function ToolForm({ tool, onClose }: ToolFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    toolId: tool?.id || "",
    name: tool?.name || "",
    description: tool?.description || "",
    icon: tool?.icon || "Sparkles",
    version: tool?.version || "1.0.0",
    isEnabled: tool?.isEnabled ?? true,
  });

  const [inputSchema, setInputSchema] = useState<string>(
    JSON.stringify(tool?.inputSchema || { fields: [], submitLabel: "执行" }, null, 2),
  );
  const [outputSchema, setOutputSchema] = useState<string>(
    JSON.stringify(tool?.outputSchema || { type: "text" }, null, 2),
  );
  const [prompts, setPrompts] = useState<string>(JSON.stringify(tool?.prompts || { userTemplate: "" }, null, 2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate JSON
      let parsedInputSchema: InputSchema;
      let parsedOutputSchema: OutputSchema;
      let parsedPrompts: PromptSet | undefined;

      try {
        parsedInputSchema = JSON.parse(inputSchema);
      } catch {
        throw new Error("输入模式 JSON 格式错误");
      }

      try {
        parsedOutputSchema = JSON.parse(outputSchema);
      } catch {
        throw new Error("输出模式 JSON 格式错误");
      }

      try {
        parsedPrompts = prompts ? JSON.parse(prompts) : undefined;
      } catch {
        throw new Error("提示词配置 JSON 格式错误");
      }

      await upsertToolConfig({
        ...formData,
        inputSchema: parsedInputSchema,
        outputSchema: parsedOutputSchema,
        prompts: parsedPrompts,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "保存失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalForm
      title={tool ? "编辑工具" : "新建工具"}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      maxWidth="max-w-2xl"
      className="max-h-[80vh] overflow-y-auto"
    >
      {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <FormField label="工具 ID" required>
          <input
            type="text"
            value={formData.toolId}
            onChange={(e) => setFormData({ ...formData, toolId: e.target.value })}
            disabled={!!tool || loading}
            placeholder="例如: my-tool"
            className="w-full p-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </FormField>
        <FormField label="版本" required>
          <input
            type="text"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            disabled={loading}
            placeholder="1.0.0"
            className="w-full p-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </FormField>
      </div>

      <FormField label="名称" required>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={loading}
          placeholder="工具显示名称"
          className="w-full p-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
      </FormField>

      <FormField label="描述" required>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={loading}
          placeholder="工具功能描述"
          className="w-full p-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-20"
          required
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="图标 (Lucide 名称)">
          <IconPicker
            value={formData.icon}
            onChange={(icon) => setFormData({ ...formData, icon })}
            disabled={loading}
          />
        </FormField>
        <div className="flex items-center pt-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              disabled={loading}
              className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20"
            />
            <span className="text-sm font-medium">启用工具</span>
          </label>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <FormField label="输入模式 (InputSchema JSON)" required>
          <textarea
            value={inputSchema}
            onChange={(e) => setInputSchema(e.target.value)}
            disabled={loading}
            className="w-full p-2 rounded-lg border border-input bg-background font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-40"
            required
          />
        </FormField>

        <FormField label="输出模式 (OutputSchema JSON)" required>
          <textarea
            value={outputSchema}
            onChange={(e) => setOutputSchema(e.target.value)}
            disabled={loading}
            className="w-full p-2 rounded-lg border border-input bg-background font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-40"
            required
          />
        </FormField>

        <FormField label="提示词配置 (PromptSet JSON)">
          <textarea
            value={prompts}
            onChange={(e) => setPrompts(e.target.value)}
            disabled={loading}
            className="w-full p-2 rounded-lg border border-input bg-background font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-40"
          />
        </FormField>
      </div>
    </ModalForm>
  );
}
