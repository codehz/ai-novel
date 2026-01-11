"use client";
import { Button } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import { useEventHandler } from "@/hooks/useEventHandler";
import { getAvailableModels, type ModelInfo, type ProviderWithModels } from "@/src/actions/models";
import { AutoTransition, withAutoTransition } from "@codehz/auto-transition";
import { clsx } from "clsx";
import { ChevronDown, Package, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Dropdown } from "./dropdown";

interface ModelSelectorProps {
  selectedModelId?: number;
  onSelectModel: (modelId: number) => void;
  onClear?: () => void;
  disabled?: boolean;
}

interface ProviderDropdownItemProps {
  provider: ProviderWithModels;
  selectedModelId?: number;
  onSelectModel: (modelId: number) => void;
  close: () => void;
}

const ProviderDropdownItem = ({ provider, selectedModelId, onSelectModel, close }: ProviderDropdownItemProps) => {
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="px-4 py-2 bg-muted/50 sticky top-0 text-xs font-semibold text-muted-foreground">
        {provider.providerName}
      </div>
      {provider.models.map((model) => (
        <ModelItem
          key={model.modelId}
          model={model}
          onSelectModel={onSelectModel}
          close={close}
          selected={selectedModelId === model.modelId}
        />
      ))}
    </div>
  );
};

export const ModelSelector = withAutoTransition(ModelSelectorInner, { as: "div", className: "relative" });

function ModelItem({
  model,
  onSelectModel,
  close,
  selected,
}: {
  model: ModelInfo;
  onSelectModel: (modelId: number) => void;
  close: () => void;
  selected: boolean;
}) {
  const handleClick = useEventHandler((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onSelectModel(model.modelId);
    close();
  });

  return (
    <button
      key={model.modelId}
      type="button"
      onClick={handleClick}
      className={clsx(
        "cursor-pointer w-full text-left px-4 py-3 text-sm transition-colors border-b border-border/50 last:border-b-0",
        selected ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {selected && <span className="text-primary">✓</span>}
          {model.displayName}
        </div>
        <div className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
          ${model.inputPrice}/${model.outputPrice} (1M)
        </div>
      </div>
    </button>
  );
}

interface ClearButtonProps {
  onClear: () => void;
}

function ClearButton({ onClear }: ClearButtonProps) {
  const handleClearClick = useEventHandler((e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
  });

  return (
    <IconButton
      type="button"
      onClick={handleClearClick}
      color="default"
      title="清除选择"
      className="absolute right-10 h-auto w-auto p-1"
    >
      <X className="w-3.5 h-3.5" />
    </IconButton>
  );
}

function ModelSelectorInner({ selectedModelId, onSelectModel, onClear, disabled = false }: ModelSelectorProps) {
  const [providers, setProviders] = useState<ProviderWithModels[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const data = await getAvailableModels();
        setProviders(data);
      } catch (error) {
        console.error("Failed to load models", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  const selectedModel = providers
    .flatMap((p) => p.models.map((m) => ({ ...m, providerName: p.providerName })))
    .find((m) => m.modelId === selectedModelId);

  if (isLoading) {
    return (
      <div
        key="loading"
        className="flex items-center justify-center h-10 px-4 rounded-lg border border-input bg-background text-muted-foreground text-sm"
      >
        加载模型中...
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div
        key="empty"
        className="flex items-center justify-center h-10 px-4 rounded-lg border border-input bg-background text-muted-foreground text-sm"
      >
        暂无可用模型
      </div>
    );
  }

  return (
    <AutoTransition as="div" className="relative flex items-center">
      <Dropdown
        content={({ close }) =>
          providers.map((provider) => (
            <ProviderDropdownItem
              key={provider.providerId}
              provider={provider}
              selectedModelId={selectedModelId}
              onSelectModel={onSelectModel}
              close={close}
            />
          ))
        }
      >
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full flex items-center justify-between h-10 px-4 rounded-lg text-foreground text-sm font-normal"
        >
          <span key={selectedModel ? selectedModel.modelId : "none"} className="flex items-center gap-2 truncate">
            <Package className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              {selectedModel ? (
                <span className="flex items-center gap-2">
                  <span>
                    {selectedModel.providerName} - {selectedModel.displayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded shrink-0">
                    ${selectedModel.inputPrice}/${selectedModel.outputPrice}
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">选择模型</span>
              )}
            </span>
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
        </Button>
      </Dropdown>
      {selectedModel && onClear && <ClearButton onClear={onClear} />}
    </AutoTransition>
  );
}
