"use client";
import { IconButton } from "@/components/icon-button";
import { useEventHandler } from "@/hooks/useEventHandler";
import { getAvailableModels, type ModelInfo, type ProviderWithModels } from "@/src/actions/models";
import clsx from "clsx";
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
    <div className="py-1">
      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground sticky top-0 bg-card">
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
        "w-full text-left px-4 py-2 text-sm transition-colors",
        selected ? "bg-accent/50 font-medium" : "hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {selected && <span className="text-primary shrink-0">✓</span>}
          <span className="truncate">{model.displayName}</span>
        </div>
        <div className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
          ${model.inputPrice}/${model.outputPrice}
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
      className="absolute right-2 h-auto w-auto p-1"
    >
      <X className="w-3.5 h-3.5" />
    </IconButton>
  );
}

export function ModelSelector({ selectedModelId, onSelectModel, onClear, disabled = false }: ModelSelectorProps) {
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

  const baseStyles =
    "px-4 py-2 rounded-lg border border-input-border bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-primary";

  if (isLoading) {
    return (
      <div
        key="loading"
        className={clsx(baseStyles, "flex items-center justify-center h-10 text-muted-foreground text-sm")}
      >
        加载模型中...
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div
        key="empty"
        className={clsx(baseStyles, "flex items-center justify-center h-10 text-muted-foreground text-sm")}
      >
        暂无可用模型
      </div>
    );
  }

  return (
    <div className="relative">
      <Dropdown
        className="min-w-(--anchor-width)"
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
        <button
          type="button"
          disabled={disabled}
          className={clsx(
            baseStyles,
            "flex items-center justify-between w-full outline-none transition-all text-left",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          )}
        >
          <span key={selectedModel ? selectedModel.modelId : "none"} className="flex items-center gap-2 truncate">
            <Package className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              {selectedModel ? (
                <span className="flex items-baseline gap-2">
                  <span>
                    {selectedModel.providerName} - {selectedModel.displayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-card px-1 rounded shrink-0">
                    ${selectedModel.inputPrice}/${selectedModel.outputPrice}
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">选择模型</span>
              )}
            </span>
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </Dropdown>
      {selectedModel && onClear && <ClearButton onClear={onClear} />}
    </div>
  );
}
