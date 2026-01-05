"use client";

import React, { createContext, useCallback, useContext, useId, type ReactElement, type ReactNode } from "react";

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
  id?: string;
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
export function Dropdown({ children, content, className, id, span = "left", matchAnchorWidth = true }: DropdownProps) {
  const internalId = useId();
  const popoverId = id || internalId;

  const close = useCallback(() => {
    const popoverElement = document.getElementById(popoverId);
    if (popoverElement && "hidePopover" in popoverElement) {
      popoverElement.hidePopover();
    }
  }, [popoverId]);

  // 为子元素（触发器）注入 popoverTarget 属性
  const trigger = React.cloneElement(children, {
    popoverTarget: popoverId,
  } as React.HTMLAttributes<HTMLElement>);

  // 根据 span 选择对应的 Tailwind 类
  const positionAreaClass = {
    left: "anchored-bottom-span-left",
    right: "anchored-bottom-span-right",
  }[span];
  // 根据 matchAnchorWidth 决定是否应用 w-anchor 类
  const widthClass = matchAnchorWidth ? "w-anchor" : "";

  return (
    <DropdownContext.Provider value={{ close }}>
      {trigger}
      <div
        id={popoverId}
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
