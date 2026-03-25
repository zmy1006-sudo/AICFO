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
  VoucherModification,
  ArchiveItem,
  SalaryRecord,
  YearEndBonusPlan,
  ImportRecord,
  VoucherModifyType,
  ExpertConversation,
  Contract,
  InvoiceRecord,
  Employee,
  Feedback,
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

  // ==================== 凭证状态机 ====================
  vouchers: Voucher[];
  addVoucher: (v: Omit<Voucher, 'id' | 'voucherNo' | 'createdAt' | 'updatedAt'>) => Voucher;
  updateVoucherStatus: (id: string, status: VoucherStatus) => void;
  deleteVoucher: (id: string) => void;
  voidVoucher: (id: string, reason: string) => Voucher;
  reverseVoucher: (id: string, type: VoucherModifyType, description: string) => Voucher;
  getVouchersByStatus: (status: VoucherStatus) => Voucher[];
  getVouchersByPeriod: (year: number, month: number) => Voucher[];
  confirmVoucher: (id: string) => void;
  submitVoucher: (id: string) => void;
  archiveVoucher: (id: string) => void;

  // ==================== 凭证修改记录 ====================
  voucherModifications: VoucherModification[];
  addVoucherModification: (mod: Omit<VoucherModification, 'id' | 'createdAt'>) => void;

  // ==================== 档案管理 ====================
  archives: ArchiveItem[];
  addArchive: (archive: Omit<ArchiveItem, 'id' | 'createdAt'>) => void;
  updateArchiveStatus: (id: string, status: ArchiveItem['status']) => void;
  generateMonthlyArchive: (year: number, month: number) => void;

  // ==================== 工资算薪 ====================
  salaryRecords: SalaryRecord[];
  addSalaryRecord: (record: Omit<SalaryRecord, 'id'>) => SalaryRecord;
  calculateNetSalary: (gross: number, taxType: string, socialInsurance: number, housingFund: number) => SalaryRecord;
  calculateYearEndBonusComparison: (bonusAmount: number, monthlyIncome: number, employeeName: string, period: string) => YearEndBonusPlan[];
  yearEndBonusPlans: YearEndBonusPlan[];
  addYearEndBonusPlan: (plan: Omit<YearEndBonusPlan, 'id'>) => void;

  // ==================== 数据导入 ====================
  importRecords: ImportRecord[];
  addImportRecord: (record: Omit<ImportRecord, 'id' | 'createdAt'>) => ImportRecord;
  updateImportRecord: (id: string, updates: Partial<ImportRecord>) => void;

  // ==================== 合同管理 ====================
  contracts: Contract[];
  addContract: (contract: Omit<Contract, 'id' | 'createdAt'>) => Contract;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;

  // ==================== 发票管理 ====================
  invoices: InvoiceRecord[];
  addInvoice: (invoice: Omit<InvoiceRecord, 'id' | 'createdAt'>) => InvoiceRecord;
  linkInvoiceToVoucher: (invoiceId: string, voucherId: string) => void;

  // ==================== 员工管理 ====================
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

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
  expertConversations: ExpertConversation[];
  addExpertConversation: (conversation: Omit<ExpertConversation, 'id' | 'createdAt'>) => ExpertConversation;
  updateExpertConversationStatus: (id: string, status: ExpertConversation['status']) => void;
}

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

function createMockSession(): ChatSession {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    enterpriseId: 'mock-ent-001',
    createdAt: now,
  };
}

function calcPersonalTax(gross: number, socialInsurance: number, housingFund: number): number {
  const taxableIncome = gross - socialInsurance - housingFund - 5000;
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 36000) return taxableIncome * 0.03;
  if (taxableIncome <= 144000) return taxableIncome * 0.10 - 2520;
  if (taxableIncome <= 300000) return taxableIncome * 0.20 - 16920;
  if (taxableIncome <= 420000) return taxableIncome * 0.25 - 31920;
  if (taxableIncome <= 660000) return taxableIncome * 0.30 - 52920;
  if (taxableIncome <= 960000) return taxableIncome * 0.35 - 85920;
  return taxableIncome * 0.45 - 181920;
}

