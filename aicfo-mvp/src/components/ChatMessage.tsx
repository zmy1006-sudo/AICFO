/**
 * 聊天消息组件 — 微信风格气泡
 * 全AI自动完成，无审核环节
 */

import React from 'react';
import { Bot, UserCheck } from 'lucide-react';
import type { ChatMessage as ChatMessageType, VoucherDraft } from '../types';

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function VoucherDraftView({ draft, onConfirm, onEscalate }: {
  draft: VoucherDraft;
  onConfirm?: () => void;
  onEscalate?: () => void;
}) {
  const confPct = Math.round(draft.confidence * 100);
  const confColor = confPct >= 80 ? '#07C160' : confPct >= 60 ? '#FF9800' : '#E53935';
  const confBg = confPct >= 80 ? '#E8F5E9' : confPct >= 60 ? '#FFF3E0' : '#FFEBEE';

  return (
    <div className="mt-2 rounded-xl p-3" style={{ backgroundColor: '#F7F7F7', border: '1px solid #EDEDED' }}>
      {/* 置信度 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <Bot size={14} style={{ color: '#07C160' }} />
          <span className="text-xs" style={{ color: '#888888' }}>AI凭证草稿</span>
        </div>
        <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: confBg, color: confColor }}>
          {confPct}% 置信度
        </span>
      </div>

      {/* 摘要 + 金额 */}
      <div className="mb-2">
        <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{draft.summary}</p>
        <p className="text-lg font-bold mt-0.5" style={{ color: '#07C160' }}>
          ¥{draft.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* 分录 */}
      <div className="space-y-1 mb-3">
        {draft.items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between text-xs px-2.5 py-1.5 rounded-lg"
            style={{
              backgroundColor: item.direction === '借' ? '#E8F5E9' : '#FFF3E0',
              color: item.direction === '借' ? '#2E7D32' : '#E65100',
            }}
          >
            <span>[{item.direction}] {item.accountName}</span>
            <span className="font-mono font-medium">¥{item.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* 需要转人工 */}
      {draft.needEscalation && (
        <div className="mb-3 p-2 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700">
            <span className="font-medium">⚠️ AI置信度较低</span>
            {draft.escalationReason && <span className="block mt-0.5">{draft.escalationReason}</span>}
          </p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        {draft.needEscalation ? (
          <>
            <button
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-1.5 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors bg-gray-400 cursor-not-allowed"
              disabled
            >
              需人工审核
            </button>
            <button
              onClick={onEscalate}
              className="flex-1 flex items-center justify-center gap-1.5 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              style={{ backgroundColor: '#FF6B00' }}
            >
              <UserCheck size={16} />
              转人工处理
            </button>
          </>
        ) : (
          <button
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-1.5 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            style={{ backgroundColor: '#07C160' }}
          >
            ✅ 确认入账
          </button>
        )}
      </div>
    </div>
  );
}

interface ChatMessageProps {
  message: ChatMessageType;
  onConfirmVoucher?: (draft: VoucherDraft) => void;
  onEscalateToExpert?: (draft: VoucherDraft) => void;
}

export default function ChatMessageComponent({ message, onConfirmVoucher, onEscalateToExpert }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 px-4`}>
      <div className={`flex gap-2 max-w-[82%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* 头像 */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={isUser ? { backgroundColor: '#07C160' } : { backgroundColor: '#F0F0F0' }}
        >
          {isUser
            ? <span className="text-white text-xs font-bold">我</span>
            : <Bot size={16} style={{ color: '#07C160' }} />
          }
        </div>

        {/* 消息气泡 */}
        <div>
          <div
            style={
              isUser
                ? {
                    backgroundColor: '#95EC69',
                    color: '#1A1A1A',
                    borderRadius: '18px 18px 4px 18px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    padding: '10px 14px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    maxWidth: '100%',
                    display: 'inline-block',
                  }
                : {
                    backgroundColor: '#FFFFFF',
                    color: '#1A1A1A',
                    borderRadius: '18px 18px 18px 4px',
                    border: '1px solid #EDEDED',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                    padding: '10px 14px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    maxWidth: '100%',
                    display: 'inline-block',
                  }
            }
          >
            {message.content}
          </div>

          {/* 凭证草稿 */}
          {!isUser && message.voucherDraft && (
            <VoucherDraftView
              draft={message.voucherDraft}
              onConfirm={() => onConfirmVoucher?.(message.voucherDraft!)}
              onEscalate={() => onEscalateToExpert?.(message.voucherDraft!)}
            />
          )}

          <p className="text-[10px] mt-1" style={{ color: '#BBBBBB' }}>
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
