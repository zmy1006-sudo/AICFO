// ==================== 基础类型 ====================

/** 纳税类型 */
export type TaxType = '一般纳税人' | '小规模纳税人';

/** 凭证状态 */
export type VoucherStatus = '草稿' | '待审核' | '已入账' | '已作废';

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

// ==================== Mock规则引擎 ====================

/** 解析结果 */
export interface ParseResult {
  success: boolean;
  draft?: VoucherDraft;
  needOption?: boolean; // 需要用户选择
  options?: Array<{ label: string; value: string; draft: VoucherDraft }>;
  errorMsg?: string;
  // 工资计算意图路由（AICFO Phase 1）
  needSalaryCalc?: boolean;
  salaryIntent?: SalaryIntent;
}

/** 工资意图数据 */
export interface SalaryIntent {
  employeeName: string;
  grossSalary: number;
  rawText: string;
}

// ==================== 社保计算结果类型 ====================

/** 社保缴纳结果 */
export interface SocialSecurityResult {
  city: string;
  base: number;        // 实际缴费基数
  baseMin: number;     // 基数下限
  baseMax: number;     // 基数上限
  company: {
    pension: number;      // 养老保险
    medical: number;      // 医疗保险
    unemployment: number; // 失业保险
    workInjury: number;  // 工伤保险
    maternity: number;   // 生育保险
    total: number;       // 公司合计
  };
  employee: {
    pension: number;      // 养老保险
    medical: number;      // 医疗保险
    unemployment: number; // 失业保险
    total: number;        // 个人合计
  };
  totalCost: number; // 总成本（公司+个人）
}

// ==================== 公积金计算结果类型 ====================

/** 公积金缴纳结果 */
export interface HousingFundResult {
  city: string;
  base: number;        // 实际缴费基数
  baseMin: number;     // 基数下限
  baseMax: number;     // 基数上限
  rate: number;        // 缴存比例（%）
  employeeFund: number; // 个人缴存
  companyFund: number;  // 公司缴存
  totalFund: number;   // 合计
}

// ==================== 个税计算结果类型 ====================

/** 个税计算结果 */
export interface TaxResult {
  month: number;
  cumulativeIncome: number;
  taxableIncome: number; // 累计应税所得额
  rate: number;          // 适用税率
  monthlyTax: number;    // 当月税额
  cumulativeTax: number; // 累计已预扣税额
  monthlyDeduction: {
    basicDeduction: number;  // 基本减除费用（5000）
    socialSecurity: number;  // 当月社保
    housingFund: number;      // 当月公积金
    specialDeduction: number; // 当月专项附加扣除
  };
}

// ==================== 专项附加扣除档案类型 ====================

/** 专项附加扣除用户档案 */
export interface SpecialDeductionProfile {
  childrenCount?: number;      // 子女数量
  childrenAges?: number[];     // 各子女年龄
  isContinuingEducation?: boolean;    // 是否继续教育（学历）
  hasProfessionalCertificate?: boolean; // 是否有职业资格证书
  criticalIllnessExpense?: number; // 大病医疗年度自付额
  hasHousingLoan?: boolean;    // 是否有首套房贷款
  rentCity?: string | null;    // 租房城市（null则不租房）
  isOnlyChild?: boolean;       // 是否独生子女
  elderlyParentsCount?: number; // 60岁以上父母数量
  infantsCount?: number;       // 3岁以下婴幼儿数量
}

// ==================== 工资计算相关类型 ====================

/** 员工薪资信息（用于工资计算） */
export interface SalaryEmployee {
  id: string;
  name: string;
  grossSalary: number;          // 税前月薪（元）
  city: string;                 // 参保城市
  specialDeduction?: SpecialDeductionProfile; // 专项附加扣除档案
}

/** 月度工资条明细 */
export interface SalarySlip {
  employeeId: string;
  employeeName: string;
  month: number;
  grossSalary: number;              // 税前工资
  socialSecurity: SocialSecurityResult; // 社保明细
  housingFund: HousingFundResult;       // 公积金明细
  taxableIncome: number;            // 应纳税所得额（月度）
  individualTax: TaxResult;         // 个税明细
  netSalary: number;                // 实发工资
  totalCost: number;                // 用人总成本
}
