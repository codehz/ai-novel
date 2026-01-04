"use client";

import { FormField } from "@/components/form-field";
import { ModalForm } from "@/components/modal-form";
import { NumberInput } from "@/components/number-input";
import { Switch } from "@/components/switch";
import { TextAreaInput } from "@/components/text-area-input";
import { TextInput } from "@/components/text-input";
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
    temperature: ((model?.parameters as Record<string, unknown>)?.temperature as number) ?? 0.7,
    maxTokens: ((model?.parameters as Record<string, unknown>)?.maxTokens as number) ?? 2048,
    topP: ((model?.parameters as Record<string, unknown>)?.topP as number) ?? 1,
    otherParameters: model?.parameters
      ? JSON.stringify(
          Object.fromEntries(
            Object.entries(model.parameters as object).filter(
              ([k]) => !["temperature", "maxTokens", "topP"].includes(k),
            ),
          ),
          null,
          2,
        )
      : "{}",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let otherParams = {};
      try {
        otherParams = JSON.parse(formData.otherParameters);
      } catch {
        alert("其他参数 JSON 格式错误");
        setLoading(false);
        return;
      }
      const finalParameters = {
        ...otherParams,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
        topP: formData.topP,
      };
      await upsertModel({
        ...formData,
        parameters: finalParameters,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save model:", error);
      alert("保存失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalForm
      title={model ? "编辑模型" : "添加模型"}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      className="max-h-[80vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 mb-2">
        <div className="space-y-0.5">
          <div className="text-sm font-medium">启用状态</div>
          <div className="text-xs text-muted-foreground">控制该模型是否在对话或工作流中可用</div>
        </div>
        <Switch
          checked={formData.isEnabled}
          onChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
          disabled={loading}
        />
      </div>

      <FormField label="显示名称" required>
        <TextInput
          variant="primary"
          required
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          placeholder="例如: GPT-4o"
          disabled={loading}
        />
      </FormField>

      <FormField label="模型标识符 (API Name)" required description="API 调用时使用的模型名称">
        <TextInput
          variant="primary"
          required
          value={formData.modelName}
          onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
          placeholder="例如: gpt-4o"
          className="font-mono"
          disabled={loading}
        />
      </FormField>

      <FormField label="描述">
        <TextAreaInput
          variant="primary"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="模型描述..."
          className="h-20"
          disabled={loading}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="输入价格 ($/1M)" description="每百万 Token 的输入成本">
          <NumberInput
            variant="primary"
            step="0.001"
            value={formData.inputPrice || 0}
            onChange={(e) => setFormData({ ...formData, inputPrice: parseFloat(e.target.value) })}
            disabled={loading}
          />
        </FormField>
        <FormField label="输出价格 ($/1M)" description="每百万 Token 的输出成本">
          <NumberInput
            variant="primary"
            step="0.001"
            value={formData.outputPrice || 0}
            onChange={(e) => setFormData({ ...formData, outputPrice: parseFloat(e.target.value) })}
            disabled={loading}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Temperature">
          <NumberInput
            variant="primary"
            step="0.1"
            min="0"
            max="2"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
            disabled={loading}
          />
        </FormField>
        <FormField label="Max Tokens">
          <NumberInput
            variant="primary"
            step="1"
            min="1"
            value={formData.maxTokens}
            onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
            disabled={loading}
          />
        </FormField>
        <FormField label="Top P">
          <NumberInput
            variant="primary"
            step="0.05"
            min="0"
            max="1"
            value={formData.topP}
            onChange={(e) => setFormData({ ...formData, topP: parseFloat(e.target.value) })}
            disabled={loading}
          />
        </FormField>
      </div>

      <FormField label="其他参数 (JSON)">
        <TextAreaInput
          variant="primary"
          value={formData.otherParameters}
          onChange={(e) => setFormData({ ...formData, otherParameters: e.target.value })}
          placeholder="{}"
          rows={3}
          className="font-mono text-sm"
          disabled={loading}
        />
      </FormField>
    </ModalForm>
  );
}
