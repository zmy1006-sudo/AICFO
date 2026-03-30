/**
 * Mock报税日历数据
 * 硬编码季度申报节点，真实数据可对接税务局API
 */

import type { TaxCalendarItem } from '../types';

// 2026年小微企业/小规模纳税人月度+季度申报日历
const MARCH_2026: TaxCalendarItem[] = [
  {
    id: 't1',
    date: '2026-03-01',
    title: '个人所得税代扣代缴',
    level: '提示',
    description: '上月个人所得税代扣代缴申报截止',
    deadline: '2026-03-15',
  },
  {
    id: 't2',
    date: '2026-03-05',
    title: '小规模纳税人增值税季报',
    level: '紧急',
    description: 'Q1增值税及附加税费季度申报截止（适用小规模纳税人）',
    deadline: '2026-03-15',
  },
  {
    id: 't3',
    date: '2026-03-10',
    title: '企业所得税季报预缴',
    level: '警告',
    description: 'Q1企业所得税预缴申报截止（法定节假日顺延至3月16日）',
    deadline: '2026-03-16',
  },
  {
    id: 't4',
    date: '2026-03-15',
    title: '社保费申报缴纳',
    level: '提示',
    description: '本月社保费申报缴纳截止日期',
    deadline: '2026-03-25',
  },
];

const APRIL_2026: TaxCalendarItem[] = [
  {
    id: 't5',
    date: '2026-04-01',
    title: '个人所得税综合所得汇算',
    level: '警告',
    description: '个人所得税年度汇算清缴开始，请企业员工及时办理',
    deadline: '2026-06-30',
  },
  {
    id: 't6',
    date: '2026-04-10',
    title: '小规模纳税人增值税月报（如需）',
    level: '提示',
    description: '小规模纳税人按月申报增值税（如属按月申报企业）',
    deadline: '2026-04-20',
  },
  {
    id: 't7',
    date: '2026-04-15',
    title: '企业所得税年报',
    level: '紧急',
    description: '企业所得税年度汇算清缴申报截止（核定征收企业）',
    deadline: '2026-05-31',
  },
];

const MAY_2026: TaxCalendarItem[] = [
  {
    id: 't8',
    date: '2026-05-01',
    title: '工商年报公示',
    level: '紧急',
    description: '企业年报公示截止，未年报将列入经营异常名录',
    deadline: '2026-06-30',
  },
  {
    id: 't9',
    date: '2026-05-15',
    title: '小规模纳税人Q1补报',
    level: '警告',
    description: 'Q1季度申报查漏补缺截止，逾期将产生滞纳金',
    deadline: '2026-05-31',
  },
];

export const TAX_CALENDAR_DATA: Record<string, TaxCalendarItem[]> = {
  '2026-03': MARCH_2026,
  '2026-04': APRIL_2026,
  '2026-05': MAY_2026,
};

export function getCalendarItems(year: number, month: number): TaxCalendarItem[] {
  const key = `${year}-${month.toString().padStart(2, '0')}`;
  return TAX_CALENDAR_DATA[key] || [];
}
