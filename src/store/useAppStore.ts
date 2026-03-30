/**
 * 全局状态管理
 * 使用Zustand管理企业信息、凭证列表、对话会话
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Enterprise,
  Voucher,
  ChatSession,
  ChatMessage,
  VoucherDraft,
  VoucherStatus,
} from '../types';
import { generateId, generateVoucherNo } from '../api/mockEngine';

interface AppState {
  // ==================== 企业 & 用户 ====================
  enterprise: Enterprise | null;
  userName: string;
  isDemo: boolean;
  setEnterprise: (e: Enterprise) => void;
  setUserName: (name: string) => void;
  setIsDemo: (v: boolean) => void;

  // ==================== 冷启动状态 ====================
  isOnboarded: boolean;
  setOnboarded: (v: boolean) => void;

  // ==================== 凭证 ====================
  vouchers: Voucher[];
  addVoucher: (v: Omit<Voucher, 'id' | 'voucherNo' | 'createdAt' | 'updatedAt'>) => Voucher;
  updateVoucherStatus: (id: string, status: VoucherStatus) => void;
  deleteVoucher: (id: string) => void;

  // ==================== 对话会话 ====================
  sessions: ChatSession[];
  currentSessionId: string | null;
  messages: ChatMessage[];
  createSession: () => ChatSession;
  setCurrentSession: (id: string) => void;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  updateLastMessageDraft: (draft: VoucherDraft) => void;
  clearMessages: () => void;

  // ==================== 转人工 ====================
  showExpertOption: boolean;
  expertDraft: VoucherDraft | null;
  setShowExpertOption: (v: boolean, draft?: VoucherDraft) => void;

  // ==================== 员工管理 ====================
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
}

// 员工类型
interface Employee {
  id: string;
  name: string;
  idCard: string;
  phone: string;
  bankAccount: string;
  bankName: string;
  department: string;
  position: string;
  baseSalary: number;
  socialCity: string;
  socialBase: number;
  housingBase: number;
  socialEnabled: boolean;
  housingEnabled: boolean;
  specialDeduction: {
    children: number;
    housingLoan: boolean;
    housingRent: boolean;
    elderly: number;
    continuing: boolean;
  };
  status: 'active' | 'probation' | 'inactive';
  hireDate: string;
}

// 预置Mock凭证数据
function createMockVouchers(): Voucher[] {
  const now = new Date().toISOString();
  return [
    {
      id: generateId(),
      enterpriseId: 'mock-ent-001',
      voucherNo: '记-202603-001',
      date: '2026-03-01',
      summary: '收到XX公司设计费',
      status: '已入账',
      amount: 30000,
      creator: '管理员',
      reviewer: '管理员',
      createdAt: now,
      updatedAt: now,
      items: [
        { id: generateId(), voucherId: '', direction: '借', accountName: '银行存款', amount: 30000 },
        { id: generateId(), voucherId: '', direction: '贷', accountName: '主营业务收入', amount: 30000 },
      ],
    },
    {
      id: generateId(),
      enterpriseId: 'mock-ent-001',
      voucherNo: '记-202603-002',
      date: '2026-03-05',
      summary: '支付京东货款',
      status: '已入账',
      amount: 2680,
      creator: '管理员',
      reviewer: '管理员',
      createdAt: now,
      updatedAt: now,
      items: [
        { id: generateId(), voucherId: '', direction: '借', accountName: '销售费用', amount: 2680 },
        { id: generateId(), voucherId: '', direction: '贷', accountName: '银行存款', amount: 2680 },
      ],
    },
    {
      id: generateId(),
      enterpriseId: 'mock-ent-001',
      voucherNo: '记-202603-003',
      date: '2026-03-15',
      summary: '发放职工薪酬',
      status: '已入账',
      amount: 10000,
      creator: '管理员',
      reviewer: '管理员',
      createdAt: now,
      updatedAt: now,
      items: [
        { id: generateId(), voucherId: '', direction: '借', accountName: '应付职工薪酬', amount: 10000 },
        { id: generateId(), voucherId: '', direction: '贷', accountName: '银行存款', amount: 10000 },
      ],
    },
  ];
}

/**
 * 创建演示凭证（体验模式下调用）
 * 收入凭证 / 支出凭证 / 工资凭证各1条
 */
