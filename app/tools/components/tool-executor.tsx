/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { clearToolHistory, deleteToolHistory, executeTool, getToolHistory } from "@/src/actions/tools";
import { ToolConfig, ToolHistoryItem } from "@/src/lib/tool-types";
import { AutoTransition } from "@codehz/auto-transition";
import { useEffect, useState } from "react";
import { DynamicForm } from "./dynamic-form";
import { DynamicResult } from "./dynamic-result";
import { GenericHistoryList } from "./generic-history-list";

interface ToolExecutorProps {
  toolId: string;
  config: ToolConfig;
}

export function ToolExecutor({ toolId, config }: ToolExecutorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ToolHistoryItem[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | undefined>(undefined);
  const [selectedProviderId, setSelectedProviderId] = useState<number | undefined>(undefined);
  const [selectedModelId, setSelectedModelId] = useState<number | undefined>(undefined);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getToolHistory(toolId);
        setHistory(data);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    loadHistory();
  }, [toolId]);

  const loadHistory = async () => {
    try {
      const data = await getToolHistory(toolId);
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setCurrentHistoryId(undefined);

    try {
      const result = await executeTool(toolId, inputs, selectedProviderId, selectedModelId);

      if (result.success && result.data) {
        setResults(result.data);
        await loadHistory(); // Refresh history to show new item
        // Optionally select the new item (it's the first one)
        const newHistory = await getToolHistory(toolId);
        if (newHistory.length > 0) {
          setCurrentHistoryId(newHistory[0].id);
        }
      } else {
        setError(result.error || "Unknown error occurred");
      }
    } catch (err) {
      setError("Failed to execute tool");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: ToolHistoryItem) => {
    setInputs(item.inputs);
    setResults(item.outputs);
    setCurrentHistoryId(item.id);
    setSelectedProviderId(item.providerId);
    setSelectedModelId(item.modelId);
    setError(null);

    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteHistory = async (id: string) => {
    if (confirm("确定要删除这条记录吗？")) {
      await deleteToolHistory(id);
      await loadHistory();
      if (currentHistoryId === id) {
        setCurrentHistoryId(undefined);
        setResults([]);
      }
    }
  };

  const handleClearHistory = async () => {
    await clearToolHistory(toolId);
    await loadHistory();
    setCurrentHistoryId(undefined);
    setResults([]);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="space-y-8 min-w-0">
        <DynamicForm
          schema={config.inputSchema}
          values={inputs}
          onChange={setInputs}
          onSubmit={handleExecute}
          isLoading={isLoading}
          selectedProviderId={selectedProviderId}
          selectedModelId={selectedModelId}
          onSelectModel={(pid, mid) => {
            setSelectedProviderId(pid);
            setSelectedModelId(mid);
          }}
        />

        {error && <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="space-y-4">
          <AutoTransition as="div" className="flex items-center justify-between relative">
            <h2 className="text-lg font-semibold">生成结果</h2>
            {results.length > 0 && <span className="text-sm text-muted-foreground">{results.length} 个结果</span>}
          </AutoTransition>
          <DynamicResult schema={config.outputSchema} results={results} isLoading={isLoading} />
        </div>
      </div>

      <div className="lg:sticky lg:top-20">
        <GenericHistoryList
          history={history}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
          onClear={handleClearHistory}
          currentId={currentHistoryId}
        />
      </div>
    </div>
  );
}
