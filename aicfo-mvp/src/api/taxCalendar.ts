/**
 * Mock报税日历数据
 * 硬编码季度申报节点，真实数据可对接税务局API
 */

import type { TaxCalendarItem } from '../types';

// 2026年全年小微企业/小规模纳税人月度+季度申报日历
const JAN_2026: TaxCalendarItem[] = [
  { id: 't-001', date: '2026-01-01', title: '新年', level: '提示', description: '元旦假期', deadline: '2026-01-01' },
  { id: 't-002', date: '2026-01-15', title: '个人所得税代扣代缴', level: '提示', description: '上月个人所得税代扣代缴申报截止', deadline: '2026-01-15' },
  { id: 't-003', date: '2026-01-20', title: '小规模纳税人增值税月报', level: '提示', description: '上月增值税及附加税费申报截止', deadline: '2026-01-20' },
];

const FEB_2026: TaxCalendarItem[] = [
  { id: 't-004', date: '2026-02-01', title: '春节假期', level: '提示', description: '农历新年假期', deadline: '2026-02-17' },
  { id: 't-005', date: '2026-02-15', title: '个人所得税代扣代缴', level: '提示', description: '上月个人所得税代扣代缴申报截止', deadline: '2026-02-20' },
  { id: 't-006', date: '2026-02-20', title: '小规模纳税人增值税月报', level: '提示', description: '上月增值税及附加税费申报截止', deadline: '2026-02-20' },
];

const MAR_2026: TaxCalendarItem[] = [
  { id: 't1', date: '2026-03-01', title: '个人所得税代扣代缴', level: '提示', description: '上月个人所得税代扣代缴申报截止', deadline: '2026-03-15' },
  { id: 't2', date: '2026-03-05', title: '小规模纳税人增值税季报', level: '紧急', description: 'Q1增值税及附加税费季度申报截止（适用小规模纳税人）', deadline: '2026-03-15' },
  { id: 't3', date: '2026-03-10', title: '企业所得税季报预缴', level: '警告', description: 'Q1企业所得税预缴申报截止（法定节假日顺延至3月16日）', deadline: '2026-03-16' },
  { id: 't4', date: '2026-03-15', title: '社保费申报缴纳', level: '提示', description: '本月社保费申报缴纳截止日期', deadline: '2026-03-25' },
];

const APR_2026: TaxCalendarItem[] = [
  { id: 't5', date: '2026-04-01', title: '个人所得税综合所得汇算', level: '警告', description: '个人所得税年度汇算清缴开始，请企业员工及时办理', deadline: '2026-06-30' },
  { id: 't6', date: '2026-04-10', title: '小规模纳税人增值税月报（如需）', level: '提示', description: '小规模纳税人按月申报增值税（如属按月申报企业）', deadline: '2026-04-20' },
  { id: 't7', date: '2026-04-15', title: '企业所得税年报', level: '紧急', description: '企业所得税年度汇算清缴申报截止（核定征收企业）', deadline: '2026-05-31' },
];

const MAY_2026: TaxCalendarItem[] = [
  { id: 't8', date: '2026-05-01', title: '劳动节', level: '提示', description: '劳动节假期', deadline: '2026-05-01' },
  { id: 't9', date: '2026-05-01', title: '工商年报公示', level: '紧急', description: '企业年报公示截止，未年报将列入经营异常名录', deadline: '2026-06-30' },
  { id: 't10', date: '2026-05-15', title: '小规模纳税人Q1补报', level: '警告', description: 'Q1季度申报查漏补缺截止，逾期将产生滞纳金', deadline: '2026-05-31' },
  { id: 't11', date: '2026-05-15', title: '个人所得税代扣代缴', level: '提示', description: '上月个人所得税代扣代缴申报截止', deadline: '2026-05-15' },
];

const JUN_2026: TaxCalendarItem[] = [
  { id: 't12', date: '2026-06-01', title: '儿童节', level: '提示', description: '儿童节假期', deadline: '2026-06-01' },
  { id: 't13', date: '2026-06-15', title: '个人所得税代扣代缴', level: '提示', description: '上月个人所得税代扣代缴申报截止', deadline: '2026-06-15' },
  { id: 't14', date: '2026-06-15', title: '小规模纳税人Q2增值税季报', level: '紧急', description: 'Q2增值税及附加税费季度申报截止', deadline: '2026-06-15' },
  { id: 't15', date: '2026-06-30', title: '个人所得税综合所得汇算截止', level: '紧急', description: '个人所得税年度汇算清缴截止，逾期需办理补税或退税', deadline: '2026-06-30' },
];

const JUL_2026: TaxCalendarItem[] = [
  { id: 't16', date: '2026-07-01', title: '建党纪念日', level: '提示', description: '建党节', deadline: '2026-07-01' },
  { id: 't17', date: '2026-07-15', title: '个人所得税代扣代缴', level: '提示', description: '上月个人所得税代扣代缴申报截止', deadline: '2026-07-15' },
  { id: 't18', date: '2026-07-20', title: '小规模纳税人增值税月报（如需）', level: '提示', description: '小规模纳税人按月申报增值税（如属按月申报企业）', deadline: '2026-07-20' },
];

