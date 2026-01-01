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
          className={`p-6 rounded-xl border bg-white shadow-sm transition-all ${
            !provider.isEnabled ? "opacity-60 grayscale-[0.5]" : ""
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">{provider.providerName}</h3>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-mono">{provider.providerType}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleProviderStatus(provider.id, !provider.isEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  provider.isEnabled ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"
                }`}
                title={provider.isEnabled ? "禁用" : "启用"}
              >
                <Power size={18} />
              </button>
              <button
                onClick={() => handleEdit(provider)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="删除"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">端点:</span>
              <span className="font-mono truncate max-w-[150px]" title={provider.apiEndpoint || "默认"}>
                {provider.apiEndpoint || "默认"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">模型数量:</span>
              <span>{provider.models.length}</span>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group text-gray-400 hover:text-blue-600"
      >
        <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-medium">添加提供商</span>
      </button>

      {isFormOpen && <ProviderForm provider={editingProvider} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}
