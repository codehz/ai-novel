"use client";

import { FormField } from "@/app/components/form-field";
import { ModalForm } from "@/app/components/modal-form";
import { upsertModel } from "@/src/actions/models";
import { models } from "@/src/db/schema";
import { useState } from "react";

interface ModelFormProps {
  model?: typeof models.$inferSelect | null;
  providerId: number;
  onClose: () => void;
}

export function ModelForm({ model, providerId, onClose }: ModelFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: model?.id,
    providerId: providerId,
    modelName: model?.modelName || "",
    displayName: model?.displayName || "",
    description: model?.description || "",
    inputPrice: model?.inputPrice || 0,
    outputPrice: model?.outputPrice || 0,
    isEnabled: model?.isEnabled ?? true,
    parameters: model?.parameters || {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertModel(formData as typeof models.$inferInsert);
      onClose();
    } catch (error) {
      console.error("Failed to save model:", error);
      alert("保存失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 rounded-lg border border-input-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all";

  return (
    <ModalForm
      title={model ? "编辑模型" : "添加模型"}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      className="max-h-[80vh] overflow-y-auto"
    >
      <FormField label="显示名称" required>
        <input
          required
          type="text"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          placeholder="例如: GPT-4o"
          className={inputClass}
        />
      </FormField>

      <FormField label="模型标识符 (API Name)" required>
        <input
          required
          type="text"
          value={formData.modelName}
          onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
          placeholder="例如: gpt-4o"
          className={`${inputClass} font-mono`}
        />
      </FormField>

      <FormField label="描述">
        <textarea
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="模型描述..."
          className={`${inputClass} resize-none h-20`}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="输入价格 ($/1M)">
          <input
            type="number"
            step="0.000001"
            value={formData.inputPrice || 0}
            onChange={(e) => setFormData({ ...formData, inputPrice: parseFloat(e.target.value) })}
            className={inputClass}
          />
        </FormField>
        <FormField label="输出价格 ($/1M)">
          <input
            type="number"
            step="0.000001"
            value={formData.outputPrice || 0}
            onChange={(e) => setFormData({ ...formData, outputPrice: parseFloat(e.target.value) })}
            className={inputClass}
          />
        </FormField>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="modelIsEnabled"
          checked={formData.isEnabled}
          onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
          className="w-4 h-4 text-primary rounded focus:ring-ring"
        />
        <label htmlFor="modelIsEnabled" className="text-sm font-medium text-foreground">
          启用该模型
        </label>
      </div>
    </ModalForm>
  );
}
