/**
 * 专项附加扣除计算器 (Special Additional Deductions)
 * 依据：《个人所得税专项附加扣除暂行办法》（2019年1月1日起施行）
 *
 * 支持7项专项附加扣除：
 * 1. 子女教育 - 每个子女1000元/月
 * 2. 继续教育 - 学历400元/月 or 职业证书3600元/年
 * 3. 大病医疗 - 医保范围内自付≥15000元部分，上限8万/年
 * 4. 住房贷款利息 - 首套房1000元/月
 * 5. 住房租金 - 按城市等级600/800/1100元/月
 * 6. 赡养老人 - 独生子女2000元/月，非独均摊≤1000元/月
 * 7. 3岁以下婴幼儿照护 - 每个婴幼儿1000元/月
 */

import type { SpecialDeductionProfile } from '../types';

// ==================== 扣除标准定义 ====================

/** 子女教育：1000元/月/子女 */
const CHILD_EDUCATION_PER_CHILD = 1000;

/** 继续教育（学历教育）：400元/月 */
const CONTINUING_EDUCATION_MONTHLY = 400;

/** 继续教育（职业证书）：3600元/年 → 月均300 */
const CONTINUING_EDUCATION_CERTIFICATE = 300; // 月均

/** 大病医疗：年扣除上限80000元，门槛15000 */
const CRITICAL_ILLNESS_ANNUAL_LIMIT = 80000;
const CRITICAL_ILLNESS_THRESHOLD = 15000;

/** 住房贷款利息：1000元/月（首套房） */
const HOUSING_LOAN_MONTHLY = 1000;

/** 住房租金（按城市规模）：600/800/1100元/月 */
const RENT_CITY_TIER: Record<string, number> = {
  // 一线城市（省会和计划单列市）
  '北京': 1100, '上海': 1100, '广州': 1100, '深圳': 1100,
  '杭州': 1100, '南京': 1100, '成都': 1100, '天津': 1100,
  '重庆': 1100, '武汉': 1100, '西安': 1100, '青岛': 1100,
  '大连': 1100, '宁波': 1100, '厦门': 1100, '沈阳': 1100,
  '长沙': 1100, '郑州': 1100, '昆明': 1100, '哈尔滨': 1100,
  '福州': 1100, '济南': 1100,
  // 二线城市
  '石家庄': 800, '南昌': 800, '贵阳': 800, '南宁': 800,
  '合肥': 800, '兰州': 800, '太原': 800, '长春': 800,
  '温州': 800, '珠海': 800, '苏州': 800, '无锡': 800,
  '东莞': 800, '佛山': 800,
  // 其他城市
  '唐山': 600, '乌鲁木齐': 600, '银川': 600, '西宁': 600,
  '海口': 600, '呼和浩特': 600, '拉萨': 600,
};

/** 赡养老人：独生子女2000元/月，非独均摊≤1000 */
const ELDERLY_CARE_ONLY_CHILD = 2000;
const ELDERLY_CARE_NON_ONLY_CHILD = 1000; // 多人均摊时个人限额

/** 3岁以下婴幼儿照护：1000元/月/婴幼儿 */
const INFANT_CARE_PER_CHILD = 1000;

/**
 * 专项附加扣除档案（用户输入）
 * 所有值为月度均摊值（除大病医疗为年度外）
 */
// SpecialDeductionProfile 类型定义见 ../types/index.ts

/**
 * 获取月度专项附加扣除总额
 * @param profile - 用户专项附加扣除档案
 * @returns 月度扣除总额（元）
 */
