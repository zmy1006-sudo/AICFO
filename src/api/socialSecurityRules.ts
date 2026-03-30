/**
 * 社保规则引擎 (Social Security Rules)
 * 覆盖全国20+主要城市的五险缴纳规则
 * 数据来源：各城市人社局公开数据（2024年度）
 * 规则：养老/医疗/失业/工伤/生育保险
 */

import type { SocialSecurityResult } from '../types';

// ==================== 城市社保规则定义 ====================

/**
 * 社保比例结构（单位：%）
 * pension: 养老保险 | medical: 医疗保险 | unemployment: 失业保险
 * workInjury: 工伤保险 | maternity: 生育保险
 * 注意：个人缴纳部分通常从公司比例中拆分
 */
interface CitySocialSecurityRule {
  name: string; // 中文城市名
  baseMin: number; // 缴费基数下限（元/月）
  baseMax: number; // 缴费基数上限（元/月）
  // 公司缴纳比例（%）
  company: {
    pension: number;      // 养老保险
    medical: number;       // 医疗保险（含生育）
    unemployment: number; // 失业保险
    workInjury: number;   // 工伤保险
    maternity: number;    // 生育保险（部分城市已并入医疗）
  };
  // 个人缴纳比例（%）
  employee: {
    pension: number;      // 养老保险
    medical: number;      // 医疗保险
    unemployment: number; // 失业保险
  };
}

