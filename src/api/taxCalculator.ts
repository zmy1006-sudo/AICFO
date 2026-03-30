/**
 * 个税累计预扣法计算器 (Individual Income Tax Calculator)
 * 依据：《个人所得税法》2019年修订版，7级超额累进税率
 * 适用：居民个人工资、薪金所得
 * 方法：累计预扣法（每月单独计算，累进计税）
 *
 * 月度计算逻辑：
 * 1. 累计应税收入 = 累计税前工资 - 累计社保 - 累计公积金 - 累计专项附加扣除 - 累计减除费用（5000×月份数）
 * 2. 累计预扣税额 = 累计应税收入 × 适用税率 - 速算扣除数
 * 3. 当月税额 = 累计预扣税额 - 已预扣税额（上月）
 */

import type { TaxResult } from '../types';

// ==================== 7级超额累进税率表（2019版）====================

/**
 * 税率档次定义
 * 级数 | 应税所得额（累计）| 税率 | 速算扣除数
 * 1    | ≤36000            | 3%   | 0
 * 2    | 36000~144000      | 10%  | 2520
 * 3    | 144000~300000     | 20%  | 16920
 * 4    | 300000~420000     | 25%  | 31920
 * 5    | 420000~660000     | 30%  | 52920
 * 6    | 660000~960000     | 35%  | 85920
 * 7    | >960000           | 45%  | 181920
 */
const TAX_BRACKETS = [
  { max: 36000,    rate: 0.03, deduction: 0 },
  { max: 144000,   rate: 0.10, deduction: 2520 },
  { max: 300000,    rate: 0.20, deduction: 16920 },
  { max: 420000,    rate: 0.25, deduction: 31920 },
  { max: 660000,    rate: 0.30, deduction: 52920 },
  { max: 960000,    rate: 0.35, deduction: 85920 },
  { max: Infinity,  rate: 0.45, deduction: 181920 },
] as const;

/** 每月基本减除费用（5000元） */
const MONTHLY_DEDUCTION = 5000;

/**
 * 根据累计应税所得额查找适用税率档次
 */
function findTaxBracket(taxableIncome: number): { rate: number; deduction: number } {
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= bracket.max) {
      return { rate: bracket.rate, deduction: bracket.deduction };
    }
  }
  // 兜底（理论上不会到这里）
  return { rate: 0.45, deduction: 181920 };
}

/**
 * 计算个税累计预扣税额
 * @param month - 当前月份（1-12）
 * @param cumulativeIncome - 累计税前工资收入（元）
 * @param social - 当月社保个人缴纳金额（元），累计需在调用方累加
 * @param housing - 当月公积金个人缴纳金额（元），累计需在调用方累加
 * @param specialDeductions - 当月专项附加扣除金额（月度，元）
 *        7项合计月度金额，由 getMonthlySpecialDeduction() 计算
 * @returns TaxResult 包含当月税额、累计税额、税率等
 *
 * @example
 * // 第3个月，累计收入3万，社保月600，公积金月500，专项附加月2000
 * const result = calculateIndividualTax(3, 30000, 600, 500, 2000);
 */
export function calculateIndividualTax(
  month: number,
  cumulativeIncome: number,
  social: number,
  housing: number,
  specialDeductions: number
): TaxResult {
  // 参数校验
  const validMonth = Math.max(1, Math.min(12, Math.floor(month)));

  // 累计减除费用 = 5000 × 月份数
  const cumulativeDeduction = MONTHLY_DEDUCTION * validMonth;

  // 累计专项附加扣除（按月传入，已是月金额）
  const cumulativeSpecial = specialDeductions * validMonth;

  // 累计社保公积金（当月数据×月份数，因为传入的是月度值）
  const cumulativeSocial = social * validMonth;
  const cumulativeHousing = housing * validMonth;

  // 累计应税所得额
  const taxableIncome = Math.max(
    0,
    cumulativeIncome - cumulativeDeduction - cumulativeSocial - cumulativeHousing - cumulativeSpecial
  );

  // 查找税率档次
  const { rate, deduction } = findTaxBracket(taxableIncome);

  // 累计预扣总税额
  const cumulativeTax = Math.max(0, taxableIncome * rate - deduction);

  // 累进计算当月应纳税额
  // = 累计应税收入×税率-速算扣除 - 已预扣税额（上月）
  const prevMonth = validMonth - 1;
  let prevCumulativeTax = 0;
  if (prevMonth > 0) {
    const prevTaxable = Math.max(
      0,
      cumulativeIncome / validMonth * prevMonth
        - MONTHLY_DEDUCTION * prevMonth
        - social * prevMonth
        - housing * prevMonth
        - specialDeductions * prevMonth
    );
    const prevBracket = findTaxBracket(prevTaxable);
    prevCumulativeTax = Math.max(0, prevTaxable * prevBracket.rate - prevBracket.deduction);
  }

  // 当月税额 = 累计税额 - 已预扣税额
  const monthlyTax = Math.max(0, Math.round((cumulativeTax - prevCumulativeTax) * 100) / 100);

  return {
    month: validMonth,
    cumulativeIncome: Math.round(cumulativeIncome * 100) / 100,
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    rate,
    monthlyTax,
    cumulativeTax: Math.round(cumulativeTax * 100) / 100,
    // 月度明细（用于展示）
    monthlyDeduction: {
      basicDeduction: MONTHLY_DEDUCTION,
      socialSecurity: social,
      housingFund: housing,
      specialDeduction: specialDeductions,
    },
  };
}

/**
 * 简化版：直接计算单月税额（不累进）
 * 用于快速估算，不考虑累计预扣法
 */
export function quickTaxEstimate(
  monthlyIncome: number,
  social: number,
  housing: number,
  specialDeductions: number
): number {
  const taxable = Math.max(0, monthlyIncome - MONTHLY_DEDUCTION - social - housing - specialDeductions);
  const { rate, deduction } = findTaxBracket(taxable);
  return Math.max(0, Math.round((taxable * rate - deduction / 12) * 100) / 100);
}

/** 获取税率表（用于展示） */
export function getTaxBracketsInfo(): Array<{ level: number; range: string; rate: number; deduction: number }> {
  return [
    { level: 1, range: '≤36,000元',   rate: 0.03, deduction: 0 },
    { level: 2, range: '36,000~144,000元', rate: 0.10, deduction: 2520 },
    { level: 3, range: '144,000~300,000元', rate: 0.20, deduction: 16920 },
    { level: 4, range: '300,000~420,000元', rate: 0.25, deduction: 31920 },
    { level: 5, range: '420,000~660,000元', rate: 0.30, deduction: 52920 },
    { level: 6, range: '660,000~960,000元', rate: 0.35, deduction: 85920 },
    { level: 7, range: '>960,000元',   rate: 0.45, deduction: 181920 },
  ];
}
