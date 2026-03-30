/**
 * ============================================================
 * Uiverse-Inspired StatusBadge Component for AICFO
 * 基于 Uiverse 设计灵感的微信风格状态标签
 *
 * 设计特点：
 * - Uiverse 风格的精致边框 + 柔和背景
 * - 清晰的色彩语义（成功/警告/错误/信息）
 * - 支持 Dot 点缀（在线状态、活动状态）
 * ============================================================
 */

import React from 'react';

// ============================================================
// 状态配置
// ============================================================
type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';

interface BadgeConfig {
  bg: string;
  color: string;
  border: string;
  dot?: string;
}

const BADGE_CONFIGS: Record<BadgeVariant, BadgeConfig> = {
  success: { bg: '#E8F5E9', color: '#2E7D32', border: '#C8E6C9', dot: '#4CAF50' },
  warning: { bg: '#FFF3E0', color: '#E65100', border: '#FFE0B2', dot: '#FF9800' },
  error:   { bg: '#FFEBEE', color: '#C62828', border: '#FFCDD2', dot: '#EF5350' },
  info:    { bg: '#E3F2FD', color: '#1565C0', border: '#BBDEFB', dot: '#2196F3' },
  neutral: { bg: '#F5F5F5', color: '#616161', border: '#E0E0E0', dot: '#9E9E9E' },
  purple:  { bg: '#F3E5F5', color: '#6A1B9A', border: '#E1BEE7', dot: '#9C27B0' },
};

// ============================================================
// StatusBadge 主体
// ============================================================
interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function StatusBadge({
  label,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  icon,
  className = '',
}: StatusBadgeProps) {
  const cfg = BADGE_CONFIGS[variant];
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium select-none ${className}`}
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: isSm ? '12px' : '14px',
        padding: isSm ? '2px 8px' : '4px 12px',
        fontSize: isSm ? '11px' : '13px',
        lineHeight: 1.4,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      {dot && (
        <span
          className="rounded-full"
          style={{
            width: isSm ? 5 : 6,
            height: isSm ? 5 : 6,
            backgroundColor: cfg.dot,
            boxShadow: `0 0 4px ${cfg.dot}`,
          }}
        />
      )}
      {icon && <span className="flex items-center">{icon}</span>}
      {label}
    </span>
  );
}

// ============================================================
// 凭证状态专用 Badge（预设颜色）
// ============================================================
export function VoucherStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    '已入账': 'success',
    '待审核': 'warning',
    '草稿': 'neutral',
    '已作废': 'error',
  };

  const iconMap: Record<string, React.ReactNode> = {
    '已入账': (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    '待审核': (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    '草稿': (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    '已作废': (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  };

  return (
    <StatusBadge
      label={status}
      variant={variantMap[status] || 'neutral'}
      size="sm"
      dot={status === '已入账' || status === '待审核'}
      icon={iconMap[status]}
    />
  );
}

// ============================================================
// 分类标签 (CategoryTag)
// 适合：发票类型、交易分类等
// ============================================================
interface CategoryTagProps {
  label: string;
  color?: string;
  bgColor?: string;
  onClick?: () => void;
}

export function CategoryTag({
  label,
  color = '#07C160',
  bgColor = '#F0F9F0',
  onClick,
}: CategoryTagProps) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-lg ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      style={{
        backgroundColor: bgColor,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </span>
  );
}

// ============================================================
// 数字徽章 (CounterBadge)
// 适合：未读数量、统计数字
// ============================================================
interface CounterBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeVariant;
  className?: string;
}

export function CounterBadge({ count, max = 99, variant = 'error', className = '' }: CounterBadgeProps) {
  if (count <= 0) return null;

  const cfg = BADGE_CONFIGS[variant];
  const display = count > max ? `${max}+` : count.toString();
  const isDot = count === 1;

  return (
    <span
      className={`inline-flex items-center justify-center font-bold text-white ${className}`}
      style={{
        backgroundColor: cfg.dot || cfg.color,
        color: '#FFFFFF',
        borderRadius: isDot ? '50%' : '10px',
        minWidth: isDot ? 8 : 16,
        height: isDot ? 8 : 16,
        padding: isDot ? 0 : '0 4px',
        fontSize: isDot ? 0 : '10px',
        lineHeight: 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
    >
      {isDot ? '' : display}
    </span>
  );
}

// ============================================================
// 统一导出
// ============================================================
export const AICFOBadge = {
  Status: StatusBadge,
  Voucher: VoucherStatusBadge,
  Category: CategoryTag,
  Counter: CounterBadge,
};
