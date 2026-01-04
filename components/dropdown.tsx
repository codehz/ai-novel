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
}

/**
 * 通用下拉组件，封装了原生 popover API 的逻辑
 *
 * 使用方式：
 * <Dropdown content={({ close }) => <div onClick={close}>下拉内容</div>}>
 *   <button>点击展开</button>
 * </Dropdown>
 */
export function Dropdown({ children, content, className, id }: DropdownProps) {
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

  return (
    <DropdownContext.Provider value={{ close }}>
      {trigger}
      <div
        id={popoverId}
        popover="auto"
        className={`
          anchored-bottom-span-left my-2 w-anchor try-flip-y
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
