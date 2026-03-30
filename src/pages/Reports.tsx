/**
 * 财务报表页面 V2 — 可视化增强版
 * 图表：水平条（资产负债表）+ 柱状+折线（利润趋势）+ 柱状（现金流量）
 */

import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, LabelList,
  ComposedChart, Line, Area,
} from 'recharts';

// ==================== 数据定义 ====================

const BALANCE_ITEMS = [
  { label: '货币资金', value: 856000, color: '#4CAF50' },
  { label: '应收账款', value: 320000, color: '#66BB6A' },
  { label: '预付账款', value: 85000, color: '#81C784' },
  { label: '其他应收款', value: 42000, color: '#A5D6A7' },
  { label: '固定资产净值', value: 1020000, color: '#388E3C' },
];

const BALANCE_SUMMARY = [
  { name: '资产合计', value: 2304000, fill: '#07C160' },
  { name: '负债合计', value: 283000, fill: '#FF9800' },
  { name: '所有者权益', value: 2021000, fill: '#8B5CF6' },
];

const PROFIT_TREND = [
  { month: '10月', revenue: 680000, expense: 408000, profit: 272000 },
  { month: '11月', revenue: 720000, expense: 432000, profit: 288000 },
  { month: '12月', revenue: 810000, expense: 486000, profit: 324000 },
  { month: '1月', revenue: 850000, expense: 510000, profit: 340000 },
  { month: '2月', revenue: 790000, expense: 474000, profit: 316000 },
  { month: '3月', revenue: 850000, expense: 510000, profit: 340000 },
];

const PROFIT_ITEMS = [
  { label: '营业收入', value: 850000, color: '#07C160' },
  { label: '营业成本', value: 490000, color: '#EF5350' },
  { label: '税金及附加', value: 8500, color: '#EF5350' },
  { label: '销售费用', value: 68000, color: '#FF9800' },
  { label: '管理费用', value: 95000, color: '#FF9800' },
  { label: '财务费用', value: 12000, color: '#FF9800' },
  { label: '营业利润', value: 176500, color: '#07C160' },
  { label: '所得税', value: 23775, color: '#EF5350' },
  { label: '净利润', value: 152725, color: '#2E7D32' },
];

const CASHFLOW_DATA = [
  { name: '销售收现', value: 900000, pos: true },
  { name: '其他收现', value: 15000, pos: true },
  { name: '采购付款', value: -380000, pos: false },
  { name: '薪酬支付', value: -180000, pos: false },
  { name: '税费支出', value: -65000, pos: false },
  { name: '经营净额', value: 248000, pos: true },
  { name: '投资净额', value: -112000, pos: false },
  { name: '筹资净额', value: 470000, pos: true },
];

// ==================== 工具 ====================

function fmt(n: number) {
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return n.toLocaleString('zh-CN');
}
function fmtFull(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
}
function fmtRow(n: number) {
  return n < 0 ? `-¥${fmtFull(Math.abs(n))}` : `¥${fmtFull(n)}`;
}

