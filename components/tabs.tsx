"use client";

import { useEventHandler } from "@/hooks/useEventHandler";
import { AutoTransition } from "@codehz/auto-transition";
import clsx from "clsx";
import { Fragment, ReactNode, useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabButtonProps {
  tab: Tab;
  isActive: boolean;
  onClick: (tabId: string) => void;
}

function TabButton({ tab, isActive, onClick }: TabButtonProps) {
  const handleClick = useEventHandler(() => {
    onClick(tab.id);
  });

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "px-3 py-1.5 cursor-pointer transition-all text-sm font-medium rounded-full",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
      )}
    >
      {tab.label}
    </button>
  );
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

  const handleTabClick = useEventHandler((tabId: string) => {
    setActiveTab(tabId);
  });

  return (
    <div className={className}>
      {/* Tab 标签栏 */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={handleTabClick} />
        ))}
      </div>

      {/* Tab 内容区 */}
      <AutoTransition as="div" className="relative">
        <Fragment key={activeTab}>{activeTabContent}</Fragment>
      </AutoTransition>
    </div>
  );
}
