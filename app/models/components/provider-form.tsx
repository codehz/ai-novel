"use client";

import { upsertProvider } from "@/src/actions/models";
import { modelProviders } from "@/src/db/schema";
import { X } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-bold">{provider ? "编辑提供商" : "添加提供商"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">提供商名称</label>
            <input
              required
              type="text"
              value={formData.providerName}
              onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
              placeholder="例如: OpenAI, 阿里云"
              className="w-full px-4 py-2 rounded-lg border border-input-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">提供商类型</label>
            <select
              value={formData.providerType}
              onChange={(e) => setFormData({ ...formData, providerType: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input-border bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all"
            >
              <option value="openai">OpenAI 兼容</option>
              <option value="anthropic" disabled>
                Anthropic 兼容(尚未支持)
              </option>
              <option value="ollama" disabled>
                Ollama(尚未支持)
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">API 密钥</label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full px-4 py-2 rounded-lg border border-input-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">API 端点</label>
            <input
              type="url"
              value={formData.apiEndpoint}
              onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className="w-full px-4 py-2 rounded-lg border border-input-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all"
            />
          </div>

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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
