/**
 * 报税日历页面
 * 月历展示 + 三级提醒（紧急/警告/提示）+ 一键算税
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, AlertCircle, Info, Calculator, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getCalendarItems } from '../api/taxCalendar';
import type { TaxCalendarItem, AlertLevel } from '../types';

const LEVEL_CONFIG: Record<AlertLevel, { icon: React.ElementType; bg: string; border: string; text: string; dot: string }> = {
  '紧急': { icon: AlertTriangle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  '警告': { icon: AlertCircle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  '提示': { icon: Info, bg: 'bg-[#F0F9F0]', border: 'border-[#C8E6C9]', text: 'text-[#07C160]', dot: 'bg-[#95EC69]' },
};

const DAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

interface TaxResult {
  revenue: number;
  deductibleCost: number;
  vat: number;
  surtax: number;
  incomeTax: number;
  totalTax: number;
  netProfit: number;
}

const DEMO_TAX_DATA: Record<string, TaxResult> = {
  '小规模纳税人': {
    revenue: 100000, deductibleCost: 40000,
    vat: 0, surtax: 0, incomeTax: 6000, totalTax: 6000, netProfit: 54000,
  },
  '一般纳税人': {
    revenue: 100000, deductibleCost: 40000,
    vat: 5640, surtax: 677, incomeTax: 10528, totalTax: 16845, netProfit: 33155,
  },
};

function calcTax(revenue: number, deductibleCost: number, taxType: string): TaxResult {
  if (taxType === '小规模纳税人') {
    const vat = revenue > 300000 ? Math.round(revenue * 0.01) : 0;
    const surtax = Math.round(vat * 0.12);
    const profit = revenue - deductibleCost - vat - surtax;
    const incomeTax = profit > 0 ? Math.round(Math.min(profit * 0.05, 10000000)) : 0;
    return { revenue, deductibleCost, vat, surtax, incomeTax, totalTax: vat + surtax + incomeTax, netProfit: profit - incomeTax };
  }
  const vat = Math.round(revenue / 1.06 * 0.06);
  const surtax = Math.round(vat * 0.12);
  const profit = revenue - deductibleCost - surtax;
  const rate = profit <= 1000000 ? 0.05 : profit <= 3000000 ? 0.10 : 0.25;
  const incomeTax = profit > 0 ? Math.round(profit * rate) : 0;
  return { revenue, deductibleCost, vat, surtax, incomeTax, totalTax: vat + surtax + incomeTax, netProfit: profit - incomeTax };
}

function TaxCalcModal({ enterprise, vouchers, onClose }: {
  enterprise: { taxType: string } | null;
  vouchers: Array<{ date: string; amount: number; status: string }>;
  onClose: () => void;
}) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const monthRevenue = vouchers
    .filter((v) => v.date.startsWith(currentMonth) && v.status === '已入账')
    .reduce((s, v) => s + v.amount, 0);
  const deductibleCost = Math.round(monthRevenue * 0.4);
  const taxType = (enterprise?.taxType as '小规模纳税人' | '一般纳税人') || '小规模纳税人';
  const taxResult = monthRevenue > 0
    ? calcTax(monthRevenue, deductibleCost, taxType)
    : DEMO_TAX_DATA[taxType];
  const isDemo = monthRevenue === 0;

  function handleDownload() {
    const lines = [
      '═══════════════════════════════════════',
      '  AICFO · 一键算税报告',
      '  ' + new Date().toLocaleDateString('zh-CN'),
      '═══════════════════════════════════════',
      '纳税人类型：' + taxType,
      '本月收入：¥' + taxResult.revenue.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
      '可抵扣成本：¥' + taxResult.deductibleCost.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
      '--- 税费明细 ---',
      '增值税：¥' + taxResult.vat.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
      '附加税：¥' + taxResult.surtax.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
      '企业所得税：¥' + taxResult.incomeTax.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
      '───────────────────────────────────────',
      '合计应缴：¥' + taxResult.totalTax.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
      '本月净利润：¥' + taxResult.netProfit.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
      '═══════════════════════════════════════',
      '由AICFO自动生成，仅供参考',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'AICFO算税报告_' + new Date().toISOString().slice(0, 10) + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-[430px] rounded-t-2xl sm:rounded-2xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator size={20} style={{ color: '#07C160' }} />
            <h2 style={{ fontWeight: 'bold', fontSize: '16px', color: '#1A1A1A' }}>一键算税</h2>
            {isDemo && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                演示数据
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F0F0F0] rounded-full">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* 税务说明 */}
        <div className="rounded-xl p-3 mb-4 text-xs" style={{ backgroundColor: '#F0F9F0', border: '1px solid #C8E6C9', color: '#07C160' }}>
          {taxType === '小规模纳税人'
            ? '💡 小规模纳税人：季度收入≤30万免税，超出部分按1%征收增值税'
            : '💡 一般纳税人：现代服务业税率6%，可抵扣进项税额'}
        </div>

        {/* 基础数据 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: '本月收入', value: taxResult.revenue, color: '#07C160' },
            { label: '可抵扣成本', value: taxResult.deductibleCost, color: '#07C160' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: '#F7F7F7', border: '1px solid #EDEDED' }}>
              <p className="text-xs mb-1" style={{ color: '#888888' }}>{label}</p>
              <p className="text-base font-bold" style={{ color }}>¥{value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
            </div>
          ))}
        </div>

        {/* 税费明细 */}
        <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #EDEDED' }}>
          <div className="px-4 py-2.5" style={{ backgroundColor: '#F7F7F7', borderBottom: '1px solid #EDEDED' }}>
            <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>本月税费估算</p>
          </div>
          {[
            { label: '增值税', value: taxResult.vat, color: '#FF9800' },
            { label: '附加税', value: taxResult.surtax, color: '#FF9800' },
            { label: '企业所得税', value: taxResult.incomeTax, color: '#E53935' },
            { label: '合计应缴', value: taxResult.totalTax, color: '#07C160', bold: true },
          ].map(({ label, value, color, bold }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #F0F0F0' }}>
              <span className="text-sm" style={{ color: '#1A1A1A', fontWeight: bold ? 'bold' : 'normal' }}>{label}</span>
              <span className="text-sm font-medium" style={{ color, fontWeight: bold ? 'bold' : 'medium' }}>
                ¥{value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>

        {/* 净利润 */}
        <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9' }}>
          <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>本月净利润</span>
          <span className="text-base font-bold" style={{ color: taxResult.netProfit >= 0 ? '#2E7D32' : '#C62828' }}>
            {taxResult.netProfit >= 0 ? '+' : ''}¥{taxResult.netProfit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 免责声明 */}
        <p className="text-xs text-center mb-3" style={{ color: '#888888', lineHeight: '1.6' }}>
          本计算结果仅供参考，实际税费以税务局申报系统为准
        </p>

        {/* 下载按钮 */}
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: '#F0F9F0', color: '#07C160', border: '1px solid #C8E6C9' }}
        >
          📥 保存到本地（.txt）
        </button>
      </div>
    </div>
  );
}

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedItem, setSelectedItem] = useState<TaxCalendarItem | null>(null);
  const [showTaxCalc, setShowTaxCalc] = useState(false);

  const { enterprise, vouchers } = useAppStore();

  const calendarItems = getCalendarItems(year, month);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const currentDate = `${year}-${String(month).padStart(2, '0')}`;
  const todayDay = today.getDate();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  function prevMonth() {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  }

  function getItemsForDay(day: number): TaxCalendarItem[] {
    const date = `${currentDate}-${String(day).padStart(2, '0')}`;
    return calendarItems.filter((i) => i.date === date);
  }

  const urgent = calendarItems.filter((i) => i.level === '紧急').length;
  const warning = calendarItems.filter((i) => i.level === '警告').length;
  const info = calendarItems.filter((i) => i.level === '提示').length;

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#F7F7F7' }}>
      {/* 头部 */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px 16px 12px', borderBottom: '1px solid #EDEDED' }}>
        <div className="flex items-center justify-between mb-3">
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1A1A1A' }}>报税日历</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs" style={{ color: '#888888' }}>{urgent}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs" style={{ color: '#888888' }}>{warning}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#07C160' }} />
              <span className="text-xs" style={{ color: '#888888' }}>{info}</span>
            </div>
          </div>
        </div>

        {/* 月份导航 */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-2 rounded-lg" style={{ backgroundColor: '#F0F0F0' }}>
            <ChevronLeft size={20} style={{ color: '#666666' }} />
          </button>
          <h2 className="font-semibold" style={{ color: '#1A1A1A' }}>{year}年{MONTHS[month - 1]}</h2>
          <button onClick={nextMonth} className="p-2 rounded-lg" style={{ backgroundColor: '#F0F0F0' }}>
            <ChevronRight size={20} style={{ color: '#666666' }} />
          </button>
        </div>

        {/* 统计指示器 */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: '紧急', count: urgent, bg: 'bg-red-50', color: '#E53935' },
            { label: '警告', count: warning, bg: 'bg-amber-50', color: '#FF9800' },
            { label: '提示', count: info, bg: 'bg-[#F0F9F0]', color: '#07C160' },
          ].map(({ label, count, bg, color }) => (
            <div key={label} className={'rounded-xl p-2.5 text-center ' + bg}>
              <p className="text-lg font-bold" style={{ color }}>{count}</p>
              <p className="text-xs" style={{ color }}>{label}</p>
            </div>
          ))}
        </div>

        {/* 星期 */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs py-1" style={{ color: '#888888' }}>{d}</div>
          ))}
        </div>
      </div>

      {/* 日期格子 */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '8px 16px 16px' }}>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={'empty-' + idx} />;
            const items = getItemsForDay(day);
            const hasUrgent = items.some((i) => i.level === '紧急');
            const hasWarning = items.some((i) => i.level === '警告');
            const hasInfo = items.some((i) => i.level === '提示');
            const isToday = isCurrentMonth && day === todayDay;
            return (
              <div
                key={day}
                className="relative flex flex-col items-center py-1.5 rounded-lg cursor-pointer"
                style={{
                  backgroundColor: isToday ? '#E8F5E9' : 'transparent',
                  border: isToday ? '1.5px solid #07C160' : '1px solid transparent',
                }}
                onClick={() => {
                  if (items.length > 0) setSelectedItem(items[0]);
                  else setSelectedItem(null);
                }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: isToday ? '#07C160' : '#1A1A1A', fontWeight: isToday ? 'bold' : 'medium' }}
                >
                  {day}
                </span>
                <div className="flex gap-0.5 mt-0.5">
                  {hasUrgent && <div className="w-1 h-1 rounded-full bg-red-500" />}
                  {hasWarning && <div className="w-1 h-1 rounded-full bg-amber-500" />}
                  {hasInfo && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#07C160' }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 申报项列表 */}
      <div style={{ padding: '16px' }}>
        <p className="text-xs mb-3 font-medium" style={{ color: '#888888' }}>本月申报事项</p>
        {calendarItems.length === 0 && (
          <div className="text-center py-8" style={{ color: '#BBBBBB' }}>
            <p className="text-4xl mb-2">📅</p>
            <p className="text-sm">本月暂无申报事项</p>
          </div>
        )}
        {calendarItems.map((item) => {
          const cfg = LEVEL_CONFIG[item.level];
          const Icon = cfg.icon;
          const dateObj = new Date(item.date);
          return (
            <div
              key={item.id}
              className={'flex items-start gap-3 rounded-xl p-4 mb-2 cursor-pointer ' + cfg.bg}
              style={{ border: '1px solid ' + cfg.border }}
              onClick={() => setSelectedItem(item)}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#FFFFFF', border: '1px solid ' + cfg.border }}>
                <Icon size={18} style={{ color: cfg.text.replace('text-', '') }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{item.title}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FFFFFF', color: cfg.text.replace('text-', ''), border: '1px solid ' + cfg.border }}>{item.level}</span>
                </div>
                <p className="text-xs" style={{ color: '#888888' }}>
                  {dateObj.getMonth() + 1}月{dateObj.getDate()}日 · {enterprise?.taxType || '小规模纳税人'}
                </p>
                {item.description && <p className="text-xs mt-1" style={{ color: '#888888' }}>{item.description}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部固定：一键算税按钮 */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 px-4 pb-4"
        style={{ background: 'linear-gradient(to top, #F7F7F7 60%, transparent)' }}
      >
        <button
          onClick={() => setShowTaxCalc(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-base shadow-lg"
          style={{ background: 'linear-gradient(135deg, #07C160 0%, #06AD56 100%)', boxShadow: '0 4px 16px rgba(7,193,96,0.35)' }}
        >
          <Calculator size={20} />
          一键算税 · 本月税费预览
        </button>
      </div>

      {/* 申报项详情面板 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setSelectedItem(null)}>
          <div className="bg-white w-full max-w-[430px] rounded-t-2xl p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const cfg = LEVEL_CONFIG[selectedItem.level];
              const Icon = cfg.icon;
              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: cfg.bg, border: '1px solid ' + cfg.border }}>
                        <Icon size={20} style={{ color: cfg.text.replace('text-', '') }} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#1A1A1A' }}>{selectedItem.title}</p>
                        <p className="text-xs" style={{ color: '#888888' }}>{enterprise?.taxType || '小规模纳税人'}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedItem(null)} className="p-1.5 rounded-full" style={{ backgroundColor: '#F0F0F0' }}>
                      <X size={16} style={{ color: '#888888' }} />
                    </button>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm"><span style={{ color: '#888888' }}>截止日期</span><span style={{ color: '#1A1A1A', fontWeight: 'medium' }}>{selectedItem.date}</span></div>
                    <div className="flex justify-between text-sm"><span style={{ color: '#888888' }}>申报类型</span><span style={{ color: '#1A1A1A' }}>{enterprise?.taxType || '小规模纳税人'}</span></div>
                    <div className="flex justify-between text-sm"><span style={{ color: '#888888' }}>紧急程度</span><span className="font-medium px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: cfg.bg, color: cfg.text.replace('text-', ''), border: '1px solid ' + cfg.border }}>{selectedItem.level}</span></div>
                    {selectedItem.description && <div className="rounded-xl p-3 text-sm" style={{ backgroundColor: cfg.bg, border: '1px solid ' + cfg.border, color: cfg.text.replace('text-', '') }}>{selectedItem.description}</div>}
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="w-full py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: '#F0F0F0', color: '#666666' }}>关闭</button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 算税弹窗 */}
      {showTaxCalc && (
        <TaxCalcModal enterprise={enterprise} vouchers={vouchers} onClose={() => setShowTaxCalc(false)} />
      )}
    </div>
  );
}
