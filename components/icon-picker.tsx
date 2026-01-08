"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Dropdown } from "./dropdown";
import { Icon } from "./icon";

// 常用的 Lucide 图标列表
const COMMON_ICONS = [
  "Sparkles",
  "BookOpen",
  "PenTool",
  "Zap",
  "Star",
  "Heart",
  "Brain",
  "Lightbulb",
  "Rocket",
  "Target",
  "Compass",
  "Map",
  "TreePine",
  "Wind",
  "Cloud",
  "Sun",
  "Moon",
  "Lock",
  "Unlock",
  "Key",
  "Shield",
  "Sword",
  "Wand2",
  "Microscope",
  "Telescope",
  "RefreshCw",
  "TrendingUp",
  "BarChart3",
  "PieChart",
  "Database",
  "Server",
  "Code",
  "Terminal",
  "GitBranch",
  "GitMerge",
  "GitCommit",
  "Copy",
  "Download",
  "Upload",
  "Share2",
  "Send",
  "Mail",
  "MessageCircle",
  "Phone",
  "Video",
  "Camera",
  "Image",
  "FileText",
  "File",
  "Folder",
  "Home",
  "Settings",
  "Tool",
  "Wrench",
  "Hammer",
  "Layers",
  "List",
  "Grid",
  "Square",
  "Circle",
  "Triangle",
  "Diamond",
  "Package",
  "Gift",
  "Briefcase",
  "Wallet",
  "CreditCard",
  "DollarSign",
  "TrendingDown",
  "AlertCircle",
  "CheckCircle",
  "XCircle",
  "Info",
  "HelpCircle",
  "Clock",
  "Watch",
  "Calendar",
  "MapPin",
  "Navigation",
];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, disabled = false }: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIcons = COMMON_ICONS.filter((icon) => icon.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Dropdown
      content={({ close }) => (
        <div className="p-4 bg-background border border-input rounded-lg shadow-lg z-50">
          {/* 搜索框 */}
          <div className="mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索图标..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-2 py-1 rounded border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* 图标网格 */}
          <div className="grid grid-cols-6 gap-2 max-h-80 overflow-y-auto">
            {filteredIcons.length > 0 ? (
              filteredIcons.map((iconName) => (
                <button
                  key={iconName}
                  onClick={() => {
                    onChange(iconName);
                    setSearchQuery("");
                    close();
                  }}
                  className={`p-3 rounded-lg border-2 transition-all hover:bg-primary/10 ${
                    value === iconName ? "border-primary bg-primary/10" : "border-transparent"
                  }`}
                  title={iconName}
                  type="button"
                >
                  <Icon iconName={iconName} className="w-5 h-5 mx-auto text-foreground" />
                </button>
              ))
            ) : (
              <div className="col-span-6 text-center py-8 text-sm text-muted-foreground">未找到匹配的图标</div>
            )}
          </div>
        </div>
      )}
    >
      <button
        type="button"
        disabled={disabled}
        className="w-full transition-all px-4 py-2 rounded-lg border border-input-border bg-input flex items-center gap-2 hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
      >
        <Icon iconName={value} className="w-4 h-4 shrink-0 text-foreground" />
        <span className="text-sm text-foreground flex-1 text-left">{value || "选择图标"}</span>
        <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </Dropdown>
  );
}