const AUG_2026: TaxCalendarItem[] = [
  { id: 't19', date: '2026-08-01', title: '建军节', level: '提示', description: '八一建军节', deadline: '2026-08-01' },
  { id: 't20', date: '2026-08-15', title: '个人所得税代扣代缴', level: '提示', description: '上月个人所得税代扣代缴申报截止', deadline: '2026-08-15' },
  { id: 't21', date: '2026-08-20', title: '小规模纳税人增值税月报（如需）', level: '提示', description: '小规模纳税人按月申报增值税（如属按月申报企业）', deadline: '2026-08-20' },
];

const SEP_2026: TaxCalendarItem[] = [
  { id: 't22', date: '2026-09-01', title: '抗战胜利纪念日', level: '提示', description: '抗日战争胜利纪念日', deadline: '2026-09-03' },
  { id: 't23', date: '2026-09-15', title: '个人所得税代扣代缴', level: '提示', description: '上月个人所得税代扣代缴申报截止', deadline: '2026-09-15' },
  { id: 't24', date: '2026-09-15', title: '小规模纳税人Q3增值税季报', level: '紧急', description: 'Q3增值税及附加税费季度申报截止', deadline: '2026-09-15' },
  { id: 't25', date: '2026-09-15', title: '企业所得税Q3季报预缴', level: '警告', description: 'Q3企业所得税预缴申报截止', deadline: '2026-09-15' },
  { id: 't26', date: '2026-09-25', title: '社保费申报缴纳', level: '提示', description: '本月社保费申报缴纳截止日期', deadline: '2026-09-25' },
];

const OCT_2026: TaxCalendarItem[] = [
  { id: 't27', date: '2026-10-01', title: '国庆节', level: '提示', description: '国庆节假期', deadline: '2026-10-08' },
  { id: 't28', date: '2026-10-15', title: '个人所得税代扣代缴', level: '提示', description: '上月个人所得税代扣代缴申报截止', deadline: '2026-10-15' },
  { id: 't29', date: '2026-10-20', title: '小规模纳税人增值税月报（如需）', level: '提示', description: '小规模纳税人按月申报增值税（如属按月申报企业）', deadline: '2026-10-20' },
];

const NOV_2026: TaxCalendarItem[] = [
  { id: 't30', date: '2026-11-01', title: '辛亥革命纪念日', level: '提示', description: '辛亥革命纪念日', deadline: '2026-11-10' },
  { id: 't31', date: '2026-11-15', title: '个人所得税代扣代缴', level: '提示', description: '上月个人所得税代扣代缴申报截止', deadline: '2026-11-15' },
  { id: 't32', date: '2026-11-20', title: '小规模纳税人增值税月报（如需）', level: '提示', description: '小规模纳税人按月申报增值税（如属按月申报企业）', deadline: '2026-11-20' },
];

const DEC_2026: TaxCalendarItem[] = [
  { id: 't33', date: '2026-12-01', title: '宪法纪念日', level: '提示', description: '国家宪法日', deadline: '2026-12-04' },
  { id: 't34', date: '2026-12-15', title: '个人所得税代扣代缴', level: '提示', description: '上月个人所得税代扣代缴申报截止', deadline: '2026-12-15' },
  { id: 't35', date: '2026-12-15', title: '小规模纳税人Q4增值税季报', level: '紧急', description: 'Q4增值税及附加税费季度申报截止', deadline: '2026-12-15' },
  { id: 't36', date: '2026-12-15', title: '企业所得税Q4及年度预缴', level: '警告', description: 'Q4企业所得税预缴及年度汇算清缴', deadline: '2026-12-15' },
  { id: 't37', date: '2026-12-25', title: '社保费申报缴纳', level: '提示', description: '本月社保费申报缴纳截止日期', deadline: '2026-12-25' },
  { id: 't38', date: '2026-12-31', title: '年度关账', level: '警告', description: '年度财务关账，请确保所有凭证已入账', deadline: '2026-12-31' },
];

export const TAX_CALENDAR_DATA: Record<string, TaxCalendarItem[]> = {
  '2026-01': JAN_2026,
  '2026-02': FEB_2026,
  '2026-03': MAR_2026,
  '2026-04': APR_2026,
  '2026-05': MAY_2026,
  '2026-06': JUN_2026,
  '2026-07': JUL_2026,
  '2026-08': AUG_2026,
  '2026-09': SEP_2026,
  '2026-10': OCT_2026,
  '2026-11': NOV_2026,
  '2026-12': DEC_2026,
};

export function getCalendarItems(year: number, month: number): TaxCalendarItem[] {
  const key = `${year}-${month.toString().padStart(2, '0')}`;
  return TAX_CALENDAR_DATA[key] || [];
}

export function getUpcomingDeadlines(year: number, month: number, limit: number = 5): TaxCalendarItem[] {
  const current = new Date(year, month - 1, 1);
  const items: TaxCalendarItem[] = [];

  for (let i = 0; i < 12 && items.length < limit; i++) {
    const m = new Date(current.getFullYear(), current.getMonth() + i, 1);
    const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
    const monthItems = TAX_CALENDAR_DATA[key] || [];
    items.push(...monthItems.filter((item) => item.level === '紧急' || item.level === '警告'));
  }

  return items.slice(0, limit);
}
