"use client";

import { deleteModel, toggleModelStatus } from "@/src/actions/models";
import { modelProviders, models } from "@/src/db/schema";
import { Edit2, Plus, Power, Trash2 } from "lucide-react";
import { useState } from "react";
import { ModelForm } from "./model-form";

type ProviderWithModels = typeof modelProviders.$inferSelect & {
  models: (typeof models.$inferSelect)[];
};

interface ModelListProps {
  initialProviders: ProviderWithModels[];
}

export function ModelList({ initialProviders }: ModelListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<typeof models.$inferSelect | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);

  const handleEdit = (model: typeof models.$inferSelect) => {
    setEditingModel(model);
    setSelectedProviderId(model.providerId);
    setIsFormOpen(true);
  };

  const handleAdd = (providerId: number) => {
    setEditingModel(null);
    setSelectedProviderId(providerId);
    setIsFormOpen(true);
  };

  if (initialProviders.length === 0) {
    return (
      <div className="text-center py-12 bg-muted rounded-2xl border-2 border-dashed border-border">
        <p className="text-muted-foreground">请先添加模型提供商。</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {initialProviders.map((provider) => (
        <div key={provider.id} className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              {provider.providerName}
              <span className="text-xs font-normal px-2 py-0.5 bg-muted rounded text-muted-foreground uppercase">
                {provider.providerType}
              </span>
            </h3>
            <button
              onClick={() => handleAdd(provider.id)}
              className="text-sm flex items-center gap-1 text-primary hover:opacity-80 font-medium"
            >
              <Plus size={16} /> 添加模型
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {provider.models.map((model) => (
              <div
                key={model.id}
                className={`p-4 rounded-xl border bg-card border-border shadow-sm transition-all ${
                  !model.isEnabled ? "opacity-60 grayscale-[0.5]" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-foreground">{model.displayName}</h4>
                    <p className="text-xs text-muted-foreground font-mono">{model.modelName}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleModelStatus(model.id, !model.isEnabled)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        model.isEnabled ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Power size={14} />
                    </button>
                    <button
                      onClick={() => handleEdit(model)}
                      className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("确定要删除该模型吗？")) {
                          deleteModel(model.id);
                        }
                      }}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>输入价格:</span>
                    <span className="text-foreground">${model.inputPrice}/1k tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span>输出价格:</span>
                    <span className="text-foreground">${model.outputPrice}/1k tokens</span>
                  </div>
                </div>
              </div>
            ))}
            {provider.models.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground text-sm italic">
                暂无模型，点击右上角添加。
              </div>
            )}
          </div>
        </div>
      ))}

      {isFormOpen && (
        <ModelForm model={editingModel} providerId={selectedProviderId!} onClose={() => setIsFormOpen(false)} />
      )}
    </div>
  );
}