// ==================== Tooltip ====================
function ChtTip({ active, payload, label }: { active?: boolean; payload?: { value: number; fill?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value ?? 0;
  return (
    <div className="bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100 text-sm z-50">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="font-bold" style={{ color: payload[0]?.fill || '#07C160' }}>
        ¥{Math.abs(v).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        {v < 0 ? '（支出）' : ''}
      </p>
    </div>
  );
}

// ==================== 图表组件 ====================

// 资产构成水平条形图
function BalanceAssetBars() {
  const max = Math.max(...BALANCE_ITEMS.map((i) => i.value)) * 1.15;
  return (
    <div className="bg-white rounded-2xl p-4 mb-3" style={{ border: '1px solid #EDEDED' }}>
      <p className="text-sm font-bold mb-1" style={{ color: '#1A1A1A' }}>资产构成图</p>
      <p className="text-xs mb-3" style={{ color: '#888888' }}>2026年3月 · 金额单位：元</p>
      {/* @ts-ignore */}
      <ResponsiveContainer width="100%" height={220}>
        {/* @ts-ignore */}
        <BarChart data={BALANCE_ITEMS} layout="vertical" margin={{ left: 10, right: 60, top: 5, bottom: 5 }}>
          {/* @ts-ignore */}
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F0F0" />
          {/* @ts-ignore */}
          <XAxis type="number" domain={[0, max]} tickFormatter={fmt} tick={{ fontSize: 10, fill: '#888888' }} />
          {/* @ts-ignore */}
          <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#555' }} width={80} />
          {/* @ts-ignore */}
          <Tooltip content={<ChtTip />} />
          {/* @ts-ignore */}
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {BALANCE_ITEMS.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            <LabelList dataKey="value" position="right" formatter={fmt} tick={{ fontSize: 10, fill: '#888888' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 资产负债权益三栏对比
function BalanceSummaryChart() {
  return (
    <div className="bg-white rounded-2xl p-4 mb-3" style={{ border: '1px solid #EDEDED' }}>
      <p className="text-sm font-bold mb-3" style={{ color: '#1A1A1A' }}>资产负债权益对比</p>
      {/* @ts-ignore */}
      <ResponsiveContainer width="100%" height={160}>
        {/* @ts-ignore */}
        <BarChart data={BALANCE_SUMMARY} margin={{ left: 0, right: 16, top: 20, bottom: 5 }}>
          {/* @ts-ignore */}
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          {/* @ts-ignore */}
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#555' }} />
          {/* @ts-ignore */}
          <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#888888' }} width={60} />
          {/* @ts-ignore */}
          <Tooltip content={<ChtTip />} />
          {/* @ts-ignore */}
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {BALANCE_SUMMARY.map((_, i) => <Cell key={i} fill={BALANCE_SUMMARY[i].fill} />)}
            <LabelList dataKey="value" position="top" formatter={fmt} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 月度利润趋势（柱状+折线）
function ProfitTrendChart() {
  return (
    <div className="bg-white rounded-2xl p-4 mb-3" style={{ border: '1px solid #EDEDED' }}>
      <p className="text-sm font-bold mb-1" style={{ color: '#1A1A1A' }}>月度利润趋势</p>
      <p className="text-xs mb-2" style={{ color: '#888888' }}>近6个月 · 金额单位：元</p>
      {/* @ts-ignore */}
      <ResponsiveContainer width="100%" height={190}>
        {/* @ts-ignore */}
        <ComposedChart data={PROFIT_TREND} margin={{ left: 0, right: 16, top: 10, bottom: 5 }}>
          {/* @ts-ignore */}
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          {/* @ts-ignore */}
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888888' }} />
          {/* @ts-ignore */}
          <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#888888' }} width={55} />
          {/* @ts-ignore */}
          <Tooltip content={<ChtTip />} />
          {/* @ts-ignore */}
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {/* @ts-ignore */}
          <Bar dataKey="revenue" name="营业收入" fill="#4CAF50" radius={[4, 4, 0, 0]} />
          {/* @ts-ignore */}
          <Bar dataKey="expense" name="营业成本" fill="#EF5350" radius={[4, 4, 0, 0]} />
          {/* @ts-ignore */}
          <Line type="monotone" dataKey="profit" name="净利润" stroke="#07C160" strokeWidth={2.5} dot={{ r: 4, fill: '#07C160' }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-2">
        <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm inline-block" style={{ background: '#4CAF50' }} /><span className="text-xs" style={{ color: '#888' }}>营业收入</span></span>
        <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm inline-block" style={{ background: '#EF5350' }} /><span className="text-xs" style={{ color: '#888' }}>营业成本</span></span>
        <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-full inline-block" style={{ background: '#07C160' }} /><span className="text-xs" style={{ color: '#888' }}>净利润</span></span>
      </div>
    </div>
  );
}

// 利润结构分析
function ProfitBreakdownChart() {
  return (
    <div className="bg-white rounded-2xl p-4 mb-3" style={{ border: '1px solid #EDEDED' }}>
      <p className="text-sm font-bold mb-3" style={{ color: '#1A1A1A' }}>利润结构分析</p>
      {/* @ts-ignore */}
      <ResponsiveContainer width="100%" height={200}>
        {/* @ts-ignore */}
        <BarChart data={PROFIT_ITEMS} margin={{ left: 0, right: 16, top: 10, bottom: 20 }}>
          {/* @ts-ignore */}
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          {/* @ts-ignore */}
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#555' }} interval={0} angle={-20} textAnchor="end" />
          {/* @ts-ignore */}
          <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#888888' }} width={55} />
          {/* @ts-ignore */}
          <Tooltip content={<ChtTip />} />
          {/* @ts-ignore */}
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {PROFIT_ITEMS.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 净利润率趋势
function ProfitRateChart() {
  const data = PROFIT_TREND.map((d) => ({ month: d.month, rate: parseFloat((d.profit / d.revenue * 100).toFixed(1)) }));
  const avg = parseFloat((data.reduce((s, d) => s + d.rate, 0) / data.length).toFixed(1));
  return (
    <div className="bg-white rounded-2xl p-4 mb-3" style={{ border: '1px solid #EDEDED' }}>
      <p className="text-sm font-bold mb-1" style={{ color: '#1A1A1A' }}>净利润率趋势</p>
      <p className="text-xs mb-3" style={{ color: '#888888' }}>净利润 ÷ 营业收入 × 100%</p>
      {/* @ts-ignore */}
      <ResponsiveContainer width="100%" height={150}>
        {/* @ts-ignore */}
        <ComposedChart data={data} margin={{ left: 0, right: 16, top: 10, bottom: 5 }}>
          {/* @ts-ignore */}
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          {/* @ts-ignore */}
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888888' }} />
          {/* @ts-ignore */}
          <YAxis tickFormatter={(v: number) => `${v}%`} domain={[0, 50]} tick={{ fontSize: 10, fill: '#888888' }} width={40} />
          {/* @ts-ignore */}
          <Tooltip formatter={(v: number) => [`${v}%`, '净利润率']} />
          {/* @ts-ignore */}
          <Area type="monotone" dataKey="rate" fill="rgba(7,193,96,0.15)" stroke="#07C160" strokeWidth={2} dot={{ r: 4, fill: '#07C160' }} />
          {/* @ts-ignore */}
          <Line type="monotone" dataKey="rate" stroke="#07C160" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="text-center text-xs" style={{ color: '#888888' }}>
        平均净利润率 <span className="font-bold" style={{ color: '#07C160' }}>{avg}%</span>
      </p>
    </div>
  );
}

// 现金流量分析
function CashFlowBarChart() {
  return (
    <div className="bg-white rounded-2xl p-4 mb-3" style={{ border: '1px solid #EDEDED' }}>
      <p className="text-sm font-bold mb-1" style={{ color: '#1A1A1A' }}>现金流量分析</p>
      <p className="text-xs mb-3" style={{ color: '#888888' }}>2026年Q1 · 绿色=流入 红色=流出</p>
      {/* @ts-ignore */}
      <ResponsiveContainer width="100%" height={220}>
        {/* @ts-ignore */}
        <BarChart data={CASHFLOW_DATA} margin={{ left: 0, right: 16, top: 10, bottom: 25 }}>
          {/* @ts-ignore */}
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          {/* @ts-ignore */}
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#555' }} interval={0} angle={-25} textAnchor="end" />
          {/* @ts-ignore */}
          <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#888888' }} width={60} />
          {/* @ts-ignore */}
          <Tooltip content={<ChtTip />} />
          {/* @ts-ignore */}
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {CASHFLOW_DATA.map((entry, i) => <Cell key={i} fill={entry.pos ? '#07C160' : '#EF5350'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-1">
        <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm inline-block" style={{ background: '#07C160' }} /><span className="text-xs" style={{ color: '#888' }}>流入</span></span>
        <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm inline-block" style={{ background: '#EF5350' }} /><span className="text-xs" style={{ color: '#888' }}>流出</span></span>
      </div>
    </div>
  );
}

// 三大活动净额对比
function NetCashFlowChart() {
  const data = [
    { name: '经营活动', value: 248000, fill: '#07C160' },
    { name: '投资活动', value: -112000, fill: '#EF5350' },
    { name: '筹资活动', value: 470000, fill: '#8B5CF6' },
  ];
  return (
    <div className="bg-white rounded-2xl p-4 mb-3" style={{ border: '1px solid #EDEDED' }}>
      <p className="text-sm font-bold mb-3" style={{ color: '#1A1A1A' }}>三大活动净额对比</p>
      {/* @ts-ignore */}
      <ResponsiveContainer width="100%" height={140}>
        {/* @ts-ignore */}
        <BarChart data={data} margin={{ left: 20, right: 20, top: 10, bottom: 5 }}>
          {/* @ts-ignore */}
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          {/* @ts-ignore */}
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#555' }} />
          {/* @ts-ignore */}
          <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#888888' }} width={60} />
          {/* @ts-ignore */}
          <Tooltip content={<ChtTip />} />
          {/* @ts-ignore */}
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {data.map((d) => (
          <div key={d.name} className="rounded-xl p-2 text-center" style={{ backgroundColor: '#F7F7F7', border: `1px solid ${d.fill}22` }}>
            <p className="text-xs" style={{ color: '#888' }}>{d.name}</p>
            <p className="font-bold text-sm" style={{ color: d.fill }}>{d.value >= 0 ? '+' : ''}{fmt(d.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 表格组件 ====================

function BalanceTable() {
  const sections = [
    {
      title: '资产', bg: '#F0F9F0', color: '#07C160',
      rows: [
        { label: '货币资金', v: 856000 },
        { label: '应收账款', v: 320000 },
        { label: '预付账款', v: 85000 },
        { label: '其他应收款', v: 42000 },
        { label: '固定资产净值', v: 1020000 },
        { label: '资产合计', v: 2304000, bold: true },
      ],
    },
    {
      title: '负债', bg: '#FFF7F0', color: '#FF9800',
      rows: [
        { label: '应付账款', v: 156000 },
        { label: '应付职工薪酬', v: 85000 },
        { label: '应交税费', v: 42000 },
        { label: '负债合计', v: 283000, bold: true },
      ],
    },
    {
      title: '所有者权益', bg: '#F5F0FF', color: '#8B5CF6',
      rows: [
        { label: '实收资本', v: 1800000 },
        { label: '盈余公积', v: 120000 },
        { label: '未分配利润', v: 101000 },
        { label: '所有者权益合计', v: 2021000, bold: true },
      ],
    },
  ];

  return (
    <div>
      <BalanceAssetBars />
      <BalanceSummaryChart />
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #EDEDED' }}>
        {sections.map((sec) => (
          <div key={sec.title}>
            <div className="px-4 py-2 text-xs font-semibold" style={{ backgroundColor: sec.bg, color: sec.color }}>{sec.title}</div>
            {sec.rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-2.5 border-t border-gray-50"
                style={row.bold ? { backgroundColor: sec.bg } : {}}>
                <span className="text-sm" style={row.bold ? { color: sec.color, fontWeight: 'bold' } : { color: '#1A1A1A' }}>{row.label}</span>
                <span className="font-mono text-sm" style={row.bold ? { color: sec.color, fontWeight: 'bold' } : row.v < 0 ? { color: '#E53935' } : { color: '#1A1A1A' }}>
                  {fmtRow(row.v)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 bg-[#07C160] rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-white">资产负债平衡校验</span>
        <span className="text-sm font-bold text-white">¥2,304,000 = ¥283,000 + ¥2,021,000 ✓</span>
      </div>
    </div>
  );
}

function ProfitTable() {
  const rows = [
    { label: '一、营业收入', v: 850000, sec: true },
    { label: '其中：主营业务收入', v: 820000 },
    { label: '其他业务收入', v: 30000 },
    { label: '二、营业成本', v: 490000, exp: true },
    { label: '税金及附加', v: 8500, exp: true },
    { label: '销售费用', v: 68000, exp: true },
    { label: '管理费用', v: 95000, exp: true },
    { label: '财务费用', v: 12000, exp: true },
    { label: '三、营业利润', v: 176500, total: true },
    { label: '减：所得税', v: 23775, exp: true },
    { label: '四、净利润', v: 152725, net: true },
  ];
  return (
    <div>
      <ProfitTrendChart />
      <ProfitBreakdownChart />
      <ProfitRateChart />
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #EDEDED' }}>
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 border-t border-gray-50"
            style={r.net ? { backgroundColor: '#E8F5E9' } : r.total ? { backgroundColor: '#F7F7F7' } : r.sec ? { backgroundColor: '#EFF9FF' } : {}}>
            <span className="text-sm" style={
              r.net ? { color: '#07C160', fontWeight: 'bold' } :
              r.total ? { color: '#1A1A1A', fontWeight: 'bold' } :
              r.sec ? { color: '#1565C0' } :
              r.exp ? { color: '#E53935' } :
              { color: '#1A1A1A' }}>{r.label}</span>
            <span className="font-mono text-sm" style={r.net ? { color: '#07C160', fontWeight: 'bold' } : r.exp ? { color: '#E53935' } : { color: '#1A1A1A' }}>
              {fmtRow(r.v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CashFlowTable() {
  const sections = [
    {
      title: '经营活动', color: '#07C160', bg: '#F0F9F0',
      items: [
        { label: '销售商品、提供劳务收到的现金', v: 900000 },
        { label: '收到其他与经营活动有关的现金', v: 15000 },
        { label: '经营活动现金流入小计', v: 915000, sub: true },
        { label: '购买商品、接受劳务支付的现金', v: -380000 },
        { label: '支付给职工的现金', v: -180000 },
        { label: '支付的各项税费', v: -65000 },
        { label: '支付其他与经营活动有关的现金', v: -42000 },
        { label: '经营活动现金流出小计', v: -667000, sub: true },
        { label: '经营活动产生的现金流量净额', v: 248000, total: true },
      ],
    },
    {
      title: '投资活动', color: '#3B82F6', bg: '#EFF6FF',
      items: [
        { label: '处置固定资产收回的现金净额', v: 8000 },
        { label: '购建固定资产支付的现金', v: -120000 },
        { label: '投资活动产生的现金流量净额', v: -112000, total: true },
      ],
    },
    {
      title: '筹资活动', color: '#8B5CF6', bg: '#F5F0FF',
      items: [
        { label: '吸收投资收到的现金', v: 500000 },
        { label: '分配股利、利润或偿付利息支付的现金', v: -30000 },
        { label: '筹资活动产生的现金流量净额', v: 470000, total: true },
      ],
    },
  ];
  return (
    <div>
      <CashFlowBarChart />
      <NetCashFlowChart />
      {sections.map((sec) => (
        <div key={sec.title} className="bg-white rounded-2xl overflow-hidden mb-3" style={{ border: '1px solid #EDEDED' }}>
          <div className="px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: sec.color }}>{sec.title}</div>
          {sec.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5 border-t border-gray-50"
              style={item.sub ? { backgroundColor: '#F7F7F7' } : item.total ? { backgroundColor: sec.bg } : {}}>
              <span className="text-sm pl-4" style={
                item.total ? { color: sec.color, fontWeight: 'bold' } :
                item.sub ? { color: '#888', fontSize: '12px' } :
                { color: '#1A1A1A' }}>
                {item.label}
              </span>
              <span className="font-mono text-sm" style={item.total ? { color: sec.color, fontWeight: 'bold' } : item.v < 0 ? { color: '#E53935' } : { color: '#1A1A1A' }}>
                {fmtRow(item.v)}
              </span>
            </div>
          ))}
        </div>
      ))}
      <div className="bg-[#07C160] rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-white">现金及现金等价物净增加额</span>
        <span className="text-base font-bold text-white">¥606,000.00</span>
      </div>
    </div>
  );
}

// ==================== 主组件 ====================
type ReportTab = '资产负债表' | '利润表' | '现金流量表';
const TABS: ReportTab[] = ['资产负债表', '利润表', '现金流量表'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('资产负债表');

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="bg-white px-4 pt-4 pb-0">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={20} className="text-[#07C160]" />
          <h1 className="text-lg font-bold text-gray-900">财务报表</h1>
        </div>
        <div className="flex gap-1 bg-[#E8E8E8] p-1 rounded-2xl" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200"
              style={
                activeTab === tab
                  ? { backgroundColor: '#FFFFFF', color: '#07C160', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', border: '1px solid #C8E6C9' }
                  : { backgroundColor: 'transparent', color: '#888888', border: '1px solid transparent' }
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-4 pb-8">
        {activeTab === '资产负债表' && <BalanceTable />}
        {activeTab === '利润表' && <ProfitTable />}
        {activeTab === '现金流量表' && <CashFlowTable />}
      </div>
    </div>
  );
}
