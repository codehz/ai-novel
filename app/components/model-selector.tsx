"use client";

import { getAvailableModels, type ProviderWithModels } from "@/src/actions/models";
import { ChevronDown, Package } from "lucide-react";
import { useEffect, useId, useState } from "react";

interface ModelSelectorProps {
  selectedProviderId?: number;
  selectedModelId?: number;
  onSelectModel: (providerId: number, modelId: number) => void;
  onClear?: () => void;
  disabled?: boolean;
}

export function ModelSelector({
  selectedProviderId,
  selectedModelId,
  onSelectModel,
  onClear,
  disabled = false,
}: ModelSelectorProps) {
  const [providers, setProviders] = useState<ProviderWithModels[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const popoverId = useId();

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

  const selectedProvider = providers.find((p) => p.providerId === selectedProviderId);
  const selectedModel = selectedProvider?.models.find((m) => m.modelId === selectedModelId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10 px-4 rounded-lg border border-border bg-muted text-muted-foreground text-sm">
        加载模型中...
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="flex items-center justify-center h-10 px-4 rounded-lg border border-border bg-muted text-muted-foreground text-sm">
        暂无可用模型
      </div>
    );
  }

  return (
    <>
      <div className="relative flex items-center">
        <button
          type="button"
          popoverTarget={popoverId}
          disabled={disabled}
          className="w-full flex items-center justify-between h-10 px-4 rounded-lg border border-border bg-card text-foreground text-sm hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="flex items-center gap-2 truncate">
            <Package className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              {selectedModel ? (
                <span>
                  {selectedProvider?.providerName} - {selectedModel.displayName}
                </span>
              ) : (
                <span className="text-muted-foreground">选择模型</span>
              )}
            </span>
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
        </button>
        {selectedModel && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear?.();
            }}
            className="absolute right-10 p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
            title="清除选择"
          >
            ✕
          </button>
        )}
      </div>

      <div
        id={popoverId}
        popover="auto"
        className="
          anchored-bottom-span-left my-2 w-anchor try-flip-y
          max-h-2/3 overflow-y-auto
          bg-card border border-border rounded-lg shadow-lg
          starting:opacity-0 starting:scale-95 starting:duration-100
          not-popover-open:opacity-0 not-popover-open:scale-95
          transition-all duration-200 ease-out
          transition-discrete"
      >
        <div className="">
          {providers.map((provider) => (
            <div key={provider.providerId} className="border-b border-border last:border-b-0">
              <div className="px-4 py-2 bg-muted/50 sticky top-0 text-xs font-semibold text-muted-foreground">
                {provider.providerName}
              </div>
              {provider.models.map((model) => (
                <button
                  key={model.modelId}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    onSelectModel(provider.providerId, model.modelId);
                    const popoverElement = document.getElementById(popoverId);
                    if (popoverElement && popoverElement.hasAttribute("popover")) {
                      popoverElement.hidePopover();
                    }
                  }}
                  className={`cursor-pointer w-full text-left px-4 py-3 text-sm transition-colors border-b border-border/50 last:border-b-0 ${
                    selectedModelId === model.modelId && selectedProviderId === provider.providerId
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedModelId === model.modelId && selectedProviderId === provider.providerId && (
                      <span className="text-primary">✓</span>
                    )}
                    {model.displayName}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
