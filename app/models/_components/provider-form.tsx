"use client";

import { FormField } from "@/components/form-field";
import { ModalForm } from "@/components/modal-form";
import { useOverlayRef } from "@/components/overlay/overlay-context";
import { SelectInput } from "@/components/select-input";
import { Switch } from "@/components/switch";
import { TextAreaInput } from "@/components/text-area-input";
import { TextInput } from "@/components/text-input";
import { upsertProvider } from "@/src/actions/models";
import { modelProviders } from "@/src/db/schema";
import { useState } from "react";

interface ProviderFormProps {
  provider?: typeof modelProviders.$inferSelect | null;
  onSuccess?: () => void;
}

export function ProviderForm({ provider, onSuccess }: ProviderFormProps) {
  const overlayRef = useOverlayRef();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: provider?.id,
    providerType: provider?.providerType || "openai-compatible",
    providerName: provider?.providerName || "OpenAI",
    apiKey: provider?.apiKey || "",
    apiEndpoint: provider?.apiEndpoint || "https://api.openai.com/v1",
    config: provider?.config ? JSON.stringify(provider.config, null, 2) : "{}",
    isEnabled: provider?.isEnabled ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let configObj = {};
      try {
        configObj = JSON.parse(formData.config);
      } catch {
        alert("配置 JSON 格式错误");
        setLoading(false);
        return;
      }
      await upsertProvider({
        ...formData,
        config: configObj,
      } as typeof modelProviders.$inferInsert);

      // 成功后关闭表单并执行回调
      overlayRef.close();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save provider:", error);
      alert("保存失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalForm title={provider ? "编辑提供商" : "添加提供商"} onSubmit={handleSubmit} loading={loading}>
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 mb-2">
        <div className="space-y-0.5">
          <div className="text-sm font-medium">启用状态</div>
          <div className="text-xs text-muted-foreground">控制该提供商及其下的所有模型是否可用</div>
        </div>
        <Switch
          checked={formData.isEnabled}
          onChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
          disabled={loading}
        />
      </div>

      <FormField label="提供商名称" required description="用于识别该提供商的友好名称">
        <TextInput
          variant="primary"
          required
          value={formData.providerName}
          onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
          placeholder="例如: OpenAI, 阿里云"
          disabled={loading}
        />
      </FormField>

      <FormField label="提供商类型" description="选择 API 协议类型">
        <SelectInput
          variant="primary"
          value={formData.providerType}
          onChange={(e) => setFormData({ ...formData, providerType: e.target.value })}
          disabled={loading}
          options={[
            { label: "OpenAI 兼容", value: "openai-compatible" },
            { label: "Anthropic 兼容(尚未支持)", value: "anthropic" },
            { label: "Ollama(尚未支持)", value: "ollama" },
          ]}
        />
      </FormField>

      <FormField label="API 密钥">
        <TextInput
          variant="primary"
          type="password"
          value={formData.apiKey}
          onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
          placeholder="sk-..."
          disabled={loading}
        />
      </FormField>

      <FormField label="API 端点">
        <TextInput
          variant="primary"
          type="url"
          value={formData.apiEndpoint}
          onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
          placeholder="https://api.openai.com/v1"
          disabled={loading}
        />
      </FormField>

      <FormField label="额外配置 (JSON)">
        <TextAreaInput
          variant="primary"
          value={formData.config}
          onChange={(e) => setFormData({ ...formData, config: e.target.value })}
          placeholder="{}"
          rows={4}
          className="font-mono text-sm"
          disabled={loading}
        />
      </FormField>
    </ModalForm>
  );
}
