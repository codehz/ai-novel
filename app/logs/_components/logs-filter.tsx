"use client";

import { Dropdown } from "@/components/dropdown";
import { useEventHandler } from "@/hooks/useEventHandler";
import { getDistinctCallReasons } from "@/src/actions/models";
import clsx from "clsx";
import { ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LogsFilterProps {
  selectedCallReason?: string;
}

function FilterOption({
  label,
  isSelected,
  callReason,
  onSelect,
  close,
}: {
  label: string;
  isSelected: boolean;
  callReason: string | null;
  onSelect: (reason: string | null) => void;
  close: () => void;
}) {
  const handleClick = useEventHandler(() => {
    onSelect(callReason);
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

export function LogsFilter({ selectedCallReason }: LogsFilterProps) {
  const router = useRouter();
  const [reasons, setReasons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReasons = async () => {
      try {
        const data = await getDistinctCallReasons();
        setReasons(data);
      } catch (error) {
        console.error("Failed to load call reasons:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReasons();
  }, []);

  const handleSelect = (callReason: string | null) => {
    if (callReason) {
      router.push(`/logs?callReason=${encodeURIComponent(callReason)}`);
    } else {
      router.push("/logs");
    }
  };

  return (
    <Dropdown
      content={({ close }) => (
        <div>
          <FilterOption
            label="全部日志"
            isSelected={!selectedCallReason}
            callReason={null}
            onSelect={handleSelect}
            close={close}
          />

          {isLoading ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              加载中...
            </div>
          ) : reasons.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">暂无 callReason</div>
          ) : (
            reasons.map((reason) => (
              <FilterOption
                key={reason}
                label={reason}
                isSelected={selectedCallReason === reason}
                callReason={reason}
                onSelect={handleSelect}
                close={close}
              />
            ))
          )}
        </div>
      )}
    >
      <button className="flex w-full justify-between items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors font-medium text-sm">
        <span className="truncate min-w-0">
          {selectedCallReason ? `筛选: ${selectedCallReason}` : "筛选 callReason"}
        </span>
        <ChevronDown className="w-4 h-4 shrink-0" />
      </button>
    </Dropdown>
  );
}
