/**
 * Mock规则引擎
 * 将用户自然语言输入转换为凭证草稿
 * 暂不接真实AI API，用规则匹配演示核心流程
 * 工资意图路由至新计算器（AICFO Phase 1）
 */

import type { VoucherDraft, ParseResult, Direction, SalaryEmployee, SalarySlip, SpecialDeductionProfile } from '../types';
import { calculateSocialSecurity } from './socialSecurityRules';
import { calculateHousingFund } from './housingFundRules';
import { calculateIndividualTax } from './taxCalculator';
import { getMonthlySpecialDeduction } from './specialDeduction';

// 科目白名单
const ACCOUNT_WHITELIST = [
  '银行存款',
  '应收账款',
  '主营业务收入',
  '销售费用',
  '应付职工薪酬',
  '管理费用',
  '固定资产',
];

/**
 * 从文本中提取金额（支持中文万/元）
 */
function extractAmount(text: string): number | null {
  // 匹配 "3万"、"2680"、"2万元" 等
  const wanMatch = text.match(/(\d+(?:\.\d+)?)\s*万\s*(?:元)?/);
  if (wanMatch) return parseFloat(wanMatch[1]) * 10000;

  const yuanMatch = text.match(/(\d+(?:\.\d+)?)\s*元/);
  if (yuanMatch) return parseFloat(yuanMatch[1]);

  const plainMatch = text.match(/(\d+(?:\.\d+)?)/);
  if (plainMatch) return parseFloat(plainMatch[1]);

  return null;
}

/**
 * 提取交易对象/事由
 */
function extractSubject(text: string): string {
  return text
    .replace(/\d+(?:\.\d+)?\s*万\s*(?:元)?/g, '')
    .replace(/\d+(?:\.\d+)?\s*元/g, '')
    .replace(/收了|付了|发了|转账|转了|公户转私人|公转私/g, '')
    .trim() || '未知';
}

// ==================== 规则匹配 ====================

interface Rule {
  patterns: RegExp[];
  buildDraft: (subject: string, amount: number) => VoucherDraft;
}

const RULES: Rule[] = [
  // 收入规则：收了XX设计费/服务费/咨询费
  {
    patterns: [/收了.*费/, /收到.*款/, /收入/, /入账/],
    buildDraft: (subject, amount) => ({
      summary: `收到${subject}款项`,
      amount,
      items: [
        { direction: '借' as Direction, accountName: '应收账款', amount },
        { direction: '贷' as Direction, accountName: '主营业务收入', amount },
      ],
      confidence: 0.92,
      needEscalation: false,
    }),
  },
  // 支出规则：付了XX货款/费用
  {
    patterns: [/付了/, /支付/, /购买/, /采购/],
    buildDraft: (subject, amount) => ({
      summary: `支付${subject}费用`,
      amount,
      items: [
        { direction: '借' as Direction, accountName: '销售费用', amount },
        { direction: '贷' as Direction, accountName: '银行存款', amount },
      ],
      confidence: 0.88,
      needEscalation: false,
    }),
  },
  // 工资规则：发了工资
  {
    patterns: [/发工资/, /发.*工资/, /工资.*发/],
    buildDraft: (subject, amount) => ({
      summary: `发放职工薪酬`,
      amount,
      items: [
        { direction: '借' as Direction, accountName: '应付职工薪酬', amount },
        { direction: '贷' as Direction, accountName: '银行存款', amount },
      ],
      confidence: 0.95,
      needEscalation: false,
    }),
  },
  // 管理费用规则
  {
    patterns: [/房租|租金|物业|水电|办公/],
    buildDraft: (subject, amount) => ({
      summary: `支付${subject}费用`,
      amount,
      items: [
        { direction: '借' as Direction, accountName: '管理费用', amount },
        { direction: '贷' as Direction, accountName: '银行存款', amount },
      ],
      confidence: 0.90,
      needEscalation: false,
    }),
  },
  // 固定资产规则
  {
    patterns: [/购入.*设备|购买.*电脑|采购.*办公|买.*家具/],
    buildDraft: (subject, amount) => ({
      summary: `购入${subject}`,
      amount,
      items: [
        { direction: '借' as Direction, accountName: '固定资产', amount },
        { direction: '贷' as Direction, accountName: '银行存款', amount },
      ],
      confidence: 0.85,
      needEscalation: amount > 50000, // 大额需要确认
      escalationReason: amount > 50000 ? '金额较大，建议核实' : undefined,
    }),
  },
];

