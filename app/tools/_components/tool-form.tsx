/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormField } from "@/components/form-field";
import { IconPicker } from "@/components/icon-picker";
import { ModalForm } from "@/components/modal-form";
import { Switch } from "@/components/switch";
import { TextAreaInput } from "@/components/text-area-input";
import { TextInput } from "@/components/text-input";
import { upsertToolConfig } from "@/src/actions/tools";
import { InputSchema, OutputSchema, PromptSet, ToolConfig } from "@/src/lib/tool-types";
import { useState } from "react";
import { InputSchemaEditor } from "./input-schema-editor";
import { OutputSchemaEditor } from "./output-schema-editor";
import { PromptSetEditor } from "./prompt-set-editor";

interface ToolFormProps {
  open: boolean;
  tool?: ToolConfig;
  onClose: () => void;
}

export function ToolForm({ open, tool, onClose }: ToolFormProps) {
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

  const [inputSchema, setInputSchema] = useState<InputSchema>(tool?.inputSchema || { fields: [], submitLabel: "执行" });
  const [outputSchema, setOutputSchema] = useState<OutputSchema>(tool?.outputSchema || { type: "text" });
  const [prompts, setPrompts] = useState<PromptSet>(tool?.prompts || { userTemplate: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await upsertToolConfig({
        ...formData,
        inputSchema,
        outputSchema,
        prompts,
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
      open={open}
      title={tool ? "编辑工具" : "新建工具"}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      maxWidth="max-w-2xl"
      className="max-h-[80vh] overflow-y-auto"
    >
      {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>}

      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 mb-2">
        <div className="space-y-0.5">
          <div className="text-sm font-medium">启用状态</div>
          <div className="text-xs text-muted-foreground">控制该工具是否在工作流中可用</div>
        </div>
        <Switch
          checked={formData.isEnabled}
          onChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="工具 ID" required description="工具的唯一标识符，创建后不可更改">
          <TextInput
            value={formData.toolId}
            onChange={(e) => setFormData({ ...formData, toolId: e.target.value })}
            disabled={!!tool || loading}
            placeholder="例如: my-tool"
            required
          />
        </FormField>
        <FormField label="版本" required description="遵循语义化版本规范 (如 1.0.0)">
          <TextInput
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            disabled={loading}
            placeholder="1.0.0"
            required
          />
        </FormField>
      </div>

      <FormField label="名称" required description="显示在工具列表和执行界面的名称">
        <TextInput
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={loading}
          placeholder="工具显示名称"
          required
        />
      </FormField>

      <FormField label="描述" required description="简要说明该工具的功能和用途">
        <TextAreaInput
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={loading}
          placeholder="工具功能描述"
          className="min-h-20"
          required
        />
      </FormField>

      <FormField label="图标 (Lucide 名称)">
        <IconPicker value={formData.icon} onChange={(icon) => setFormData({ ...formData, icon })} disabled={loading} />
      </FormField>

      <div className="space-y-8 pt-6 mt-6 border-t border-border">
        <div className="p-4 rounded-2xl border border-border bg-muted/5 space-y-6">
          <InputSchemaEditor value={inputSchema} onChange={setInputSchema} />
        </div>

        <div className="p-4 rounded-2xl border border-border bg-muted/5 space-y-6">
          <OutputSchemaEditor value={outputSchema} onChange={setOutputSchema} />
        </div>

        <div className="p-4 rounded-2xl border border-border bg-muted/5 space-y-6">
          <PromptSetEditor
            value={prompts}
            onChange={setPrompts}
            availableFields={inputSchema.fields.map((f) => f.name)}
          />
        </div>
      </div>
    </ModalForm>
  );
}
