"use client";

import clsx from "clsx";
import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const initialTab = defaultTab || tabs[0]?.id;
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={clsx("border border-border rounded-lg overflow-hidden", className)}>
      {/* Tab 标签栏 */}
      <div className="flex bg-muted border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-4 py-2 cursor-pointer transition-colors text-sm font-medium",
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary -mb-1 pb-1"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 内容区 */}
      <div className="p-6">{activeTabContent}</div>
    </div>
  );
}