/**
 * 公户转私人 - 需要用户选择
 */
function handlePublicToPrivate(amount: number): ParseResult {
  const baseSubject = '公转私';
  const options = [
    {
      label: '借款',
      value: '借款',
      draft: {
        summary: `公户转私人-借款`,
        amount,
        items: [
          { direction: '借' as Direction, accountName: '应收账款', amount },
          { direction: '贷' as Direction, accountName: '银行存款', amount },
        ],
        confidence: 0.70,
        needEscalation: true,
        escalationReason: '公转私需明确性质，建议联系专家确认',
      },
    },
    {
      label: '分红',
      value: '分红',
      draft: {
        summary: `公户转私人-分红`,
        amount,
        items: [
          { direction: '借' as Direction, accountName: '利润分配', amount },
          { direction: '贷' as Direction, accountName: '银行存款', amount },
        ],
        confidence: 0.65,
        needEscalation: true,
        escalationReason: '分红涉及税务，建议联系专家确认',
      },
    },
    {
      label: '还款',
      value: '还款',
      draft: {
        summary: `公户转私人-还款`,
        amount,
        items: [
          { direction: '借' as Direction, accountName: '其他应付款', amount },
          { direction: '贷' as Direction, accountName: '银行存款', amount },
        ],
        confidence: 0.75,
        needEscalation: false,
      },
    },
  ];

  return {
    success: true,
    needOption: true,
    options,
  };
}

/**
 * 主解析函数
 */
export function parseUserInput(text: string): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { success: false, errorMsg: '请输入记账内容' };
  }

  // 公户转私人特殊处理
  if (/公户转私人|公转私/.test(trimmed)) {
    const amount = extractAmount(trimmed) ?? 0;
    return handlePublicToPrivate(amount);
  }

  // 工资意图路由：检测到工资/薪资/月薪关键词，交给新计算器
  if (/发工资|算工资|扣税|个税|月薪到手|税后工资|工资条|个税计算|五险一金/.test(trimmed)) {
    // 从文本中提取员工姓名和金额
    const amount = extractAmount(trimmed);
    const nameMatch = trimmed.match(/给(.+?)(发|算|扣|工资)/);
    const employeeName = nameMatch ? nameMatch[1].trim() : '员工';
    return {
      success: true,
      needSalaryCalc: true,
      salaryIntent: {
        employeeName,
        grossSalary: amount ?? 0,
        rawText: trimmed,
      },
    };
  }

  // 提取金额
  const amount = extractAmount(trimmed);
  if (!amount || amount <= 0) {
    return { success: false, errorMsg: '未能识别金额，请明确金额（如"收了3万设计费"）' };
  }

  // 提取事由
  const subject = extractSubject(trimmed);

  // 遍历规则匹配
  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(trimmed)) {
        const draft = rule.buildDraft(subject, amount);
        // 大额（>10万）触发专家转人工
        if (amount > 100000 && !draft.needEscalation) {
          draft.needEscalation = true;
          draft.escalationReason = '金额较大，建议专家审核';
        }
        return { success: true, draft };
      }
    }
  }

  // 无匹配规则，默认生成银行存款凭证
  const defaultDraft: VoucherDraft = {
    summary: subject ? `支付${subject}` : '其他收支',
    amount,
    items: [
      { direction: '借', accountName: '管理费用', amount },
      { direction: '贷', accountName: '银行存款', amount },
    ],
    confidence: 0.50,
    needEscalation: true,
    escalationReason: '未能精确识别业务类型，建议专家确认',
  };

  return { success: true, draft: defaultDraft };
}

/** 工具函数：生成唯一ID */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** 工具函数：生成凭证编号 */
export function generateVoucherNo(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const seq = Math.floor(Math.random() * 9000 + 1000);
  return `记-${dateStr}-${seq}`;
}

// ==================== AICFO Phase 1: 工资个税计算引擎 ====================
// FR-001~004: 社保计算 / 公积金计算 / 个税计算 / 工资条生成

