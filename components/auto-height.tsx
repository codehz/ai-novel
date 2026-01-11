"use client";

import { CSSProperties, ComponentPropsWithoutRef, ElementType, ReactNode, useEffect, useRef } from "react";

interface AutoHeightProps<T extends ElementType = "div"> {
  as?: T;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  duration?: number;
}

type ComponentProps<T extends ElementType> = ComponentPropsWithoutRef<T> & AutoHeightProps<T>;

export function AutoHeight<T extends ElementType = "div">({
  as: Component = "div" as T,
  children,
  className = "",
  style = {},
  duration = 300,
  ...rest
}: ComponentProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    // 初始化容器高度
    const updateHeight = () => {
      const height = content.offsetHeight;
      container.style.height = `${height}px`;
    };

    // 使用 ResizeObserver 监听内容高度变化
    resizeObserverRef.current = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserverRef.current.observe(content);
    updateHeight();

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  return (
    // @ts-expect-error: Component is generic
    <Component
      ref={containerRef}
      className={className}
      style={{
        overflow: "hidden",
        transition: `height ${duration}ms ease-in-out`,
        ...style,
      }}
      {...rest}
    >
      <div ref={contentRef}>{children}</div>
    </Component>
  );
}
