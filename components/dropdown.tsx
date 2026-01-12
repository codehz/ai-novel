/* eslint-disable react-hooks/refs */
"use client";

import { Slot } from "@radix-ui/react-slot";
import { createContext, useCallback, useContext, useRef, type ReactElement, type ReactNode } from "react";

const DropdownContext = createContext<{ close: () => void } | null>(null);

export function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdown must be used within a Dropdown");
  }
  return context;
}

interface DropdownProps {
  children: ReactElement;
  content: ReactNode | ((props: { close: () => void }) => ReactNode);
  className?: string;
  span?: "left" | "right";
  /**
   * 是否让弹出框宽度等于锚点（触发按钮）的宽度
   * - true: 应用 w-anchor 类，弹出框宽度等于锚点宽度（默认，保持向后兼容）
   * - false: 弹出框宽度由内容决定，不受锚点宽度限制
   */
  matchAnchorWidth?: boolean;
}

/**
 * 通用下拉组件，封装了原生 popover API 的逻辑
 *
 * 使用方式：
 * <Dropdown content={({ close }) => <div onClick={close}>下拉内容</div>}>
 *   <button>点击展开</button>
 * </Dropdown>
 */
export function Dropdown({ children, content, className, span = "left", matchAnchorWidth = true }: DropdownProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const close = useCallback(() => {
    if (popoverRef.current) {
      popoverRef.current.hidePopover();
    }
  }, []);

  const handleTriggerClick = useCallback(() => {
    if (popoverRef.current) {
      // @ts-expect-error: showPopover 方法的 source 属性未在类型定义中声明
      popoverRef.current.showPopover({ source: triggerRef.current! });
    }
  }, []);

  // 根据 span 选择对应的 Tailwind 类
  const positionAreaClass = {
    left: "anchored-bottom-span-left",
    right: "anchored-bottom-span-right",
  }[span];
  // 根据 matchAnchorWidth 决定是否应用 w-anchor 类
  const widthClass = matchAnchorWidth ? "w-anchor" : "";

  return (
    <DropdownContext.Provider value={{ close }}>
      <Slot ref={triggerRef} onClick={handleTriggerClick}>
        {children}
      </Slot>
      <div
        ref={popoverRef}
        popover="auto"
        className={`
          ${positionAreaClass} my-2 ${widthClass} try-flip-y
          max-h-2/3 overflow-y-auto
          bg-card border border-border rounded-lg shadow-lg
          starting:opacity-0 starting:scale-95 starting:duration-100
          not-popover-open:opacity-0 not-popover-open:scale-95
          transition-all duration-200 ease-out
          transition-discrete
          ${className || ""}
        `}
      >
        {typeof content === "function" ? content({ close }) : content}
      </div>
    </DropdownContext.Provider>
  );
}
