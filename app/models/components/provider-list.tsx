"use client";

import { deleteProvider, toggleProviderStatus } from "@/src/actions/models";
import { modelProviders, models } from "@/src/db/schema";
import { Edit2, Plus, Power, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProviderForm } from "./provider-form";

type ProviderWithModels = typeof modelProviders.$inferSelect & {
  models: (typeof models.$inferSelect)[];
};

interface ProviderListProps {
  initialProviders: ProviderWithModels[];
}

export function ProviderList({ initialProviders }: ProviderListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderWithModels | null>(null);

  const handleEdit = (provider: ProviderWithModels) => {
    setEditingProvider(provider);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingProvider(null);
    setIsFormOpen(true);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {initialProviders.map((provider) => (
        <div
          key={provider.id}
          className={`p-6 rounded-xl border bg-card border-border shadow-sm transition-all ${
            !provider.isEnabled ? "opacity-60 grayscale-[0.5]" : ""
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-foreground">{provider.providerName}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                {provider.providerType}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleProviderStatus(provider.id, !provider.isEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  provider.isEnabled ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted"
                }`}
                title={provider.isEnabled ? "禁用" : "启用"}
              >
                <Power size={18} />
              </button>
              <button
                onClick={() => handleEdit(provider)}
                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="编辑"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => {
                  if (confirm("确定要删除该提供商吗？这将同时删除其下的所有模型。")) {
                    deleteProvider(provider.id);
                  }
                }}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="删除"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">端点:</span>
              <span className="font-mono truncate max-w-37.5 text-foreground" title={provider.apiEndpoint || "默认"}>
                {provider.apiEndpoint || "默认"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">模型数量:</span>
              <span className="text-foreground">{provider.models.length}</span>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group text-muted-foreground hover:text-primary"
      >
        <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-medium">添加提供商</span>
      </button>

      {isFormOpen && <ProviderForm provider={editingProvider} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}
