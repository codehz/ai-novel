/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useConfirm } from "@/hooks/useConfirm";
import { type ToolConfig, type ToolHistoryItem } from "@/shared/tool-types";
import { clearToolHistory, deleteToolHistory, getToolHistory } from "@/src/actions/tools";
import { AutoTransition } from "@codehz/auto-transition";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { DynamicForm } from "./dynamic-form";
import { DynamicResult } from "./dynamic-result";
import { GenericHistoryList } from "./generic-history-list";

interface ToolExecutorProps {
  toolId: string;
  config: ToolConfig;
}

function getInitialInputs(config: ToolConfig): Record<string, any> {
  const initialInputs: Record<string, any> = {};
  config.inputSchema.fields.forEach((field) => {
    if (field.defaultValue !== undefined) {
      initialInputs[field.name] = field.defaultValue;
    }
  });
  return initialInputs;
}

export function ToolExecutor({ toolId, config }: ToolExecutorProps): ReactNode {
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState<Record<string, any>>(() => getInitialInputs(config));
  const [results, setResults] = useState<any>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ToolHistoryItem[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<number>();
  const [selectedModelId, setSelectedModelId] = useState<number>();
  const confirm = useConfirm();

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getToolHistory(toolId);
      setHistory(data);
      return data;
    } catch (err) {
      console.error("Failed to load history", err);
      return [];
    }
  }, [toolId]);

  // Initialize inputs with default values when config changes
  useEffect(() => {
    setInputs(getInitialInputs(config));
  }, [config]);

  // Load history on mount or toolId change
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleExecute = async (): Promise<void> => {
    if (!selectedModelId) {
      setError("请先选择一个模型");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    setCurrentHistoryId(undefined);

    try {
      const response = await fetch("/api/tools/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId,
          inputs,
          modelId: selectedModelId,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

          try {
            const chunk = JSON.parse(trimmedLine.substring(6));
            switch (chunk.type) {
              case "item":
                setResults((prev: any) => (Array.isArray(prev) ? [...prev, chunk.data] : [chunk.data]));
                break;
              case "error":
                setError(chunk.error);
                break;
              case "complete": {
                const updatedHistory = await fetchHistory();
                if (updatedHistory.length > 0) {
                  setCurrentHistoryId(updatedHistory[0].id);
                }
                break;
              }
            }
          } catch (e) {
            console.error("Failed to parse chunk", trimmedLine, e);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute tool");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: ToolHistoryItem): void => {
    setInputs(item.inputs);
    setResults(item.outputs);
    setCurrentHistoryId(item.id);
    setSelectedModelId(item.modelId);
    setError(null);

    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteHistory = async (id: number): Promise<void> => {
    if (await confirm("确定要删除这条记录吗？")) {
      await deleteToolHistory(id);
      await fetchHistory();
      if (currentHistoryId === id) {
        setCurrentHistoryId(undefined);
        setResults([]);
      }
    }
  };

  const handleClearHistory = async (): Promise<void> => {
    if (await confirm("确定要清空所有历史记录吗？")) {
      await clearToolHistory(toolId);
      await fetchHistory();
      setCurrentHistoryId(undefined);
      setResults([]);
    }
  };

  const hasResults = Array.isArray(results) ? results.length > 0 : !!results;

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="space-y-8 min-w-0">
        <DynamicForm
          schema={config.inputSchema}
          values={inputs}
          onChange={setInputs}
          onSubmit={handleExecute}
          isLoading={isLoading}
          selectedModelId={selectedModelId}
          onSelectModel={setSelectedModelId}
        />

        {error && <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">{error}</div>}

        <div className="space-y-4">
          <AutoTransition as="div" className="flex items-center justify-between relative">
            <h2 className="text-lg font-semibold">生成结果</h2>
            {hasResults && (
              <span className="text-sm text-muted-foreground">
                {config.outputSchema.type === "card-list" ? `${results.length} 个结果` : "已生成"}
              </span>
            )}
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
          titleField={config.inputSchema.titleField}
        />
      </div>
    </div>
  );
}
