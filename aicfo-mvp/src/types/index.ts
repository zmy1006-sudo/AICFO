// ==================== 基础类型 ====================

/** 纳税类型 */
export type TaxType = '一般纳税人' | '小规模纳税人';

/** 凭证状态 */
export type VoucherStatus = '草稿' | '待确认' | '已入账' | '已申报' | '已归档' | '已作废';

/** 凭证修改类型 */
export type VoucherModifyType = '信息勘误' | '跨期调整' | '发票作废红冲';

/** 借贷方向 */
export type Direction = '借' | '贷';

/** 消息角色 */
export type MessageRole = 'user' | 'assistant' | 'system';

/** 提醒级别 */
export type AlertLevel = '紧急' | '警告' | '提示';

/** 凭证分录 */
export interface VoucherItem {
  id: string;
  voucherId: string;
  direction: Direction;
  accountName: string; // 科目名称
  amount: number;
}

// ==================== 业务类型 ====================

/** 企业信息 */
export interface Enterprise {
  id: string;
  creditCode: string; // 统一社会信用代码
  name: string;
  taxType: TaxType;
  registeredAddress: string;
  registeredCapital: string;
}

/** 用户信息 */
export interface User {
  id: string;
  enterpriseId: string;
  openid: string;
  name: string;
  phone: string;
}

/** 凭证 */
export interface Voucher {
  id: string;
  enterpriseId: string;
  voucherNo: string; // 凭证编号
  date: string; // YYYY-MM-DD
  summary: string; // 摘要
  status: VoucherStatus;
  amount: number;
  items: VoucherItem[];
  creator: string;
  reviewer?: string;
  createdAt: string;
  updatedAt: string;
}

/** 对话会话 */
export interface ChatSession {
  id: string;
  enterpriseId: string;
  createdAt: string;
}

/** 对话消息 */
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  attachments?: string[];
  createdAt: string;
  confidence?: number; // AI回复置信度
  voucherDraft?: VoucherDraft; // AI生成的凭证草稿
}

/** AI凭证草稿（Mock生成） */
export interface VoucherDraft {
  summary: string;
  amount: number;
  items: Array<{
    direction: Direction;
    accountName: string;
    amount: number;
  }>;
  confidence: number; // 0-1
  needEscalation: boolean; // 是否需要转人工
  escalationReason?: string;
}

/** 报税日历项 */
export interface TaxCalendarItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  level: AlertLevel;
  description: string;
  deadline: string; // YYYY-MM-DD
}

/** 凭证修改记录 */
export interface VoucherModification {
  id: string;
  originalVoucherId: string;
  type: VoucherModifyType;
  description: string;
  createdAt: string;
  creator: string;
}

/** 档案项 */
export interface ArchiveItem {
  id: string;
  type: '月度凭证汇总' | '账簿' | '财务报表' | '年度财务报告' | '税务资料' | '合同';
  title: string;
  period: string; // YYYY-MM 或 YYYY
  fileUrl?: string;
  status: '待归档' | '已归档' | '待销毁' | '已销毁';
  createdAt: string;
  archivedAt?: string;
  destroyAt?: string;
}

/** 工资条 */
export interface SalaryRecord {
  id: string;
  employeeName: string;
  baseSalary: number;
  performanceSalary: number;
  overtimePay: number;
  mealSubsidy: number;
  transportationSubsidy: number;
  fullAttendanceBonus: number;
  otherAllowances: number;
  totalGross: number;
  personalTax: number;
  socialInsurance: number;
  housingFund: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  period: string; // YYYY-MM
}

/** 年终奖方案 */
export interface YearEndBonusPlan {
  id: string;
  employeeName: string;
  bonusAmount: number;
  planType: '单独计税' | '合并计税';
  monthlyIncomeTax: number;
  bonusIncomeTax: number;
  totalTax: number;
  netBonus: number;
  recommended: boolean;
  period: string;
}

/** 数据导入记录 */
export interface ImportRecord {
  id: string;
  source: 'excel' | 'yonyou' | 'kingdee' | 'wechat' | 'alipay';
  fileName: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  status: '处理中' | '成功' | '部分失败' | '失败';
  createdAt: string;
  completedAt?: string;
  errors?: string[];
}

/** 合同 */
export interface Contract {
  id: string;
  name: string;
  type: '采购合同' | '销售合同' | '服务合同' | '租赁合同' | '其他';
  counterparty: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: '执行中' | '即将到期' | '已完成' | '已终止';
  description?: string;
  createdAt: string;
}

/** 用户反馈 */
export interface Feedback {
  id: string;
  content: string;
  createdAt: string;
}

/** 发票记录 */
export interface InvoiceRecord {
  id: string;
  type: string;
  invoiceNo: string;
  date: string;
  buyer: string;
  seller: string;
  amountExclTax: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  voucherId?: string;
  createdAt: string;
}

/** 员工 */
export interface Employee {
  id: string;
  name: string;
  idCard: string;
  bankAccount: string;
  baseSalary: number;
  performanceSalary: number;
  overtimePay: number;
  mealSubsidy: number;
  transportationSubsidy: number;
  fullAttendanceBonus: number;
  otherAllowances: number;
  socialInsuranceRate: number;
  housingFundRate: number;
  createdAt: string;
}

/** 专家会话 */
export interface ExpertConversation {
  id: string;
  messages: ChatMessage[];
  status: '待回复' | '处理中' | '已回复';
  createdAt: string;
  respondedAt?: string;
}

// ==================== Mock规则引擎 ====================

/** 解析结果 */
export interface ParseResult {
  success: boolean;
  draft?: VoucherDraft;
  needOption?: boolean; // 需要用户选择
  options?: Array<{ label: string; value: string; draft: VoucherDraft }>;
  errorMsg?: string;
}
