/**
 * ============================================================
 * Uiverse-Inspired SkeletonLoader Components for AICFO
 * 基于 Uiverse 设计灵感的骨架屏加载组件
 *
 * 设计特点：
 * - 柔和的渐变闪烁动画
 * - 微信灰色调 #F0F0F0 -> #E8E8E8
 * - 支持：消息行、卡片行、统计卡、表格行
 * ============================================================
 */

import React from 'react';

// ============================================================
// 基础 Skeleton 条
// ============================================================
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 14,
  borderRadius = 8,
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
      }}
    />
  );
}

// ============================================================
// 聊天消息骨架屏（AI + 用户）
// ============================================================
export function ChatMessageSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
          {/* 头像 */}
          <Skeleton width={32} height={32} borderRadius="50%" />
          {/* 内容 */}
          <div className="flex-1 space-y-1.5">
            <Skeleton width="70%" height={12} borderRadius={6} />
            <Skeleton width="90%" height={12} borderRadius={6} />
            <Skeleton width="50%" height={12} borderRadius={6} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 凭证卡片骨架屏
// ============================================================
export function VoucherCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-4"
          style={{
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            border: '1px solid rgba(237,237,237,0.8)',
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <Skeleton width={80} height={10} borderRadius={5} />
            <Skeleton width={48} height={20} borderRadius={10} />
          </div>
          <Skeleton width="65%" height={14} borderRadius={7} className="mb-2" />
          <div className="flex justify-between items-end">
            <Skeleton width={120} height={10} borderRadius={5} />
            <Skeleton width={80} height={18} borderRadius={9} />
          </div>
          <div className="mt-2 pt-2 border-t border-gray-50 space-y-1">
            <div className="flex justify-between">
              <Skeleton width={100} height={10} borderRadius={5} />
              <Skeleton width={60} height={10} borderRadius={5} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 统计卡骨架屏
// ============================================================
export function StatCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={`grid gap-2 ${count === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-3 text-center"
          style={{
            background: 'linear-gradient(135deg, #F7F7F7 0%, #F0F0F0 100%)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <Skeleton width="60%" height={10} borderRadius={5} className="mx-auto mb-2" />
          <Skeleton width="80%" height={18} borderRadius={9} className="mx-auto" />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 表格行骨架屏
// ============================================================
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  const widths = [120, 80, 60, 60]; // px
  return (
    <div
      className="flex items-center py-3 px-4 border-b border-gray-50"
      style={{ gap: widths.map((_, i) => (i === 0 ? 0 : 16)).slice(1).reduce((a, b) => a + b, widths[0] / 2) }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          width={widths[i] || 60}
          height={12}
          borderRadius={6}
        />
      ))}
    </div>
  );
}

// ============================================================
// 全局 CSS Keyframes（需要注入到 index.css）
// ============================================================
export const SKELETON_CSS = `
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.animate-skeleton-pulse {
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}
`;

/**
 * ============================================================
 * 注入 Skeleton CSS 到 document
 * ============================================================
 */
export function injectSkeletonCSS() {
  if (typeof document !== 'undefined') {
    const styleId = 'aicfo-skeleton-css';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = SKELETON_CSS;
      document.head.appendChild(style);
    }
  }
}

// ============================================================
// Spec-aligned named exports (aliases)
// ============================================================
export const SkeletonMessage = ChatMessageSkeleton;
export const SkeletonCard = VoucherCardSkeleton;
export const SkeletonStatCard = StatCardSkeleton;

