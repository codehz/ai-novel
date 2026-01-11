"use client";

import { Button } from "@/components/button";
import { ItemCard } from "@/components/item-card";
import { useOverlayQueue } from "@/components/overlay";
import { useEventHandler } from "@/hooks/useEventHandler";
import { deleteModel, toggleModelStatus } from "@/src/actions/models";
import { modelProviders, models } from "@/src/db/schema";
import { Plus } from "lucide-react";
import { ModelForm } from "./model-form";

type ProviderWithModels = typeof modelProviders.$inferSelect & {
  models: (typeof models.$inferSelect)[];
};

interface ModelListProps {
  initialProviders: ProviderWithModels[];
}

export function ModelList({ initialProviders }: ModelListProps) {
  const queue = useOverlayQueue();

  const handleEdit = useEventHandler((model: typeof models.$inferSelect) => {
    queue.show(<ModelForm model={model} providerId={model.providerId} />);
  });

  const handleAdd = useEventHandler((providerId: number) => {
    queue.show(<ModelForm providerId={providerId} />);
  });

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
        <ProviderModelSection
          key={provider.id}
          provider={provider}
          handleAdd={handleAdd}
          handleEdit={handleEdit}
          toggleModelStatus={toggleModelStatus}
          deleteModel={deleteModel}
        />
      ))}
    </div>
  );
}

interface ProviderModelSectionProps {
  provider: ProviderWithModels;
  handleAdd: (providerId: number) => void;
  handleEdit: (model: typeof models.$inferSelect) => void;
  toggleModelStatus: (modelId: number, isEnabled: boolean) => Promise<void>;
  deleteModel: (modelId: number) => Promise<void>;
}

function ProviderModelSection({
  provider,
  handleAdd,
  handleEdit,
  toggleModelStatus,
  deleteModel,
}: ProviderModelSectionProps) {
  const onAdd = useEventHandler(() => handleAdd(provider.id));

  return (
    <div key={provider.id} className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          {provider.providerName}
          <span className="text-xs font-normal px-2 py-0.5 bg-muted rounded text-muted-foreground uppercase">
            {provider.providerType}
          </span>
        </h3>
        <Button
          onClick={onAdd}
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary hover:bg-primary/10 font-medium"
        >
          <Plus size={16} className="mr-1" /> 添加模型
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {provider.models.map((model) => (
          <ModelItem
            key={model.id}
            model={model}
            toggleModelStatus={toggleModelStatus}
            handleEdit={handleEdit}
            deleteModel={deleteModel}
          />
        ))}
        {provider.models.length === 0 && (
          <div className="col-span-full py-8 text-center text-muted-foreground text-sm italic">
            暂无模型，点击右上角添加。
          </div>
        )}
      </div>
    </div>
  );
}

interface ModelItemProps {
  model: typeof models.$inferSelect;
  toggleModelStatus: (modelId: number, isEnabled: boolean) => Promise<void>;
  handleEdit: (model: typeof models.$inferSelect) => void;
  deleteModel: (modelId: number) => Promise<void>;
}

function ModelItem({ model, toggleModelStatus, handleEdit, deleteModel }: ModelItemProps) {
  const onToggle = useEventHandler(() => toggleModelStatus(model.id, !model.isEnabled));
  const onEdit = useEventHandler(() => handleEdit(model));
  const onDelete = useEventHandler(() => deleteModel(model.id));

  return (
    <ItemCard
      title={model.displayName}
      subtitle={model.modelName}
      isEnabled={model.isEnabled}
      onToggle={onToggle}
      onEdit={onEdit}
      onDelete={onDelete}
      deleteConfirmMessage="确定要删除该模型吗？"
    >
      <div className="flex justify-between">
        <span>输入价格:</span>
        <span className="text-foreground">${model.inputPrice}/1M tokens</span>
      </div>
      <div className="flex justify-between">
        <span>输出价格:</span>
        <span className="text-foreground">${model.outputPrice}/1M tokens</span>
      </div>
    </ItemCard>
  );
}