/**
 * 工资条计算主函数
 * 整合 FR-001（社保）、FR-002（公积金）、FR-003（个税）计算月度工资
 *
 * @param employee - 员工信息（含税前月薪、参保城市、专项附加扣除档案）
 * @param month - 工资所属月份（1-12）
 * @returns SalarySlip 月度工资条明细
 *
 * 计算顺序：
 * 1. 社保（FR-001）：基于税前工资和城市规则计算五险
 * 2. 公积金（FR-002）：基于税前工资和城市规则计算
 * 3. 个税（FR-003）：累计预扣法，扣除社保+公积金+专项附加+减除费用
 * 4. 实发工资 = 税前工资 - 个人社保 - 个人公积金 - 个税
 */
export function calculateSalary(employee: SalaryEmployee, month: number): SalarySlip {
  const { grossSalary, city, specialDeduction } = employee;

  // FR-001: 社保计算（单位：元）
  const socialResult = calculateSocialSecurity(grossSalary, city);

  // FR-002: 公积金计算（默认缴存比例10%）
  const housingResult = calculateHousingFund(grossSalary, city);

  // FR-003: 个税计算
  // 获取月度专项附加扣除（默认空档案→0）
  const deductionProfile: SpecialDeductionProfile = specialDeduction ?? {};
  const monthlySpecialDeduction = getMonthlySpecialDeduction(deductionProfile);

  // 累计应税收入 = 累计税前工资 - 累计社保个人 - 累计公积金个人 - 累计专项附加 - 累计减除费用
  // cumulativeIncome 传入真实的累计工资（月薪 × 月份数）
  const cumulativeSalary = grossSalary * month;
  const taxResult = calculateIndividualTax(
    month,
    cumulativeSalary,
    socialResult.employee.total,
    housingResult.employeeFund,
    monthlySpecialDeduction
  );

  // 实发工资 = 税前工资 - 个人社保 - 个人公积金 - 个税
  const netSalary = Math.max(0, Math.round(
    (grossSalary - socialResult.employee.total - housingResult.employeeFund - taxResult.monthlyTax) * 100
  ) / 100);

  // 用人总成本 = 税前工资 + 公司社保 + 公司公积金
  const totalCost = Math.round(
    (grossSalary + socialResult.company.total + housingResult.companyFund) * 100
  ) / 100;

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    month,
    grossSalary,
    socialSecurity: socialResult,
    housingFund: housingResult,
    taxableIncome: taxResult.taxableIncome,
    individualTax: taxResult,
    netSalary,
    totalCost,
  };
}

/**
 * 批量计算多名员工工资
 */
export function calculateBatchSalary(
  employees: SalaryEmployee[],
  month: number
): SalarySlip[] {
  return employees.map(emp => calculateSalary(emp, month));
}

/**
 * 生成工资条摘要文本（用于AI回复展示）
 */
export function formatSalarySlipText(slip: SalarySlip): string {
  const lines = [
    `【${slip.employeeName} - ${slip.month}月工资条】`,
    `━━━━━━━━━━━━━━━━━━`,
    `税前工资：¥${slip.grossSalary.toLocaleString()}`,
    ``,
    `【五险（个人）】`,
    `  养老：¥${slip.socialSecurity.employee.pension}`,
    `  医疗：¥${slip.socialSecurity.employee.medical}`,
    `  失业：¥${slip.socialSecurity.employee.unemployment}`,
    `  个人社保合计：¥${slip.socialSecurity.employee.total}`,
    ``,
    `【公积金】`,
    `  个人缴存：¥${slip.housingFund.employeeFund}`,
    `  缴存比例：${slip.housingFund.rate}%`,
    ``,
    `【专项附加扣除】`,
    `  月度扣除：¥${slip.individualTax.monthlyDeduction.specialDeduction}`,
    ``,
    `【个税】`,
    `  适用税率：${(slip.individualTax.rate * 100).toFixed(0)}%`,
    `  当月税额：¥${slip.individualTax.monthlyTax}`,
    `  累计已预扣：¥${slip.individualTax.cumulativeTax}`,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `【实发工资】：¥${slip.netSalary.toLocaleString()}`,
    `【用人总成本】：¥${slip.totalCost.toLocaleString()}`,
    `（含公司社保¥${slip.socialSecurity.company.total} + 公积金¥${slip.housingFund.companyFund}）`,
  ];
  return lines.join('\n');
}
