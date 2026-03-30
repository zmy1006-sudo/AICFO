/**
 * ============================================================
 * Uiverse-Inspired StatCard Components for AICFO
 * 基于 Uiverse 设计灵感的仪表盘统计卡片
 *
 * 设计特点：
 * - 微信风格配色 + 轻微 neumorphism 阴影
 * - 数据醒目，数字大而清晰
 * - 支持收入/支出/利润三种类型
 * - Uiverse glassmorphism 风格变体
 * ============================================================
 */

import React from 'react';

// ============================================================
// 基础统计卡片
// ============================================================
interface StatCardProps {
  label: string;
  value: string;
  type?: 'income' | 'expense' | 'neutral' | 'profit';
  trend?: {
    value: number;
    positive?: boolean;
  };
  icon?: React.ReactNode;
}

export function StatCard({ label, value, type = 'neutral', trend, icon }: StatCardProps) {
  const configs = {
    income: {
      bg: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
      accent: '#2E7D32',
      labelColor: '#4CAF50',
      iconBg: 'rgba(46,125,50,0.12)',
    },
    expense: {
      bg: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
      accent: '#E65100',
      labelColor: '#FF9800',
      iconBg: 'rgba(230,81,0,0.12)',
    },
    neutral: {
      bg: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
      accent: '#1565C0',
      labelColor: '#1976D2',
      iconBg: 'rgba(21,101,192,0.12)',
    },
    profit: {
      bg: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
      accent: '#6A1B9A',
      labelColor: '#8E24AA',
      iconBg: 'rgba(106,27,154,0.12)',
    },
  };

  const cfg = configs[type];

  return (
    <div
      className="rounded-2xl p-3 text-center relative overflow-hidden"
      style={{
        background: cfg.bg,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
      }}
    >
      {/* 装饰性背景圆 */}
      <div
        className="absolute top-0 right-0 w-12 h-12 rounded-full opacity-10"
        style={{ backgroundColor: cfg.accent, transform: 'translate(30%, -30%)' }}
      />

      <p className="text-[10px] mb-1 font-medium tracking-wide" style={{ color: cfg.labelColor }}>
        {label}
      </p>

      <div className="flex items-center justify-center gap-1">
        {icon && <span style={{ color: cfg.accent, opacity: 0.7 }}>{icon}</span>}
        <p className="text-base font-bold" style={{ color: cfg.accent }}>
          {value}
        </p>
      </div>

      {trend && (
        <p
          className="text-[10px] mt-1 font-medium"
          style={{ color: trend.positive ? '#4CAF50' : '#E53935' }}
        >
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </p>
      )}
    </div>
  );
}

// ============================================================
// Dashboard 三栏统计组（收入/支出/净利润）
// ============================================================
interface StatGroupProps {
  income: { value: string; trend?: number };
  expense: { value: string; trend?: number };
  profit: { value: string; positive?: boolean; trend?: number };
}

export function StatGroup({ income, expense, profit }: StatGroupProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCard
        label="本月收入"
        value={income.value}
        type="income"
        trend={income.trend ? { value: income.trend, positive: true } : undefined}
        icon={
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
          </svg>
        }
      />
      <StatCard
        label="本月支出"
        value={expense.value}
        type="expense"
        trend={expense.trend ? { value: expense.trend, positive: false } : undefined}
        icon={
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 3H9V1H15V3M13 19.93C15.83 19.44 18 16.84 18 13H6C6 16.84 8.17 19.44 11 19.93V23H13V19.93M11 17H13V15H11V17M11 13H13V11H11V13M11 9H13V7H11V9Z"/>
          </svg>
        }
      />
      <StatCard
        label="净利润"
        value={profit.value}
        type={profit.positive === false ? 'expense' : profit.positive === true ? 'income' : 'profit'}
        trend={profit.trend ? { value: profit.trend, positive: profit.positive !== false } : undefined}
      />
    </div>
  );
}

// ============================================================
// 快捷导航按钮组（Dashboard 底部）
// ============================================================
interface QuickNavItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

interface QuickNavBarProps {
  items: QuickNavItem[];
}

export function QuickNavBar({ items }: QuickNavBarProps) {
  return (
    <div className="flex gap-2">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 active:scale-95"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EDEDED',
            color: item.color || '#666666',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// 卡片容器（通用）
// ============================================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  glowColor?: string;
}

export function Card({ children, className = '', style = {}, onClick, glowColor }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 transition-all duration-200 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
      style={{
        border: '1px solid rgba(237,237,237,0.8)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        ...(glowColor ? { boxShadow: `0 2px 12px ${glowColor}20, 0 1px 3px rgba(0,0,0,0.04)` } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
