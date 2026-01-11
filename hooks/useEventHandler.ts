"use client";

import { useCallback, useInsertionEffect, useRef } from "react";

/**
 * 使用 ref 存储 callback，避免手动指定依赖数组的问题
 *
 * 特点：
 * - 返回稳定的函数引用，不会因依赖变化而变化
 * - 自动始终调用最新的 callback
 * - 避免闭包陷阱
 *
 * @param callback 要包装的事件处理函数
 * @returns 稳定的事件处理函数
 *
 * @example
 * ```tsx
 * function MyComponent({ onClick }) {
 *   const handleClick = useEventHandler((event) => {
 *     console.log('Clicked:', event);
 *     onClick?.(event);
 *   });
 *
 *   return <button onClick={handleClick}>点击</button>;
 * }
 * ```
 */
export function useEventHandler<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
): (...args: Parameters<T>) => ReturnType<T> {
  const callbackRef = useRef(callback);

  useInsertionEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []);
}