export function getMonthlySpecialDeduction(profile: SpecialDeductionProfile): number {
  let total = 0;

  // 1. 子女教育（年满3岁子女，学前教育不可扣）
  if (profile.childrenCount && profile.childrenCount > 0) {
    const eligibleChildren = (profile.childrenAges ?? [])
      .filter(age => age >= 3) // 年满3岁（入园）才可扣除
      .length;
    // 如果没有年龄信息，默认全部可扣
    const count = profile.childrenAges ? eligibleChildren : profile.childrenCount;
    total += count * CHILD_EDUCATION_PER_CHILD;
  }

  // 2. 继续教育
  if (profile.isContinuingEducation) {
    total += CONTINUING_EDUCATION_MONTHLY;
  }
  if (profile.hasProfessionalCertificate) {
    total += CONTINUING_EDUCATION_CERTIFICATE;
  }

  // 3. 大病医疗（年扣除额/12，门槛15000以上才可扣）
  if (profile.criticalIllnessExpense && profile.criticalIllnessExpense > CRITICAL_ILLNESS_THRESHOLD) {
    const deductible = Math.min(
      profile.criticalIllnessExpense - CRITICAL_ILLNESS_THRESHOLD,
      CRITICAL_ILLNESS_ANNUAL_LIMIT
    );
    total += Math.round(deductible / 12 * 100) / 100;
  }

  // 4. 住房贷款利息（首套房，不与租金同时享受）
  if (profile.hasHousingLoan && !profile.rentCity) {
    total += HOUSING_LOAN_MONTHLY;
  }

  // 5. 住房租金（不与房贷同时享受）
  if (profile.rentCity) {
    const rentAmount = RENT_CITY_TIER[profile.rentCity] ?? 600;
    total += rentAmount;
  }

  // 6. 赡养老人
  if (profile.isOnlyChild && profile.elderlyParentsCount && profile.elderlyParentsCount > 0) {
    total += ELDERLY_CARE_ONLY_CHILD;
  } else if (!profile.isOnlyChild && profile.elderlyParentsCount && profile.elderlyParentsCount > 0) {
    // 非独，按均摊（≤1000/月）
    total += Math.min(ELDERLY_CARE_NON_ONLY_CHILD, ELDERLY_CARE_ONLY_CHILD / profile.elderlyParentsCount);
  }

  // 7. 3岁以下婴幼儿照护（2023年起新增）
  if (profile.infantsCount && profile.infantsCount > 0) {
    total += profile.infantsCount * INFANT_CARE_PER_CHILD;
  }

  return Math.round(total * 100) / 100;
}

/**
 * 获取专项附加扣除明细（用于展示）
 */
export function getSpecialDeductionDetails(profile: SpecialDeductionProfile): SpecialDeductionDetail[] {
  const details: SpecialDeductionDetail[] = [];

  // 1. 子女教育
  if (profile.childrenCount && profile.childrenCount > 0) {
    const eligibleChildren = (profile.childrenAges ?? [])
      .filter(age => age >= 3).length;
    const count = profile.childrenAges ? eligibleChildren : profile.childrenCount;
    details.push({
      name: '子女教育',
      description: `${count}名子女（满3岁）`,
      monthlyAmount: count * CHILD_EDUCATION_PER_CHILD,
    });
  }

  // 2. 继续教育
  if (profile.isContinuingEducation) {
    details.push({
      name: '继续教育（学历）',
      description: '学历教育期间',
      monthlyAmount: CONTINUING_EDUCATION_MONTHLY,
    });
  }
  if (profile.hasProfessionalCertificate) {
    details.push({
      name: '继续教育（证书）',
      description: '取得证书当年',
      monthlyAmount: CONTINUING_EDUCATION_CERTIFICATE,
    });
  }

  // 3. 大病医疗
  if (profile.criticalIllnessExpense && profile.criticalIllnessExpense > CRITICAL_ILLNESS_THRESHOLD) {
    const deductible = Math.min(
      profile.criticalIllnessExpense - CRITICAL_ILLNESS_THRESHOLD,
      CRITICAL_ILLNESS_ANNUAL_LIMIT
    );
    details.push({
      name: '大病医疗',
      description: `年度自付${profile.criticalIllnessExpense}元，扣除额${deductible}元`,
      monthlyAmount: Math.round(deductible / 12 * 100) / 100,
    });
  }

  // 4. 住房贷款
  if (profile.hasHousingLoan) {
    details.push({
      name: '住房贷款利息',
      description: '首套住房贷款',
      monthlyAmount: HOUSING_LOAN_MONTHLY,
    });
  }

  // 5. 住房租金
  if (profile.rentCity) {
    const rentAmount = RENT_CITY_TIER[profile.rentCity] ?? 600;
    details.push({
      name: '住房租金',
      description: `${profile.rentCity}`,
      monthlyAmount: rentAmount,
    });
  }

  // 6. 赡养老人
  if (profile.elderlyParentsCount && profile.elderlyParentsCount > 0) {
    details.push({
      name: '赡养老人',
      description: profile.isOnlyChild ? '独生子女' : '非独生子女均摊',
      monthlyAmount: profile.isOnlyChild ? ELDERLY_CARE_ONLY_CHILD : ELDERLY_CARE_NON_ONLY_CHILD,
    });
  }

  // 7. 婴幼儿照护
  if (profile.infantsCount && profile.infantsCount > 0) {
    details.push({
      name: '3岁以下婴幼儿照护',
      description: `${profile.infantsCount}名婴幼儿`,
      monthlyAmount: profile.infantsCount * INFANT_CARE_PER_CHILD,
    });
  }

  return details;
}

export interface SpecialDeductionDetail {
  name: string;
  description: string;
  monthlyAmount: number;
}