function createDemoVouchers(): Voucher[] {
  const now = new Date().toISOString();
  return [
    {
      id: generateId(),
      enterpriseId: 'ent-demo',
      voucherNo: '记-202603-001',
      date: '2026-03-01',
      summary: '收到XX公司3万设计费',
      status: '已入账',
      amount: 30000,
      creator: '管理员',
      reviewer: '管理员',
      createdAt: now,
      updatedAt: now,
      items: [
        { id: generateId(), voucherId: '', direction: '借', accountName: '银行存款', amount: 30000 },
        { id: generateId(), voucherId: '', direction: '贷', accountName: '主营业务收入', amount: 30000 },
      ],
    },
    {
      id: generateId(),
      enterpriseId: 'ent-demo',
      voucherNo: '记-202603-002',
      date: '2026-03-05',
      summary: '支付京东货款2680元',
      status: '已入账',
      amount: 2680,
      creator: '管理员',
      reviewer: '管理员',
      createdAt: now,
      updatedAt: now,
      items: [
        { id: generateId(), voucherId: '', direction: '借', accountName: '销售费用', amount: 2680 },
        { id: generateId(), voucherId: '', direction: '贷', accountName: '银行存款', amount: 2680 },
      ],
    },
    {
      id: generateId(),
      enterpriseId: 'ent-demo',
      voucherNo: '记-202603-003',
      date: '2026-03-15',
      summary: '发放职工薪酬1万元',
      status: '已入账',
      amount: 10000,
      creator: '管理员',
      reviewer: '管理员',
      createdAt: now,
      updatedAt: now,
      items: [
        { id: generateId(), voucherId: '', direction: '借', accountName: '应付职工薪酬', amount: 10000 },
        { id: generateId(), voucherId: '', direction: '贷', accountName: '银行存款', amount: 10000 },
      ],
    },
  ];
}

// 预置Mock会话
function createMockSession(): ChatSession {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    enterpriseId: 'mock-ent-001',
    createdAt: now,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 企业
      enterprise: null,
      userName: '',
      isDemo: false,
      setEnterprise: (e) => set({ enterprise: e }),
      setUserName: (name) => set({ userName: name }),
      setIsDemo: (v) => set({ isDemo: v }),

      // 冷启动
      isOnboarded: false,
      setOnboarded: (v) => {
        if (v) {
          // 演示模式：自动预置3条演示凭证
          const { isDemo } = get();
          if (isDemo) {
            const demoVouchers = createDemoVouchers();
            set({ isOnboarded: v, vouchers: demoVouchers });
            return;
          }
        }
        set({ isOnboarded: v });
      },

      // 凭证
      vouchers: createMockVouchers(),
      addVoucher: (v) => {
        const now = new Date().toISOString();
        const newV: Voucher = {
          ...v,
          id: generateId(),
          voucherNo: generateVoucherNo(),
          createdAt: now,
          updatedAt: now,
        };
        newV.items = newV.items.map((item) => ({ ...item, voucherId: newV.id, id: generateId() }));
        set((s) => ({ vouchers: [newV, ...s.vouchers] }));
        return newV;
      },
      updateVoucherStatus: (id, status) =>
        set((s) => ({
          vouchers: s.vouchers.map((v) =>
            v.id === id ? { ...v, status, updatedAt: new Date().toISOString() } : v
          ),
        })),
      deleteVoucher: (id) => set((s) => ({ vouchers: s.vouchers.filter((v) => v.id !== id) })),

      // 会话
      sessions: [createMockSession()],
      currentSessionId: null,
      messages: [],
      createSession: () => {
        const session = createMockSession();
        set((s) => ({ sessions: [...s.sessions, session], currentSessionId: session.id }));
        return session;
      },
      setCurrentSession: (id) => set({ currentSessionId: id }),
      addMessage: (msg) => {
        const newMsg: ChatMessage = {
          ...msg,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ messages: [...s.messages, newMsg] }));
      },
      updateLastMessageDraft: (draft) =>
        set((s) => {
          const msgs = [...s.messages];
          if (msgs.length > 0) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], voucherDraft: draft };
          return { messages: msgs };
        }),
      clearMessages: () => set({ messages: [] }),

      // 专家
      showExpertOption: false,
      expertDraft: null,
      setShowExpertOption: (v, draft) => set({ showExpertOption: v, expertDraft: draft ?? null }),

      // 员工管理
      employees: [],
      setEmployees: (emps) => set({ employees: emps }),
    }),
    {
      name: 'aicfo-mvp-storage',
      // 只持久化必要字段
      partialize: (state) => ({
        enterprise: state.enterprise,
        userName: state.userName,
        isOnboarded: state.isOnboarded,
        isDemo: state.isDemo,
        vouchers: state.vouchers,
        sessions: state.sessions,
        messages: state.messages,
        currentSessionId: state.currentSessionId,
        employees: state.employees,
      }),
    }
  )
);
