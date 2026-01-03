"use client";

import {
  clearSeedExpansionHistory,
  deleteSeedExpansion,
  expandSeed,
  getSeedExpansionHistory,
  type ExpansionResult,
  type HistoryItem,
} from "@/src/actions/seed-expander";
import { useEffect, useState } from "react";
import { ExpansionResultList } from "./expansion-result";
import { HistoryList } from "./history-list";
import { InputForm } from "./input-form";

export function SeedExpander() {
  const [isLoading, setIsLoading] = useState(false);
  const [idea, setIdea] = useState("");
  const [results, setResults] = useState<ExpansionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | undefined>();
  const [selectedProviderId, setSelectedProviderId] = useState<number | undefined>();
  const [selectedModelId, setSelectedModelId] = useState<number | undefined>();

  // 加载历史记录
  const loadHistory = async () => {
    try {
      const data = await getSeedExpansionHistory();
      setHistory(data);
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleExpand = async (inputIdea: string, providerId?: number, modelId?: number) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setCurrentHistoryId(undefined);

    try {
      const response = await expandSeed(inputIdea, providerId, modelId);
      if (response.success && response.expansions) {
        setResults(response.expansions);
        // 重新加载历史记录以获取最新项
        await loadHistory();
        // 默认选中最新的一项
        const latestHistory = await getSeedExpansionHistory();
        if (latestHistory.length > 0) {
          setCurrentHistoryId(latestHistory[0].id);
        }
      } else {
        setError(response.error || "生成失败，请稍后重试。");
      }
    } catch {
      setError("发生意外错误，请检查网络连接。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectModel = (providerId: number, modelId: number) => {
    setSelectedProviderId(providerId);
    setSelectedModelId(modelId);
  };

  const handleClearModel = () => {
    setSelectedProviderId(undefined);
    setSelectedModelId(undefined);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setIdea(item.seed);
    setResults(item.results);
    setCurrentHistoryId(item.id);
    setSelectedProviderId(item.providerId);
    setSelectedModelId(item.modelId);
    setError(null);
    // 滚动到结果区域
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteSeedExpansion(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (currentHistoryId === id) {
        setResults([]);
        setCurrentHistoryId(undefined);
        setSelectedProviderId(undefined);
        setSelectedModelId(undefined);
      }
    } catch (e) {
      console.error("Failed to delete history", e);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearSeedExpansionHistory();
      setHistory([]);
      setResults([]);
      setCurrentHistoryId(undefined);
      setSelectedProviderId(undefined);
      setSelectedModelId(undefined);
    } catch (e) {
      console.error("Failed to clear history", e);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-12">
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <InputForm
            value={idea}
            onChange={setIdea}
            onExpand={handleExpand}
            isLoading={isLoading}
            selectedProviderId={selectedProviderId}
            selectedModelId={selectedModelId}
            onSelectModel={handleSelectModel}
            onClearModel={handleClearModel}
          />
        </section>

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {(results.length > 0 || isLoading) && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">扩展结果</h2>
              <span className="text-sm text-muted-foreground">
                {isLoading ? "正在生成中..." : `共生成 ${results.length} 个灵感`}
              </span>
            </div>
            <ExpansionResultList results={results} isLoading={isLoading} />
          </section>
        )}
      </div>

      <aside className="space-y-6 min-w-0">
        <HistoryList
          history={history}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
          onClear={handleClearHistory}
          currentId={currentHistoryId}
        />
      </aside>
    </div>
  );
}
