/**
 * 公积金规则引擎 (Housing Fund Rules)
 * 覆盖全国20+主要城市的公积金缴存规则
 * 数据来源：各城市住房公积金管理中心（2024年度）
 * 缴存比例：5%~12%（单位和职工各承担一半）
 */

import type { HousingFundResult } from '../types';

// ==================== 城市公积金规则定义 ====================

/**
 * 公积金规则结构
 * rate: 缴存比例（%），默认10%
 */
interface CityHousingFundRule {
  name: string; // 中文城市名
  baseMin: number; // 缴存基数下限（元/月）
  baseMax: number; // 缴存基数上限（元/月）
  // 默认缴存比例（%）
  defaultRate: number;
  // 允许的比例区间（%）
  rateRange: { min: number; max: number };
}

// 20+城市公积金规则（2024年度）
const CITY_HOUSING_FUND_RULES: Record<string, CityHousingFundRule> = {
  '北京': {
    name: '北京',
    baseMin: 2500,
    baseMax: 33891,
    defaultRate: 12,
    rateRange: { min: 5, max: 12 },
  },
  '上海': {
    name: '上海',
    baseMin: 2500,
    baseMax: 36900,
    defaultRate: 7,
    rateRange: { min: 5, max: 12 },
  },
  '广州': {
    name: '广州',
    baseMin: 2300,
    baseMax: 39511,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
  '深圳': {
    name: '深圳',
    baseMin: 2360,
    baseMax: 41176,
    defaultRate: 12,
    rateRange: { min: 5, max: 12 },
  },
  '成都': {
    name: '成都',
    baseMin: 2100,
    baseMax: 27790,
    defaultRate: 12,
    rateRange: { min: 5, max: 12 },
  },
  '杭州': {
    name: '杭州',
    baseMin: 2280,
    baseMax: 35045,
    defaultRate: 12,
    rateRange: { min: 5, max: 12 },
  },
  '武汉': {
    name: '武汉',
    baseMin: 2010,
    baseMax: 26820,
    defaultRate: 8,
    rateRange: { min: 5, max: 12 },
  },
  '西安': {
    name: '西安',
    baseMin: 1950,
    baseMax: 27787,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
  '重庆': {
    name: '重庆',
    baseMin: 2100,
    baseMax: 27057,
    defaultRate: 12,
    rateRange: { min: 5, max: 12 },
  },
  '南京': {
    name: '南京',
    baseMin: 2280,
    baseMax: 38400,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
  '苏州': {
    name: '苏州',
    baseMin: 2280,
    baseMax: 38400,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
  '天津': {
    name: '天津',
    baseMin: 2320,
    baseMax: 36921,
    defaultRate: 11,
    rateRange: { min: 5, max: 12 },
  },
  '长沙': {
    name: '长沙',
    baseMin: 1930,
    baseMax: 27057,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
  '郑州': {
    name: '郑州',
    baseMin: 2000,
    baseMax: 25182,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
  '青岛': {
    name: '青岛',
    baseMin: 2100,
    baseMax: 29754,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
  '沈阳': {
    name: '沈阳',
    baseMin: 2100,
    baseMax: 26098,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
  '大连': {
    name: '大连',
    baseMin: 2100,
    baseMax: 31416,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
  '福州': {
    name: '福州',
    baseMin: 1960,
    baseMax: 26262,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
  '厦门': {
    name: '厦门',
    baseMin: 2030,
    baseMax: 28053,
    defaultRate: 12,
    rateRange: { min: 5, max: 12 },
  },
  '哈尔滨': {
    name: '哈尔滨',
    baseMin: 2100,
    baseMax: 26154,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
  '昆明': {
    name: '昆明',
    baseMin: 1900,
    baseMax: 28077,
    defaultRate: 12,
    rateRange: { min: 5, max: 12 },
  },
  '合肥': {
    name: '合肥',
    baseMin: 2060,
    baseMax: 26182,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
  '南昌': {
    name: '南昌',
    baseMin: 1900,
    baseMax: 25073,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
  '石家庄': {
    name: '石家庄',
    baseMin: 2000,
    baseMax: 22310,
    defaultRate: 10,
    rateRange: { min: 5, max: 12 },
  },
};

/**
 * 计算公积金缴存金额
 * @param base - 缴存工资基数（元）
 * @param city - 城市名称（精确匹配）
 * @param rate - 缴存比例（%），不填则使用城市默认值
 * @returns HousingFundResult 包含个人/公司缴存明细
 */
export function calculateHousingFund(
  base: number,
  city: string,
  rate?: number
): HousingFundResult {
  const rule = CITY_HOUSING_FUND_RULES[city];

  if (!rule) {
    // 找不到城市，使用北京规则兜底
    console.warn(`[公积金规则] 未找到城市"${city}"，使用北京规则`);
    return calculateHousingFund(base, '北京', rate);
  }

  // 基数截断
  const actualBase = Math.max(rule.baseMin, Math.min(rule.baseMax, base));

  // 比例：优先使用传入值，否则使用城市默认值
  let actualRate: number;
  if (rate !== undefined && rate >= rule.rateRange.min && rate <= rule.rateRange.max) {
    actualRate = rate;
  } else if (rate !== undefined) {
    // 超出范围，截断到合法区间
    actualRate = Math.max(rule.rateRange.min, Math.min(rule.rateRange.max, rate));
    console.warn(`[公积金规则] 比例${rate}%超出合法区间，已截断为${actualRate}%`);
  } else {
    actualRate = rule.defaultRate;
  }

  // 个人缴存 = 缴存基数 × 缴存比例
  const employeeFund = Math.round(actualBase * actualRate / 100 * 100) / 100;
  // 公司缴存 = 同上（公积金公司和个人同比例）
  const companyFund = employeeFund;
  const totalFund = Math.round((employeeFund + companyFund) * 100) / 100;

  return {
    city: rule.name,
    base: actualBase,
    baseMin: rule.baseMin,
    baseMax: rule.baseMax,
    rate: actualRate,
    employeeFund,
    companyFund,
    totalFund,
  };
}

/** 获取所有支持的城市列表 */
export function getHousingFundSupportedCities(): string[] {
  return Object.keys(CITY_HOUSING_FUND_RULES);
}
