/**
 * ============================================================
 * Uiverse-Inspired Chat Input Component for AICFO
 * 基于 Uiverse 设计灵感的微信风格聊天输入框
 *
 * 设计特点：
 * - WeChat 原生风格，圆角气泡输入
 * - focus 时：边框变绿 + 微发光效果
 * - 支持多行输入（auto-expand）
 * - Enter 发送，Shift+Enter 换行
 * ============================================================
 */

import React, { useState } from 'react';
import { SendButton } from './Button';

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  maxRows?: number;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  loading = false,
  placeholder = '说说你今天发生了什么…',
  maxRows = 4,
}: ChatInputProps) {
  const [focused, setFocused] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !loading) {
        onSend();
      }
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    // Auto-resize
    const ta = e.target;
    ta.style.height = 'auto';
    const lineHeight = 22;
    const maxH = lineHeight * maxRows + 20; // padding
    ta.style.height = Math.min(ta.scrollHeight, maxH) + 'px';
  }

  const canSend = value.trim() && !disabled && !loading;

  return (
    <div
      className="flex items-end gap-2 px-3 pb-2.5 transition-all duration-200"
      style={{
        paddingTop: '10px',
      }}
    >
      {/* 输入框容器 — focus 时有绿光边框 */}
      <div
        className="flex-1 relative"
        style={{
          borderRadius: '22px',
          transition: 'box-shadow 0.2s ease',
          boxShadow: focused
            ? '0 0 0 2px #C8E6C9, inset 0 0 0 1px #07C160'
            : 'inset 0 0 0 1px #E0E0E0',
        }}
      >
        <textarea
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="w-full resize-none rounded-2xl px-4 py-2.5 text-sm"
          style={{
            backgroundColor: '#F7F7F7',
            color: '#1A1A1A',
            minHeight: '44px',
            maxHeight: '110px',
            outline: 'none',
            border: 'none',
            fontFamily: 'inherit',
            lineHeight: '22px',
            overflowY: 'auto',
            scrollbarWidth: 'none',
          }}
        />
      </div>

      {/* 发送按钮 */}
      <SendButton
        onClick={onSend}
        disabled={!canSend}
        loading={loading}
        size={44}
      />
    </div>
  );
}

/**
 * ============================================================
 * Uiverse-Inspired Typing Indicator
 * AI 正在输入的动画指示器
 * ============================================================
 */
export function TypingIndicator() {
  return (
    <div className="flex gap-0.5 items-center px-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{
            backgroundColor: '#07C160',
            animationDelay: `${i * 150}ms`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * ============================================================
 * AI 头像 + 气泡（ChatMessage 中使用）
 * ============================================================
 */
export function AIAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: '#F7F7F7',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#07C160"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
        <path d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </div>
  );
}