// 20+城市社保规则（2024年度）
const CITY_SOCIAL_SECURITY_RULES: Record<string, CitySocialSecurityRule> = {
  '北京': {
    name: '北京',
    baseMin: 6821,
    baseMax: 35631,
    company: { pension: 16, medical: 9.8, unemployment: 0.8, workInjury: 0.4, maternity: 0 },
    employee: { pension: 8, medical: 2, unemployment: 0.2 },
  },
  '上海': {
    name: '上海',
    baseMin: 7310,
    baseMax: 36549,
    company: { pension: 16, medical: 9.5, unemployment: 0.5, workInjury: 0.26, maternity: 1 },
    employee: { pension: 8, medical: 2, unemployment: 0.5 },
  },
  '广州': {
    name: '广州',
    baseMin: 2808,
    baseMax: 26421,
    company: { pension: 14, medical: 6.85, unemployment: 0.8, workInjury: 0.2, maternity: 0.85 },
    employee: { pension: 8, medical: 2, unemployment: 0.2 },
  },
  '深圳': {
    name: '深圳',
    baseMin: 2360,
    baseMax: 26421,
    company: { pension: 14, medical: 5.2, unemployment: 0.7, workInjury: 0.9, maternity: 0 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '成都': {
    name: '成都',
    baseMin: 4246,
    baseMax: 21228,
    company: { pension: 16, medical: 6.75, unemployment: 0.6, workInjury: 0.4, maternity: 0.8 },
    employee: { pension: 8, medical: 2, unemployment: 0.4 },
  },
  '杭州': {
    name: '杭州',
    baseMin: 4461,
    baseMax: 24060,
    company: { pension: 14, medical: 9.5, unemployment: 0.5, workInjury: 0.4, maternity: 1.2 },
    employee: { pension: 8, medical: 2, unemployment: 0.5 },
  },
  '武汉': {
    name: '武汉',
    baseMin: 3923,
    baseMax: 22470,
    company: { pension: 16, medical: 8, unemployment: 0.7, workInjury: 0.4, maternity: 0.7 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '西安': {
    name: '西安',
    baseMin: 3932,
    baseMax: 21556,
    company: { pension: 16, medical: 7, unemployment: 0.7, workInjury: 0.28, maternity: 0 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '重庆': {
    name: '重庆',
    baseMin: 4118,
    baseMax: 20587,
    company: { pension: 16, medical: 8.5, unemployment: 0.6, workInjury: 0.6, maternity: 0.7 },
    employee: { pension: 8, medical: 2, unemployment: 0.4 },
  },
  '南京': {
    name: '南京',
    baseMin: 4492,
    baseMax: 24060,
    company: { pension: 16, medical: 8.8, unemployment: 0.5, workInjury: 0.4, maternity: 0.8 },
    employee: { pension: 8, medical: 2, unemployment: 0.5 },
  },
  '苏州': {
    name: '苏州',
    baseMin: 4492,
    baseMax: 24060,
    company: { pension: 16, medical: 8, unemployment: 0.5, workInjury: 0.9, maternity: 0.8 },
    employee: { pension: 8, medical: 2, unemployment: 0.5 },
  },
  '天津': {
    name: '天津',
    baseMin: 4409,
    baseMax: 26421,
    company: { pension: 16, medical: 8.5, unemployment: 0.5, workInjury: 0.32, maternity: 0 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '长沙': {
    name: '长沙',
    baseMin: 3604,
    baseMax: 18078,
    company: { pension: 16, medical: 8.7, unemployment: 0.7, workInjury: 0.4, maternity: 0.7 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '郑州': {
    name: '郑州',
    baseMin: 3579,
    baseMax: 17880,
    company: { pension: 16, medical: 8, unemployment: 0.7, workInjury: 0.4, maternity: 0.5 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '青岛': {
    name: '青岛',
    baseMin: 4242,
    baseMax: 21228,
    company: { pension: 16, medical: 8.5, unemployment: 0.7, workInjury: 0.4, maternity: 0 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '沈阳': {
    name: '沈阳',
    baseMin: 3932,
    baseMax: 21556,
    company: { pension: 16, medical: 8.6, unemployment: 0.5, workInjury: 0.4, maternity: 0 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '大连': {
    name: '大连',
    baseMin: 3827,
    baseMax: 21048,
    company: { pension: 16, medical: 8.5, unemployment: 0.5, workInjury: 0.5, maternity: 0.75 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '福州': {
    name: '福州',
    baseMin: 4191,
    baseMax: 20955,
    company: { pension: 16, medical: 7.5, unemployment: 0.5, workInjury: 0.35, maternity: 0.7 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '厦门': {
    name: '厦门',
    baseMin: 4203,
    baseMax: 21015,
    company: { pension: 12, medical: 6.5, unemployment: 0.5, workInjury: 0.4, maternity: 0.7 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '哈尔滨': {
    name: '哈尔滨',
    baseMin: 3822,
    baseMax: 19101,
    company: { pension: 16, medical: 8.5, unemployment: 0.5, workInjury: 0.4, maternity: 0 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '昆明': {
    name: '昆明',
    baseMin: 3768,
    baseMax: 19791,
    company: { pension: 16, medical: 8.8, unemployment: 0.7, workInjury: 0.4, maternity: 0 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '合肥': {
    name: '合肥',
    baseMin: 4107,
    baseMax: 20534,
    company: { pension: 16, medical: 8.8, unemployment: 0.7, workInjury: 0.4, maternity: 1 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '南昌': {
    name: '南昌',
    baseMin: 3726,
    baseMax: 18630,
    company: { pension: 16, medical: 8.5, unemployment: 0.5, workInjury: 0.4, maternity: 0 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
  '石家庄': {
    name: '石家庄',
    baseMin: 3843,
    baseMax: 19212,
    company: { pension: 16, medical: 8.5, unemployment: 0.7, workInjury: 0.4, maternity: 0 },
    employee: { pension: 8, medical: 2, unemployment: 0.3 },
  },
};

/**
 * 计算社保缴纳金额
 * @param base - 缴费工资基数（元）
 * @param city - 城市名称（精确匹配，如"北京"）
 * @returns SocialSecurityResult 包含个人/公司各项社保明细
 */
export function calculateSocialSecurity(base: number, city: string): SocialSecurityResult {
  const rule = CITY_SOCIAL_SECURITY_RULES[city];

  if (!rule) {
    // 找不到城市，返回北京规则（默认兜底）
    console.warn(`[社保规则] 未找到城市"${city}"，使用北京规则`);
    return calculateSocialSecurity(base, '北京');
  }

  // 基数截断到上下限
  const actualBase = Math.max(rule.baseMin, Math.min(rule.baseMax, base));

  // 公司缴纳
  const companyPension = Math.round(actualBase * rule.company.pension / 100 * 100) / 100;
  const companyMedical = Math.round(actualBase * rule.company.medical / 100 * 100) / 100;
  const companyUnemployment = Math.round(actualBase * rule.company.unemployment / 100 * 100) / 100;
  const companyWorkInjury = Math.round(actualBase * rule.company.workInjury / 100 * 100) / 100;
  const companyMaternity = Math.round(actualBase * rule.company.maternity / 100 * 100) / 100;
  const companyTotal = Math.round((companyPension + companyMedical + companyUnemployment + companyWorkInjury + companyMaternity) * 100) / 100;

  // 个人缴纳
  const employeePension = Math.round(actualBase * rule.employee.pension / 100 * 100) / 100;
  const employeeMedical = Math.round(actualBase * rule.employee.medical / 100 * 100) / 100;
  const employeeUnemployment = Math.round(actualBase * rule.employee.unemployment / 100 * 100) / 100;
  const employeeTotal = Math.round((employeePension + employeeMedical + employeeUnemployment) * 100) / 100;

  return {
    city: rule.name,
    base: actualBase,
    baseMin: rule.baseMin,
    baseMax: rule.baseMax,
    company: {
      pension: companyPension,
      medical: companyMedical,
      unemployment: companyUnemployment,
      workInjury: companyWorkInjury,
      maternity: companyMaternity,
      total: companyTotal,
    },
    employee: {
      pension: employeePension,
      medical: employeeMedical,
      unemployment: employeeUnemployment,
      total: employeeTotal,
    },
    // 总社保成本（公司+个人）
    totalCost: Math.round((companyTotal + employeeTotal) * 100) / 100,
  };
}

/** 获取所有支持的城市列表 */
export function getSupportedCities(): string[] {
  return Object.keys(CITY_SOCIAL_SECURITY_RULES);
}
