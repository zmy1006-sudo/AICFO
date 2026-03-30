/**
 * ============================================================
 * Uiverse-Inspired Button Components for AICFO
 * 基于 Uiverse 设计的微信风格按钮组件
 *
 * 设计原则：
 * - 微信绿 #07C160 为主色
 * - 适度动画，不过度炫酷
 * - 触感反馈：hover/active/disabled 状态清晰
 * ============================================================
 */

import React from 'react';

// ============================================================
// 1. Neumorphic 主 CTA 按钮 (Primary CTA)
// 基于 Uiverse soft-gecko-85 风格（Neumorphism）
// 适合：确认入账、主操作按钮
// ============================================================
interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function PrimaryButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className = '',
  ...props
}: PrimaryButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3.5 text-base rounded-xl',
  };

  const variantClasses = {
    primary: 'bg-[#07C160] text-white shadow-[0_4px_14px_rgba(7,193,96,0.35)] hover:shadow-[0_6px_18px_rgba(7,193,96,0.45)] active:shadow-[0_2px_8px_rgba(7,193,96,0.3)]',
    secondary: 'bg-white text-[#07C160] border border-[#07C160]/30 shadow-[2px_2px_6px_rgba(0,0,0,0.06),-1px_-1px_4px_rgba(255,255,255,0.9)] hover:shadow-[3px_3px_8px_rgba(0,0,0,0.08)] active:shadow-[1px_1px_3px_rgba(0,0,0,0.05)]',
    ghost: 'bg-transparent text-[#07C160] hover:bg-[#07C160]/8 active:bg-[#07C160]/12',
  };

  const disabledClasses = 'opacity-40 cursor-not-allowed pointer-events-none';

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-1.5 font-semibold
        transition-all duration-200 ease-out select-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${(disabled || loading) ? disabledClasses : ''}
        ${className}
      `}
      style={{ fontFamily: 'inherit' }}
    >
      {loading ? (
        <span className="inline-flex gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
        </span>
      ) : icon ? (
        <span className="flex items-center gap-1.5">{icon}{children}</span>
      ) : (
        children
      )}
    </button>
  );
}

// ============================================================
// 2. WeChat 风格圆形发送按钮
// 适合：Chat.tsx 发送按钮
// ============================================================
interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: number;
}

export function SendButton({ onClick, disabled = false, loading = false, size = 44 }: SendButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        rounded-full flex items-center justify-center shrink-0
        transition-all duration-200 ease-out
        active:scale-90
        ${disabled || loading
          ? 'cursor-not-allowed'
          : 'cursor-pointer hover:shadow-[0_4px_16px_rgba(7,193,96,0.4)] active:shadow-[0_2px_8px_rgba(7,193,96,0.3)]'
        }
      `}
      style={{
        width: size,
        height: size,
        backgroundColor: disabled || loading ? '#CCCCCC' : '#07C160',
        boxShadow: disabled || loading
          ? 'none'
          : '0 4px 14px rgba(7,193,96,0.35), 0 2px 6px rgba(7,193,96,0.2)',
        color: '#FFFFFF',
        border: 'none',
      }}
    >
      {loading ? (
        <span className="inline-flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:0ms]" />
          <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:150ms]" />
          <span className="w-1 h-1 rounded-full bg-white animate-bounce [animation-delay:300ms]" />
        </span>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      )}
    </button>
  );
}

// ============================================================
// 3. Icon 按钮 (IconButton)
// 适合：工具栏按钮、小尺寸操作按钮
// ============================================================
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline' | 'ghost';
}

export function IconButton({ icon, size = 'md', variant = 'ghost', className = '', ...props }: IconButtonProps) {
  const sizeMap = { sm: 32, md: 40, lg: 48 };
  const dim = sizeMap[size];

  const variantStyles = {
    filled: { backgroundColor: '#07C160', color: '#FFFFFF', border: 'none' },
    outline: { backgroundColor: 'transparent', color: '#07C160', border: '1.5px solid #07C160' },
    ghost: { backgroundColor: '#F7F7F7', color: '#666666', border: 'none' },
  };

  const s = variantStyles[variant];

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-150 active:scale-90 ${className}`}
      style={{
        width: dim,
        height: dim,
        ...s,
        boxShadow: variant === 'filled' ? '0 2px 8px rgba(7,193,96,0.25)' : 'none',
      }}
    >
      {icon}
    </button>
  );
}

// ============================================================
// 4. 快捷标签按钮 (QuickPromptChip)
// 适合：Chat.tsx 快捷输入标签
// Uiverse 风格：柔和背景 + 圆角胶囊
// ============================================================
interface QuickChipProps {
  emoji: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

export function QuickChip({ emoji, text, onClick, disabled = false }: QuickChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        shrink-0 text-xs rounded-full px-3 py-1.5
        transition-all duration-150 ease-out
        active:scale-95 select-none
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:shadow-[0_2px_8px_rgba(7,193,96,0.2)]'}
      `}
      style={{
        backgroundColor: '#F0F9F0',
        color: '#07C160',
        border: '1px solid #C8E6C9',
      }}
    >
      {emoji} {text.length > 12 ? text.slice(0, 12) + '…' : text}
    </button>
  );
}

// ============================================================
// 5. 统一导出
// ============================================================
export const AICFOButton = {
  Primary: PrimaryButton,
  Send: SendButton,
  Icon: IconButton,
  Chip: QuickChip,
};