function calcYearEndBonusTax单独(bonus: number): number {
  const monthly = bonus / 12;
  let tax = 0;
  if (monthly <= 3000) tax = monthly * 0.03 * 12;
  else if (monthly <= 12000) tax = monthly * 0.10 * 12 - 2520;
  else if (monthly <= 25000) tax = monthly * 0.20 * 12 - 16920;
  else if (monthly <= 35000) tax = monthly * 0.25 * 12 - 31920;
  else if (monthly <= 55000) tax = monthly * 0.30 * 12 - 52920;
  else if (monthly <= 80000) tax = monthly * 0.35 * 12 - 85920;
  else tax = monthly * 0.45 * 12 - 181920;
  return Math.round(tax);
}

function calcYearEndBonusTax合并(bonus: number, monthlyIncome: number): number {
  const totalIncome = bonus + monthlyIncome;
  return calcPersonalTax(totalIncome, 0, 0) - calcPersonalTax(monthlyIncome, 0, 0);
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
          const { isDemo } = get();
          if (isDemo) {
            const demoVouchers = createMockVouchers();
            set({ isOnboarded: v, vouchers: demoVouchers });
            return;
          }
        }
        set({ isOnboarded: v });
      },

      // 凭证状态机
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

      // 凭证作废（红字凭证）
      voidVoucher: (id, reason) => {
        const { vouchers, addVoucherModification } = get();
        const original = vouchers.find((v) => v.id === id);
        if (!original) throw new Error('凭证不存在');

        const now = new Date().toISOString();
        const reversalVoucher: Voucher = {
          ...original,
          id: generateId(),
          voucherNo: generateVoucherNo(),
          summary: `【作废】${original.summary} - ${reason}`,
          status: '已作废',
          creator: '系统',
          createdAt: now,
          updatedAt: now,
          items: original.items.map((item) => ({
            ...item,
            id: generateId(),
            voucherId: '',
            amount: -item.amount,
          })),
        };
        reversalVoucher.items = reversalVoucher.items.map((item) => ({ ...item, voucherId: reversalVoucher.id }));

        set((s) => ({
          vouchers: [reversalVoucher, ...s.vouchers.map((v) => (v.id === id ? { ...v, status: '已作废' as VoucherStatus } : v))],
        }));

        addVoucherModification({
          originalVoucherId: id,
          type: '信息勘误',
          description: `作废凭证：${original.summary}，原因：${reason}`,
          creator: '系统',
        });

        return reversalVoucher;
      },

      // 凭证红字冲销/蓝字更正
      reverseVoucher: (id, type, description) => {
        const { vouchers, addVoucherModification } = get();
        const original = vouchers.find((v) => v.id === id);
        if (!original) throw new Error('凭证不存在');

        const now = new Date().toISOString();
        const reversedVoucher: Voucher = {
          ...original,
          id: generateId(),
          voucherNo: generateVoucherNo(),
          summary: `【${type}】${description}`,
          status: '草稿',
          creator: '管理员',
          createdAt: now,
          updatedAt: now,
          items: type === '发票作废红冲'
            ? original.items.map((item) => ({ ...item, id: generateId(), voucherId: '', amount: -item.amount }))
            : original.items.map((item) => ({ ...item, id: generateId(), voucherId: '' })),
        };
        reversedVoucher.items = reversedVoucher.items.map((item) => ({ ...item, voucherId: reversedVoucher.id }));

        set((s) => ({ vouchers: [reversedVoucher, ...s.vouchers] }));

        addVoucherModification({
          originalVoucherId: id,
          type,
          description,
          creator: '管理员',
        });

        return reversedVoucher;
      },

      getVouchersByStatus: (status) => get().vouchers.filter((v) => v.status === status),
      getVouchersByPeriod: (year, month) => {
        const prefix = `${year}-${String(month).padStart(2, '0')}`;
        return get().vouchers.filter((v) => v.date.startsWith(prefix));
      },

      confirmVoucher: (id) => {
        const voucher = get().vouchers.find((v) => v.id === id);
        if (!voucher) return;
        if (voucher.status !== '草稿' && voucher.status !== '待确认') return;
        set((s) => ({
          vouchers: s.vouchers.map((v) =>
            v.id === id ? { ...v, status: '已入账' as VoucherStatus, updatedAt: new Date().toISOString() } : v
          ),
        }));
      },

      submitVoucher: (id) => {
        const voucher = get().vouchers.find((v) => v.id === id);
        if (!voucher) return;
        if (voucher.status !== '已入账') return;
        set((s) => ({
          vouchers: s.vouchers.map((v) =>
            v.id === id ? { ...v, status: '已申报' as VoucherStatus, updatedAt: new Date().toISOString() } : v
          ),
        }));
      },

      archiveVoucher: (id) => {
        const voucher = get().vouchers.find((v) => v.id === id);
        if (!voucher) return;
        if (voucher.status !== '已申报') return;
        set((s) => ({
          vouchers: s.vouchers.map((v) =>
            v.id === id ? { ...v, status: '已归档' as VoucherStatus, updatedAt: new Date().toISOString() } : v
          ),
        }));
      },

      // 凭证修改记录
      voucherModifications: [],
      addVoucherModification: (mod) => {
        const newMod: VoucherModification = {
          ...mod,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ voucherModifications: [newMod, ...s.voucherModifications] }));
      },

      // 档案管理
      archives: [],
      addArchive: (archive) => {
        const newArchive: ArchiveItem = {
          ...archive,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ archives: [newArchive, ...s.archives] }));
      },
      updateArchiveStatus: (id, status) =>
        set((s) => ({
          archives: s.archives.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status,
                  archivedAt: status === '已归档' ? new Date().toISOString() : a.archivedAt,
                  destroyAt: status === '已销毁' ? new Date().toISOString() : a.destroyAt,
                }
              : a
          ),
        })),
      generateMonthlyArchive: (year, month) => {
        const period = `${year}-${String(month).padStart(2, '0')}`;
        const vouchers = get().getVouchersByPeriod(year, month);
        const existing = get().archives.find((a) => a.period === period && a.type === '月度凭证汇总');
        if (existing || vouchers.length === 0) return;

        get().addArchive({
          type: '月度凭证汇总',
          title: `${year}年${month}月凭证汇总`,
          period,
          status: '待归档',
        });
      },

      // 工资算薪
      salaryRecords: [],
      addSalaryRecord: (record) => {
        const newRecord: SalaryRecord = {
          ...record,
          id: generateId(),
        };
        set((s) => ({ salaryRecords: [newRecord, ...s.salaryRecords] }));
        return newRecord;
      },
      calculateNetSalary: (gross, taxType, socialInsurance, housingFund) => {
        const personalTax = calcPersonalTax(gross, socialInsurance, housingFund);
        const totalDeductions = personalTax + socialInsurance + housingFund;
        const netSalary = gross - totalDeductions;
        const record: Omit<SalaryRecord, 'id'> = {
          employeeName: '员工',
          baseSalary: gross,
          performanceSalary: 0,
          overtimePay: 0,
          mealSubsidy: 0,
          transportationSubsidy: 0,
          fullAttendanceBonus: 0,
          otherAllowances: 0,
          totalGross: gross,
          personalTax,
          socialInsurance,
          housingFund,
          otherDeductions: 0,
          totalDeductions,
          netSalary,
          period: new Date().toISOString().slice(0, 7),
        };
        return get().addSalaryRecord(record);
      },

      calculateYearEndBonusComparison: (bonusAmount, monthlyIncome, employeeName, period) => {
        const tax单独 = calcYearEndBonusTax单独(bonusAmount);
        const tax合并 = calcYearEndBonusTax合并(bonusAmount, monthlyIncome);

        const plan单独: Omit<YearEndBonusPlan, 'id'> = {
          employeeName,
          bonusAmount,
          planType: '单独计税',
          monthlyIncomeTax: 0,
          bonusIncomeTax: tax单独,
          totalTax: tax单独,
          netBonus: bonusAmount - tax单独,
          recommended: (bonusAmount - tax单独) > (bonusAmount - tax合并),
          period,
        };

        const plan合并: Omit<YearEndBonusPlan, 'id'> = {
          employeeName,
          bonusAmount,
          planType: '合并计税',
          monthlyIncomeTax: calcPersonalTax(monthlyIncome, 0, 0),
          bonusIncomeTax: 0,
          totalTax: tax合并,
          netBonus: bonusAmount - tax合并,
          recommended: (bonusAmount - tax单独) <= (bonusAmount - tax合并),
          period,
        };

        const plans = [plan单独, plan合并];
        plans.forEach((plan) => get().addYearEndBonusPlan(plan));
        return get().yearEndBonusPlans.filter((p) => p.period === period && p.bonusAmount === bonusAmount);
      },

      yearEndBonusPlans: [],
      addYearEndBonusPlan: (plan) => {
        const newPlan: YearEndBonusPlan = { ...plan, id: generateId() };
        set((s) => ({ yearEndBonusPlans: [...s.yearEndBonusPlans, newPlan] }));
      },

      // 数据导入
      importRecords: [],
      addImportRecord: (record) => {
        const newRecord: ImportRecord = {
          ...record,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ importRecords: [newRecord, ...s.importRecords] }));
        return newRecord;
      },
      updateImportRecord: (id, updates) =>
        set((s) => ({
          importRecords: s.importRecords.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      // 合同管理
      contracts: [],
      addContract: (contract) => {
        const newContract: Contract = {
          ...contract,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ contracts: [...s.contracts, newContract] }));
        return newContract;
      },
      updateContract: (id, updates) =>
        set((s) => ({
          contracts: s.contracts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteContract: (id) =>
        set((s) => ({ contracts: s.contracts.filter((c) => c.id !== id) })),

      // 发票管理
      invoices: [],
      addInvoice: (invoice) => {
        const newInvoice: InvoiceRecord = {
          ...invoice,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ invoices: [newInvoice, ...s.invoices] }));
        return newInvoice;
      },
      linkInvoiceToVoucher: (invoiceId, voucherId) =>
        set((s) => ({
          invoices: s.invoices.map((i) => (i.id === invoiceId ? { ...i, voucherId } : i)),
        })),

      // 用户反馈
      feedbacks: [],
      addFeedback: (content: string) => {
        const newFeedback: Feedback = {
          id: generateId(),
          content,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ feedbacks: [newFeedback, ...s.feedbacks] }));
        return newFeedback;
      },

      // 员工管理
      employees: [],
      addEmployee: (employee) => {
        const newEmployee: Employee = {
          ...employee,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ employees: [...s.employees, newEmployee] }));
        return newEmployee;
      },
      updateEmployee: (id, updates) =>
        set((s) => ({
          employees: s.employees.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteEmployee: (id) =>
        set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),

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

      expertConversations: [],
      addExpertConversation: (conversation) => {
        const newConv: ExpertConversation = {
          ...conversation,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ expertConversations: [...s.expertConversations, newConv] }));
        return newConv;
      },
      updateExpertConversationStatus: (id, status) =>
        set((s) => ({
          expertConversations: s.expertConversations.map((c) =>
            c.id === id
              ? { ...c, status, respondedAt: status === '已回复' ? new Date().toISOString() : c.respondedAt }
              : c
          ),
        })),
    }),
    {
      name: 'aicfo-mvp-storage',
      partialize: (state) => ({
        enterprise: state.enterprise,
        userName: state.userName,
        isOnboarded: state.isOnboarded,
        isDemo: state.isDemo,
        vouchers: state.vouchers,
        sessions: state.sessions,
        messages: state.messages,
        currentSessionId: state.currentSessionId,
        voucherModifications: state.voucherModifications,
        archives: state.archives,
        salaryRecords: state.salaryRecords,
        yearEndBonusPlans: state.yearEndBonusPlans,
        importRecords: state.importRecords,
        expertConversations: state.expertConversations,
      }),
    }
  )
);
