/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useConfirm } from "@/hooks/useConfirm";
import { ToolConfig, ToolHistoryItem } from "@/shared/tool-types";
import { clearToolHistory, deleteToolHistory, getToolHistory } from "@/src/actions/tools";
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
  const [inputs, setInputs] = useState<Record<string, any>>(() => {
    const initialInputs: Record<string, any> = {};
    config.inputSchema.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initialInputs[field.name] = field.defaultValue;
      }
    });
    return initialInputs;
  });
  const [results, setResults] = useState<any>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ToolHistoryItem[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<number | undefined>(undefined);
  const [selectedModelId, setSelectedModelId] = useState<number | undefined>(undefined);
  const confirm = useConfirm();

  // Initialize inputs with default values when config changes
  useEffect(() => {
    const initialInputs: Record<string, any> = {};
    config.inputSchema.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initialInputs[field.name] = field.defaultValue;
      }
    });
    setInputs(initialInputs);
  }, [toolId, config.inputSchema.fields]);

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
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          if (trimmedLine.startsWith("data: ")) {
            try {
              const chunk = JSON.parse(trimmedLine.substring(6));
              if (chunk.type === "item") {
                setResults((prev: any) => {
                  if (Array.isArray(prev)) {
                    return [...prev, chunk.data];
                  }
                  return [chunk.data];
                });
              } else if (chunk.type === "error") {
                setError(chunk.error);
              } else if (chunk.type === "complete") {
                await loadHistory();
                const newHistory = await getToolHistory(toolId);
                if (newHistory.length > 0) {
                  setCurrentHistoryId(newHistory[0].id);
                }
              }
            } catch (e) {
              console.error("Failed to parse chunk", trimmedLine, e);
            }
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

  const handleSelectHistory = (item: ToolHistoryItem) => {
    setInputs(item.inputs);
    setResults(item.outputs);
    setCurrentHistoryId(item.id);
    setSelectedModelId(item.modelId);
    setError(null);

    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteHistory = async (id: number) => {
    if (await confirm("确定要删除这条记录吗？")) {
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
          selectedModelId={selectedModelId}
          onSelectModel={(mid) => {
            setSelectedModelId(mid);
          }}
        />

        {error && <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="space-y-4">
          <AutoTransition as="div" className="flex items-center justify-between relative">
            <h2 className="text-lg font-semibold">生成结果</h2>
            {results && (Array.isArray(results) ? results.length > 0 : true) && (
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
