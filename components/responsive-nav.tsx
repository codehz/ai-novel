"use client";

import { Dropdown } from "@/components/dropdown";
import { ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { DetailsCard } from "./details-card";

export interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
}

interface ResponsiveNavProps {
  items: NavItem[];
}

/**
 * 响应式导航容器组件
 * - 桌面版（md 以上）：横向导航链接，支持下拉子菜单
 * - 移动版（md 以下）：汉堡菜单，支持展开/折叠子菜单
 */
export function ResponsiveNav({ items }: ResponsiveNavProps) {
  return (
    <>
      {/* 桌面版导航 */}
      <nav className="hidden md:flex items-center gap-6">
        {items.map((item, index) => (
          <DesktopNavItem key={index} item={item} />
        ))}
      </nav>

      {/* 移动版菜单 */}
      <div className="md:hidden">
        <Dropdown
          matchAnchorWidth={false}
          content={({ close }) => (
            <div className="flex flex-col gap-2 py-2">
              {items.map((item, index) => (
                <MobileNavItem key={index} item={item} onClose={close} />
              ))}
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

/**
 * 桌面版导航项
 * 如果有子菜单，使用 Dropdown 组件展示
 */
function DesktopNavItem({ item }: { item: NavItem }) {
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={item.href || "#"}
        className="text-sm font-medium hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-muted md:hover:bg-transparent"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <Dropdown
      matchAnchorWidth={false}
      content={({ close }) => (
        <div className="flex flex-col">
          {item.children!.map((child, index) => (
            <Link
              key={index}
              href={child.href || "#"}
              onClick={close}
              className="text-sm font-medium hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-muted block"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    >
      <button className="text-sm font-medium hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-muted inline-flex items-center gap-1">
        {item.label}
        <ChevronDown size={16} />
      </button>
    </Dropdown>
  );
}

/**
 * 移动版导航项
 * 支持展开/折叠子菜单
 */
function MobileNavItem({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={item.href || "#"}
        className="text-sm font-medium hover:text-primary transition-colors px-3 py-1 rounded-md hover:bg-muted block"
        onClick={onClose}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="px-3 -mt-1">
      <DetailsCard label={item.label} variant="minimal">
        <div className="flex flex-col gap-1">
          {item.children!.map((child, index) => (
            <Link
              key={index}
              href={child.href || "#"}
              className="text-sm font-medium hover:text-primary transition-colors py-1 rounded-md hover:bg-muted block"
              onClick={onClose}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </DetailsCard>
    </div>
  );
}
