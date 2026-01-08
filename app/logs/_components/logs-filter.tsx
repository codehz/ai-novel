"use client";

import { Button } from "@/components/button";
import { Dropdown } from "@/components/dropdown";
import { getDistinctCallReasons } from "@/src/actions/models";
import { ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LogsFilterProps {
  selectedCallReason?: string;
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
          <button
            onClick={() => {
              handleSelect(null);
              close();
            }}
            className={`w-full text-left px-4 py-2 hover:bg-muted transition-colors ${
              !selectedCallReason ? "bg-primary/10 font-medium" : ""
            }`}
          >
            全部日志
          </button>

          {isLoading ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              加载中...
            </div>
          ) : reasons.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">暂无 callReason</div>
          ) : (
            reasons.map((reason) => (
              <button
                key={reason}
                onClick={() => {
                  handleSelect(reason);
                  close();
                }}
                className={`w-full text-left px-4 py-2 hover:bg-muted transition-colors border-t border-border ${
                  selectedCallReason === reason ? "bg-primary/10 font-medium" : ""
                }`}
              >
                <p className="text-sm truncate">{reason}</p>
              </button>
            ))
          )}
        </div>
      )}
    >
      <Button variant="outline" className="flex w-full justify-between items-center gap-2 px-4 font-medium text-sm">
        <span className="truncate min-w-0">
          {selectedCallReason ? `筛选: ${selectedCallReason}` : "筛选 callReason"}
        </span>
        <ChevronDown className="w-4 h-4 shrink-0" />
      </Button>
    </Dropdown>
  );
}
