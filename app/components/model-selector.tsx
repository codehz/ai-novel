"use client";

import { getAvailableModels, type ProviderWithModels } from "@/src/actions/models";
import { AutoTransition } from "@codehz/auto-transition";
import { ChevronDown, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Dropdown } from "./dropdown";

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
    <AutoTransition as="div" className="relative flex items-center">
      <Dropdown
        content={({ close }) =>
          providers.map((provider) => (
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
                    close();
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
          ))
        }
      >
        <AutoTransition
          as="button"
          type="button"
          disabled={disabled}
          className="w-full flex items-center justify-between h-10 px-4 rounded-lg border border-border bg-card text-foreground text-sm hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span
            key={selectedModel ? `${selectedProvider?.providerId}-${selectedModel.modelId}` : "none"}
            className="flex items-center gap-2 truncate"
          >
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
        </AutoTransition>
      </Dropdown>
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
    </AutoTransition>
  );
}
