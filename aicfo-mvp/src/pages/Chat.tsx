/**
 * AI-CFO - 你的AI财税专家
 * 首页/仪表盘 + AI对话记账页面
 * 全AI自动完成，无需人工审核
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Receipt, Calendar, Camera, Image, FileText } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { aiChat } from '../api/deepseek';
import { generateId } from '../api/mockEngine';
import ChatMessageComponent from '../components/ChatMessage';
import VoiceInput from '../components/VoiceInput';
import type { VoucherDraft } from '../types';

// ==================== 工具函数 ====================
function getMonthVouchers(vouchers: ReturnType<typeof useAppStore.getState>['vouchers']) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return vouchers.filter((v) => v.date.startsWith(`${yyyy}-${mm}`));
}

function calcStats(vouchers: ReturnType<typeof useAppStore.getState>['vouchers']) {
  const month = getMonthVouchers(vouchers);
  const income = month.filter((v) => v.status === '已入账')
    .reduce((sum, v) => {
      const item = v.items.find((i) => i.direction === '借' && i.accountName.includes('银行'));
      return sum + (item ? item.amount : 0);
    }, 0);
  const expense = month.filter((v) => v.status === '已入账')
    .reduce((sum, v) => {
      const item = v.items.find((i) => i.direction === '贷' && i.accountName.includes('银行'));
      return sum + (item ? item.amount : 0);
    }, 0);
  return { income, expense, profit: income - expense };
}

function fmt(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return n.toLocaleString('zh-CN');
}

// ==================== 常量 ====================
const GREETING = `👋 欢迎使用AI-CFO！

我是你的AI财税专家，用自然语言告诉我发生了什么，我来帮你完成记账、凭证管理。

你可以这样说：
• "收了苏州明华企业3万设计费"
• "付了京东货款2680元"
• "发了工资每人1万"`;

const QUICK_PROMPTS = [
  { emoji: '💰', text: '收了XX苏州公司3万设计费' },
  { emoji: '💸', text: '付了京东货款2680元' },
  { emoji: '👥', text: '发了工资每人1万' },
  { emoji: '🏢', text: '公户转私人2万' },
  { emoji: '📊', text: '看看这个月赚了多少' },
];

// ==================== 组件 ====================
export default function Chat() {
  const navigate = useNavigate();
  const {
    messages,
    addMessage,
    updateLastMessageDraft,
    enterprise,
    addVoucher,
    createSession,
    currentSessionId,
    setCurrentSession,
    vouchers,
    addExpertConversation,
    setShowExpertOption,
  } = useAppStore();

  const stats = calcStats(vouchers);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDash, setShowDash] = useState(true);

  // 初始化会话
  useEffect(() => {
    if (!currentSessionId) {
      const session = createSession();
      setCurrentSession(session.id);
      addMessage({ sessionId: session.id, role: 'assistant', content: GREETING });
    } else if (messages.length === 0) {
      addMessage({ sessionId: currentSessionId, role: 'assistant', content: GREETING });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 监听发票OCR跳转
  useEffect(() => {
    function handleOcr(e: CustomEvent<{ text: string }>) {
      handleOcrMessage(e.detail.text);
    }
    window.addEventListener('aicfo-ocr-voucher', handleOcr as EventListener);
    return () => window.removeEventListener('aicfo-ocr-voucher', handleOcr as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== AI处理（全自动）====================
  async function doAiProcess(text: string) {
    setIsTyping(true);
    const sessionId = currentSessionId || generateId();
    addMessage({ sessionId, role: 'user', content: text });
    addMessage({ sessionId, role: 'assistant', content: '🔍 正在分析…' });

    try {
      const result = await aiChat(text);
      if (result.success && result.draft) {
        updateLastMessageDraft({
          summary: result.draft.summary,
          amount: result.draft.amount,
          items: result.draft.items,
          confidence: result.draft.confidence,
          needEscalation: false,
          escalationReason: undefined,
        });
      } else {
        updateLastMessageDraft({
          summary: '未识别',
          amount: 0,
          items: [],
          confidence: 0,
          needEscalation: false,
          escalationReason: result.errorMsg || '请换种方式描述',
        });
      }
    } catch {
      updateLastMessageDraft({
        summary: '服务异常',
        amount: 0,
        items: [],
        confidence: 0,
        needEscalation: false,
        escalationReason: 'AI暂时不可用，请稍后重试',
      });
    }
    setIsTyping(false);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');
    setShowDash(false);
    await doAiProcess(text);
  }

  async function handleQuickSend(text: string) {
    if (isTyping) return;
    setShowDash(false);
    await doAiProcess(text);
  }

  function handleConfirm(draft: VoucherDraft) {
    addVoucher({
      enterpriseId: enterprise?.id || 'mock',
      date: new Date().toISOString().slice(0, 10),
      summary: draft.summary,
      status: '已入账',
      amount: draft.amount,
      items: draft.items.map((item) => ({
        id: generateId(),
        voucherId: '',
        direction: item.direction,
        accountName: item.accountName,
        amount: item.amount,
      })),
      creator: '用户',
      reviewer: 'AI自动审核',
    });
    addMessage({
      sessionId: currentSessionId || generateId(),
      role: 'assistant',
      content: `✅ 凭证已入账！\n\n摘要：${draft.summary}\n金额：¥${draft.amount.toLocaleString()}\n\n可在「凭证」中查看和管理。`,
    });
  }

  function handleEscalate(draft: VoucherDraft) {
    addExpertConversation({
      messages: [
        {
          id: generateId(),
          sessionId: currentSessionId || generateId(),
          role: 'user',
          content: `需要人工处理：${draft.summary}，金额：¥${draft.amount.toLocaleString()}`,
          createdAt: new Date().toISOString(),
        },
      ],
      status: '待回复',
    });
    setShowExpertOption(true, draft);
    addMessage({
      sessionId: currentSessionId || generateId(),
      role: 'assistant',
      content: `👨‍💼 已为您转接人工专家！\n\n您的凭证草稿已提交，人工专家将在1小时内回复。\n您可以继续其他操作，稍后我会提醒您专家的回复。`,
    });
  }

  function handleOcrMessage(text: string) {
    setInput(text);
    setShowDash(false);
    doAiProcess(text);
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      {/* 固定顶部：系统名称 */}
      <div
        className="px-4 flex items-center gap-2 shrink-0"
        style={{ paddingTop: 'calc(8px + env(safe-area-inset-top))', paddingBottom: '8px', background: '#FFFFFF', borderBottom: '1px solid #EDEDED' }}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#07C160' }}>
          <span className="text-white font-bold text-sm">财</span>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>AI-CFO</div>
          <div className="text-[10px]" style={{ color: '#07C160' }}>你的AI财税专家</div>
        </div>
        {enterprise && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#E8F5E9', color: '#07C160' }}>
            {enterprise.taxType}
          </span>
        )}
        <button
          onClick={() => setShowDash(!showDash)}
          className="text-xs px-2 py-1 rounded-lg"
          style={{ backgroundColor: '#F0F0F0', color: '#666666' }}
        >
          {showDash ? '隐藏看板' : '显示看板'}
        </button>
      </div>

      {/* 仪表盘：收入/支出/净利润（固定） */}
      {showDash && (
        <div className="shrink-0 px-4 pt-3 pb-2" style={{ backgroundColor: '#F7F7F7', borderBottom: '1px solid #EDEDED' }}>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: '#E8F5E9' }}>
              <p className="text-[10px] mb-0.5" style={{ color: '#4CAF50' }}>本月收入</p>
              <p className="font-bold text-base" style={{ color: '#2E7D32' }}>+{fmt(stats.income)}</p>
            </div>
            <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: '#FFF3E0' }}>
              <p className="text-[10px] mb-0.5" style={{ color: '#FF9800' }}>本月支出</p>
              <p className="font-bold text-base" style={{ color: '#E65100' }}>-{fmt(stats.expense)}</p>
            </div>
            <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: stats.profit >= 0 ? '#E3F2FD' : '#FFEBEE' }}>
              <p className="text-[10px] mb-0.5" style={{ color: '#1565C0' }}>净利润</p>
              <p className="font-bold text-base" style={{ color: stats.profit >= 0 ? '#1565C0' : '#C62828' }}>
                {stats.profit >= 0 ? '+' : ''}{fmt(stats.profit)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/vouchers')} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDED', color: '#666666' }}>
              <Receipt size={12} /> 查凭证
            </button>
            <button onClick={() => navigate('/calendar')} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDED', color: '#666666' }}>
              <Calendar size={12} /> 报税日历
            </button>
            <button onClick={() => navigate('/reports')} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDED', color: '#666666' }}>
              📊 财务报表
            </button>
          </div>
        </div>
      )}

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto py-3">
        {messages.map((msg) => (
          <ChatMessageComponent
            key={msg.id}
            message={msg}
            onConfirmVoucher={handleConfirm}
            onEscalateToExpert={handleEscalate}
          />
        ))}
        {isTyping && (
          <div className="flex justify-start mb-3 px-4">
            <div className="flex gap-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#F0F0F0' }}>
                <Sparkles size={16} style={{ color: '#07C160' }} />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDED' }}>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#07C160' }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s]" style={{ backgroundColor: '#07C160' }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s]" style={{ backgroundColor: '#07C160' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 附件菜单弹窗 */}
      {showAttachMenu && (
        <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowAttachMenu(false)}>
          <div 
            className="absolute left-4 bottom-[70px] bg-white rounded-2xl p-4 shadow-lg"
            style={{ width: '280px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-gray-500 mb-3">选择上传方式</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => { setShowAttachMenu(false); fileInputRef.current?.click(); }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#07C160]/10 flex items-center justify-center">
                  <Camera size={24} className="text-[#07C160]" />
                </div>
                <span className="text-xs text-gray-600">拍照</span>
              </button>
              <button
                onClick={() => { setShowAttachMenu(false); fileInputRef.current?.click(); }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#07C160]/10 flex items-center justify-center">
                  <Image size={24} className="text-[#07C160]" />
                </div>
                <span className="text-xs text-gray-600">相册</span>
              </button>
              <button
                onClick={() => { setShowAttachMenu(false); fileInputRef.current?.click(); }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#07C160]/10 flex items-center justify-center">
                  <FileText size={24} className="text-[#07C160]" />
                </div>
                <span className="text-xs text-gray-600">文件</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 文件处理中提示 */}
      {isProcessingFile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#07C160]/10 flex items-center justify-center mx-auto mb-3">
              <div className="w-6 h-6 border-2 border-[#07C160] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-gray-800">正在识别文件...</p>
            <p className="text-xs text-gray-400 mt-1">AI正在提取财务数据</p>
          </div>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setIsProcessingFile(true);
            // 模拟AI识别过程
            setTimeout(() => {
              setIsProcessingFile(false);
              // 根据文件类型生成模拟识别结果
              const mockResult = file.type.includes('pdf') 
                ? `识别到PDF文件：${file.name}\n已提取发票信息：金额 ¥2,680，税额 ¥154.53`
                : `识别到图片：${file.name}\n已提取发票信息：金额 ¥3,000，税额 ¥169.81`;
              setInput(mockResult);
            }, 2000);
          }
        }}
      />

      {/* 输入区域 - 微信风格 */}
      <div
        className="shrink-0 flex items-center justify-center"
        style={{ backgroundColor: '#F7F7F7', borderTop: '1px solid #E5E5E5', padding: '2px 8px', paddingBottom: 'calc(2px + env(safe-area-inset-bottom))', minHeight: '44px' }}
      >
        <div className="flex items-center gap-2 w-full">
          {/* 左侧 + 号按钮 */}
          <button
            onClick={() => setShowAttachMenu(true)}
            className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9D9D9' }}
          >
            <span style={{ color: '#7F7F7F', fontSize: '18px', lineHeight: '1' }}>+</span>
          </button>
          
          {/* 输入框 */}
          <div className="flex-1 relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="发送消息..."
              rows={1}
              className="w-full resize-none rounded-[4px] px-3 text-[15px]"
              style={{ 
                backgroundColor: '#FFFFFF', 
                border: 'none',
                color: '#1A1A1A', 
                minHeight: '36px', 
                maxHeight: '80px',
                outline: 'none',
                lineHeight: '20px',
                padding: '8px 8px'
              }}
            />
          </div>
          
          {/* 发送按钮 - 微信绿色胶囊样式 */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-[12px] rounded-[4px] text-[13px] font-medium shrink-0 flex items-center justify-center"
            style={{ 
              backgroundColor: input.trim() && !isTyping ? '#07C160' : '#E0E0E0', 
              color: input.trim() && !isTyping ? '#FFFFFF' : '#999999',
              height: '36px'
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
