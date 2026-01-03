"use client";

import { FormField } from "@/app/components/form-field";
import { ModalForm } from "@/app/components/modal-form";
import { Switch } from "@/app/components/switch";
import { upsertProvider } from "@/src/actions/models";
import { modelProviders } from "@/src/db/schema";
import { useState } from "react";

interface ProviderFormProps {
  provider?: typeof modelProviders.$inferSelect | null;
  onClose: () => void;
}

export function ProviderForm({ provider, onClose }: ProviderFormProps) {
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
      onClose();
    } catch (error) {
      console.error("Failed to save provider:", error);
      alert("保存失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 rounded-lg border border-input-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all";

  return (
    <ModalForm
      title={provider ? "编辑提供商" : "添加提供商"}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
    >
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

      <FormField label="提供商名称" required>
        <input
          required
          type="text"
          value={formData.providerName}
          onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
          placeholder="例如: OpenAI, 阿里云"
          className={inputClass}
        />
      </FormField>

      <FormField label="提供商类型">
        <select
          value={formData.providerType}
          onChange={(e) => setFormData({ ...formData, providerType: e.target.value })}
          className={inputClass}
        >
          <option value="openai-compatible">OpenAI 兼容</option>
          <option value="anthropic" disabled>
            Anthropic 兼容(尚未支持)
          </option>
          <option value="ollama" disabled>
            Ollama(尚未支持)
          </option>
        </select>
      </FormField>

      <FormField label="API 密钥">
        <input
          type="password"
          value={formData.apiKey}
          onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
          placeholder="sk-..."
          className={inputClass}
        />
      </FormField>

      <FormField label="API 端点">
        <input
          type="url"
          value={formData.apiEndpoint}
          onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
          placeholder="https://api.openai.com/v1"
          className={inputClass}
        />
      </FormField>

      <FormField label="额外配置 (JSON)">
        <textarea
          value={formData.config}
          onChange={(e) => setFormData({ ...formData, config: e.target.value })}
          placeholder="{}"
          rows={4}
          className={inputClass + " font-mono text-sm"}
        />
      </FormField>
    </ModalForm>
  );
}
