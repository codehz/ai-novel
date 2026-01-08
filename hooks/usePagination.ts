import { useCallback, useEffect, useReducer, useTransition } from "react";

interface UsePaginationOptions<T> {
  /** 初始数据列表 */
  initialItems: T[];
  /** 初始光标 */
  initialCursor: string | null;
  /** 是否有更多数据 */
  initialHasMore: boolean;
  /** 加载更多的回调函数 */
  onLoadMore: (cursor: string) => Promise<{
    data: T[];
    cursor: string | null;
    hasMore: boolean;
  }>;
}

interface PaginationState<T> {
  items: T[];
  cursor: string | null;
  hasMore: boolean;
}

type PaginationAction<T> =
  | { type: "RESET"; payload: { items: T[]; cursor: string | null; hasMore: boolean } }
  | { type: "LOAD_MORE"; payload: { items: T[]; cursor: string | null; hasMore: boolean } };

function createPaginationReducer<T>() {
  return function paginationReducer(state: PaginationState<T>, action: PaginationAction<T>): PaginationState<T> {
    switch (action.type) {
      case "RESET":
        return {
          items: action.payload.items,
          cursor: action.payload.cursor,
          hasMore: action.payload.hasMore,
        };
      case "LOAD_MORE":
        return {
          items: [...state.items, ...action.payload.items],
          cursor: action.payload.cursor,
          hasMore: action.payload.hasMore,
        };
      default:
        return state;
    }
  };
}

export interface UsePaginationReturn<T> {
  /** 当前所有项目 */
  items: T[];
  /** 当前光标 */
  cursor: string | null;
  /** 是否有更多数据 */
  hasMore: boolean;
  /** 是否正在加载 */
  isPending: boolean;
  /** 加载更多 */
  loadMore: () => void;
  /** 重置分页状态 */
  reset: (items: T[], cursor: string | null, hasMore: boolean) => void;
}

/**
 * 通用分页 Hook
 *
 * @example
 * const { items, hasMore, isPending, loadMore } = usePagination({
 *   initialItems: runs,
 *   initialCursor: cursor,
 *   initialHasMore: hasMore,
 *   onLoadMore: async (cursor) => {
 *     const result = await loadMoreWorkflowRuns(cursor, selectedStatus);
 *     return result;
 *   },
 * });
 */
export function usePagination<T>(options: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const { initialItems, initialCursor, initialHasMore, onLoadMore } = options;
  const [isPending, startTransition] = useTransition();

  const paginationReducer = createPaginationReducer<T>();

  const [state, dispatch] = useReducer(paginationReducer, {
    items: initialItems,
    cursor: initialCursor,
    hasMore: initialHasMore,
  });

  // 监听外部 props 变化，重置列表状态
  useEffect(() => {
    dispatch({
      type: "RESET",
      payload: {
        items: initialItems,
        cursor: initialCursor,
        hasMore: initialHasMore,
      },
    });
  }, [initialItems, initialCursor, initialHasMore]);

  const loadMore = useCallback(() => {
    if (!state.cursor || !state.hasMore) return;

    startTransition(async () => {
      try {
        const result = await onLoadMore(state.cursor!);
        dispatch({
          type: "LOAD_MORE",
          payload: {
            items: result.data,
            cursor: result.cursor,
            hasMore: result.hasMore,
          },
        });
      } catch (error) {
        console.error("加载更多失败:", error);
        // 加载失败时保留现有数据，不清空
      }
    });
  }, [state.cursor, state.hasMore, onLoadMore, startTransition]);

  const reset = useCallback((items: T[], cursor: string | null, hasMore: boolean) => {
    dispatch({
      type: "RESET",
      payload: { items, cursor, hasMore },
    });
  }, []);

  return {
    items: state.items,
    cursor: state.cursor,
    hasMore: state.hasMore,
    isPending,
    loadMore,
    reset,
  };
}
