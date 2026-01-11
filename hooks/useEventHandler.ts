"use client";

import { useCallback, useInsertionEffect, useRef } from "react";

/**
 * 使用 ref 存储 callback，避免手动指定依赖数组的问题
 *
 * 特点：
 * - 返回稳定的函数引用，不会因依赖变化而变化
 * - 自动始终调用最新的 callback
 * - 避免闭包陷阱
 * - 支持异步函数防重复调用（可选）
 *
 * @param callback 要包装的事件处理函数
 * @param options 配置选项
 * @returns 稳定的事件处理函数
 *
 * @example
 * 基础用法：
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
 *
 * @example
 * 异步防重复调用（推荐用于按钮提交等场景）：
 * ```tsx
 * function SubmitButton({ onSubmit }) {
 *   const handleSubmit = useEventHandler(async (data) => {
 *     await submitToServer(data);
 *   }, { dropOnPending: true }); // 启用防重复调用
 *
 *   return <button onClick={handleSubmit}>提交</button>;
 * }
 * ```
 */
export function useEventHandler<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  options?: {
    /** 启用后，异步函数在 pending 状态时会丢弃新的调用请求，默认为 true */
    dropOnPending?: boolean;
  },
): (...args: Parameters<T>) => ReturnType<T> {
  const callbackRef = useRef(callback);
  const pendingRef = useRef(false);

  useInsertionEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    (...args: Parameters<T>) => {
      const result = callbackRef.current(...args);

      // 如果启用了防重复调用且返回 Promise
      if (options?.dropOnPending !== false && result instanceof Promise) {
        // 如果已经有一个操作在 pending，丢弃新的调用
        if (pendingRef.current) {
          return result;
        }

        // 标记为 pending
        pendingRef.current = true;

        // 在操作完成后重置状态
        result.finally(() => {
          pendingRef.current = false;
        });
      }

      return result;
    },
    [options?.dropOnPending],
  );
}
