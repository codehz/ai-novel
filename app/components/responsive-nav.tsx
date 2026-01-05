"use client";

import { Dropdown } from "@/components/dropdown";
import { Menu } from "lucide-react";

interface ResponsiveNavProps {
  children: React.ReactNode;
}

/**
 * 响应式导航容器组件
 * - 桌面版（md 以上）：横向导航链接
 * - 移动版（md 以下）：汉堡菜单
 */
export function ResponsiveNav({ children }: ResponsiveNavProps) {
  return (
    <>
      {/* 桌面版导航 */}
      <nav className="hidden md:flex items-center gap-6">{children}</nav>

      {/* 移动版菜单 */}
      <div className="md:hidden">
        <Dropdown
          matchAnchorWidth={false}
          content={({ close }) => (
            <div className="flex flex-col gap-2 py-2" onClick={() => close()}>
              {children}
            </div>
          )}
        >
          <button className="p-2 hover:bg-muted rounded-md transition-colors">
            <Menu size={20} className="text-foreground" />
          </button>
        </Dropdown>
      </div>
    </>
  );
}
