"use client";

import { FormField } from "@/app/components/form-field";
import { ModalForm } from "@/app/components/modal-form";
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
    providerType: provider?.providerType || "openai",
    providerName: provider?.providerName || "OpenAI",
    apiKey: provider?.apiKey || "",
    apiEndpoint: provider?.apiEndpoint || "https://api.openai.com/v1",
    isEnabled: provider?.isEnabled ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertProvider(formData as typeof modelProviders.$inferInsert);
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
          <option value="openai">OpenAI 兼容</option>
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

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="isEnabled"
          checked={formData.isEnabled}
          onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
          className="w-4 h-4 text-primary rounded focus:ring-ring"
        />
        <label htmlFor="isEnabled" className="text-sm font-medium text-foreground">
          启用该提供商
        </label>
      </div>
    </ModalForm>
  );
}
