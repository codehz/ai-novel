"use client";

import { Dropdown } from "@/components/dropdown";
import { useEventHandler } from "@/hooks/useEventHandler";
import { getDistinctCallReasons, getDistinctModelNames } from "@/src/actions/models";
import clsx from "clsx";
import { ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LogsFilterProps {
  selectedCallReason?: string;
  selectedModel?: string;
}

function FilterOption({
  label,
  isSelected,
  value,
  onSelect,
  close,
}: {
  label: string;
  isSelected: boolean;
  value: string | null;
  onSelect: (value: string | null) => void;
  close: () => void;
}) {
  const handleClick = useEventHandler(() => {
    onSelect(value);
    close();
  });

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "w-full text-left px-4 py-2 hover:bg-muted transition-colors",
        isSelected && "bg-primary/10 font-medium",
      )}
    >
      <p className="text-sm truncate">{label}</p>
    </button>
  );
}

function FilterDropdown({
  label,
  selectedValue,
  options,
  isLoading,
  placeholder,
  onSelect,
}: {
  label: string;
  selectedValue?: string;
  options: string[];
  isLoading: boolean;
  placeholder: string;
  onSelect: (value: string | null) => void;
}) {
  return (
    <Dropdown
      content={({ close }) => (
        <div>
          <FilterOption label="全部" isSelected={!selectedValue} value={null} onSelect={onSelect} close={close} />

          {isLoading ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              加载中...
            </div>
          ) : options.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">暂无选项</div>
          ) : (
            options.map((option) => (
              <FilterOption
                key={option}
                label={option}
                isSelected={selectedValue === option}
                value={option}
                onSelect={onSelect}
                close={close}
              />
            ))
          )}
        </div>
      )}
    >
      <button className="flex w-full justify-between items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors font-medium text-sm">
        <span className="truncate min-w-0">{selectedValue ? `${label}: ${selectedValue}` : placeholder}</span>
        <ChevronDown className="w-4 h-4 shrink-0" />
      </button>
    </Dropdown>
  );
}

export function LogsFilter({ selectedCallReason, selectedModel }: LogsFilterProps) {
  const router = useRouter();
  const [callReasons, setCallReasons] = useState<string[]>([]);
  const [modelNames, setModelNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reasons, models] = await Promise.all([getDistinctCallReasons(), getDistinctModelNames()]);
        setCallReasons(reasons);
        setModelNames(models);
      } catch (error) {
        console.error("Failed to load filter options:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCallReasonSelect = (callReason: string | null) => {
    const params = new URLSearchParams();
    if (callReason) params.set("callReason", callReason);
    if (selectedModel) params.set("model", selectedModel);
    router.push(`/logs?${params.toString()}`);
  };

  const handleModelSelect = (model: string | null) => {
    const params = new URLSearchParams();
    if (selectedCallReason) params.set("callReason", selectedCallReason);
    if (model) params.set("model", model);
    router.push(`/logs?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <div className="w-48">
        <FilterDropdown
          label="callReason"
          selectedValue={selectedCallReason}
          options={callReasons}
          isLoading={isLoading}
          placeholder="筛选 callReason"
          onSelect={handleCallReasonSelect}
        />
      </div>
      <div className="w-48">
        <FilterDropdown
          label="模型"
          selectedValue={selectedModel}
          options={modelNames}
          isLoading={isLoading}
          placeholder="筛选模型"
          onSelect={handleModelSelect}
        />
      </div>
    </div>
  );
}
