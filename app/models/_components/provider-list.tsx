"use client";

import { AddCard } from "@/components/add-card";
import { ItemCard } from "@/components/item-card";
import { deleteProvider, toggleProviderStatus } from "@/src/actions/models";
import { modelProviders, models } from "@/src/db/schema";
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
        <ItemCard
          key={provider.id}
          title={provider.providerName}
          subtitle={provider.providerType}
          isEnabled={provider.isEnabled}
          onToggle={() => toggleProviderStatus(provider.id, !provider.isEnabled)}
          onEdit={() => handleEdit(provider)}
          onDelete={() => deleteProvider(provider.id)}
          deleteConfirmMessage="确定要删除该提供商吗？这将同时删除其下的所有模型。"
        >
          <div className="flex gap-2 items-baseline">
            <span className="text-muted-foreground whitespace-nowrap">端点:</span>
            <span
              className="font-mono truncate text-foreground flex-1 min-w-0 text-right"
              title={provider.apiEndpoint || "默认"}
            >
              {provider.apiEndpoint || "默认"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">模型数量:</span>
            <span className="text-foreground">{provider.models.length}</span>
          </div>
        </ItemCard>
      ))}

      <AddCard onClick={handleAdd} label="添加提供商" />

      <ProviderForm open={isFormOpen} provider={editingProvider} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
