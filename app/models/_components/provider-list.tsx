"use client";

import { AddCard } from "@/components/add-card";
import { ItemCard } from "@/components/item-card";
import { useOverlayQueue } from "@/components/overlay";
import { useEventHandler } from "@/hooks/useEventHandler";
import { deleteProvider, toggleProviderStatus } from "@/src/actions/models";
import { modelProviders, models } from "@/src/db/schema";
import { ProviderForm } from "./provider-form";

type ProviderWithModels = typeof modelProviders.$inferSelect & {
  models: (typeof models.$inferSelect)[];
};

interface ProviderItemProps {
  provider: ProviderWithModels;
  onEdit: (provider: ProviderWithModels) => void;
}

function ProviderItem({ provider, onEdit }: ProviderItemProps) {
  const handleToggle = useEventHandler(() => toggleProviderStatus(provider.id, !provider.isEnabled));
  const handleEdit = useEventHandler(() => onEdit(provider));
  const handleDelete = useEventHandler(() => deleteProvider(provider.id));

  return (
    <ItemCard
      title={provider.providerName}
      subtitle={provider.providerType}
      isEnabled={provider.isEnabled}
      onToggle={handleToggle}
      onEdit={handleEdit}
      onDelete={handleDelete}
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
  );
}

interface ProviderListProps {
  initialProviders: ProviderWithModels[];
}

export function ProviderList({ initialProviders }: ProviderListProps) {
  const queue = useOverlayQueue();
  const handleEdit = useEventHandler((provider: ProviderWithModels) => {
    queue.show(<ProviderForm provider={provider} />);
  });

  const handleAdd = useEventHandler(() => {
    queue.show(<ProviderForm />);
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {initialProviders.map((provider) => (
        <ProviderItem key={provider.id} provider={provider} onEdit={handleEdit} />
      ))}

      <AddCard onClick={handleAdd} label="添加提供商" />
    </div>
  );
}
