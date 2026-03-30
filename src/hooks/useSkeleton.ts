/**
 * ============================================================
 * useSkeleton Hook - 骨架屏加载状态管理
 * 配合 SkeletonLoader 组件使用
 * ============================================================
 */

import { useState, useEffect } from 'react';

interface UseSkeletonOptions {
  /** 骨架屏展示的最短时间（ms），避免闪烁 */
  minDuration?: number;
  /** 是否启用骨架屏 */
  enabled?: boolean;
}

interface UseSkeletonReturn {
  /** 是否显示骨架屏 */
  isLoading: boolean;
  /** 强制隐藏骨架屏 */
  stopLoading: () => void;
}

/**
 * 管理骨架屏加载状态
 * @param promise - 返回 Promise 的异步函数
 * @param options - 配置选项
 */
export function useAsyncSkeleton<T>(
  asyncFn: () => Promise<T>,
  options: UseSkeletonOptions = {}
): UseSkeletonReturn & { data: T | null; error: Error | null } {
  const { minDuration = 300, enabled = true } = options;
  const [isLoading, setIsLoading] = useState(enabled);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  async function execute() {
    const start = Date.now();
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        setData(result);
        setIsLoading(false);
      }, remaining);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  }

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopLoading() {
    setIsLoading(false);
  }

  return { isLoading, data, error, stopLoading };
}

/**
 * 简单的延时骨架屏（用于演示）
 */
export function useSkeletonDelay(ms = 1000): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
