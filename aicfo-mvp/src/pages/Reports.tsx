/**
 * 财务报表页面
 * 包含：资产负债表、利润表、现金流量表
 */

import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';

type ReportTab = '资产负债表' | '利润表' | '现金流量表';

const TABS: ReportTab[] = ['资产负债表', '利润表', '现金流量表'];

// ==================== Mock数据 ====================

const BALANCE_SHEET_DATA = {
  reportDate: '2026-03-31',
  items: [
    { label: '货币资金', value: 856000, group: '资产' },
    { label: '应收账款', value: 320000, group: '资产' },
    { label: '预付账款', value: 85000, group: '资产' },
    { label: '其他应收款', value: 42000, group: '资产' },
    { label: '固定资产', value: 1200000, group: '资产' },
    { label: '累计折旧', value: -180000, group: '资产' },
    { label: '资产合计', value: 2304000, group: '资产', isTotal: true },
    { label: '应付账款', value: 156000, group: '负债' },
    { label: '应付职工薪酬', value: 85000, group: '负债' },
    { label: '应交税费', value: 42000, group: '负债' },
    { label: '负债合计', value: 283000, group: '负债', isTotal: true },
    { label: '实收资本', value: 1800000, group: '权益' },
    { label: '盈余公积', value: 120000, group: '权益' },
    { label: '未分配利润', value: 101000, group: '权益' },
    { label: '所有者权益合计', value: 2021000, group: '权益', isTotal: true },
  ],
};

const PROFIT_SHEET_DATA = {
  reportDate: '2026年1-3月',
  items: [
    { label: '一、营业收入', value: 850000, isSection: true },
    { label: '其中：主营业务收入', value: 820000 },
    { label: '其他业务收入', value: 30000 },
    { label: '二、营业成本', value: 510000, isExpense: true },
    { label: '其中：主营业务成本', value: 490000 },
    { label: '营业税金及附加', value: 8500, isExpense: true },
    { label: '销售费用', value: 68000, isExpense: true },
    { label: '管理费用', value: 95000, isExpense: true },
    { label: '财务费用', value: 12000, isExpense: true },
    { label: '三、营业利润', value: 156500, isTotal: true },
    { label: '加：营业外收入', value: 5000 },
    { label: '减：营业外支出', value: 3000, isExpense: true },
    { label: '四、利润总额', value: 158500, isTotal: true },
    { label: '减：所得税费用（15%）', value: 23775, isExpense: true },
    { label: '五、净利润', value: 134725, isTotal: true, isHighlight: true },
  ],
};

const CASHFLOW_SHEET_DATA = {
  reportDate: '2026年1-3月',
  sections: [
    {
      title: '一、经营活动产生的现金流量',
      color: '#07C160',
      items: [
        { label: '销售商品、提供劳务收到的现金', value: 900000 },
        { label: '收到其他与经营活动有关的现金', value: 15000 },
        { label: '经营活动现金流入小计', value: 915000, isSubtotal: true },
        { label: '购买商品、接受劳务支付的现金', value: 380000 },
        { label: '支付给职工以及为职工支付的现金', value: 180000 },
        { label: '支付的各项税费', value: 65000 },
        { label: '支付其他与经营活动有关的现金', value: 42000 },
        { label: '经营活动现金流出小计', value: 667000, isSubtotal: true },
        { label: '经营活动产生的现金流量净额', value: 248000, isTotal: true },
      ],
    },
    {
      title: '二、投资活动产生的现金流量',
      color: '#3B82F6',
      items: [
        { label: '处置固定资产收回的现金净额', value: 8000 },
        { label: '投资活动现金流入小计', value: 8000, isSubtotal: true },
        { label: '购建固定资产支付的现金', value: 120000 },
        { label: '投资活动现金流出小计', value: 120000, isSubtotal: true },
        { label: '投资活动产生的现金流量净额', value: -112000, isTotal: true },
      ],
    },
    {
      title: '三、筹资活动产生的现金流量',
      color: '#8B5CF6',
      items: [
        { label: '吸收投资收到的现金', value: 500000 },
        { label: '筹资活动现金流入小计', value: 500000, isSubtotal: true },
        { label: '分配股利、利润或偿付利息支付的现金', value: 30000 },
        { label: '筹资活动现金流出小计', value: 30000, isSubtotal: true },
        { label: '筹资活动产生的现金流量净额', value: 470000, isTotal: true },
      ],
    },
  ],
};

function fmt(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
}

function fmtY(n: number) {
  if (Math.abs(n) >= 10000) {
    return `${(n / 10000).toFixed(2)}万`;
  }
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
}

function BalanceSheet() {
  const { items } = BALANCE_SHEET_DATA;
  const groups = ['资产', '负债', '权益'] as const;

  return (
    <div>
      <div className="bg-[#07C160] text-white text-xs px-4 py-2 rounded-xl mb-4 text-center">
        报告日期：{BALANCE_SHEET_DATA.reportDate} · 单位：元
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F7F7F7]">
              <th className="text-left px-4 py-2.5 text-gray-500 font-medium text-xs">科目</th>
              <th className="text-right px-4 py-2.5 text-gray-500 font-medium text-xs">金额（元）</th>
            </tr>
          </thead>
          <tbody>
            {/* 资产 */}
            {items
              .filter((i) => i.group === '资产')
              .map((item) => (
                <tr
                  key={item.label}
                  className={`border-t border-gray-50 ${item.isTotal ? 'bg-[#F0F9F0] font-medium' : ''}`}
                >
                  <td className={`px-4 py-2.5 ${item.isTotal ? 'text-[#07C160]' : 'text-gray-700'}`}>
                    {item.label}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-mono ${
                      item.isTotal
                        ? 'text-[#07C160] font-bold'
                        : item.value < 0
                        ? 'text-red-500'
                        : 'text-gray-800'
                    }`}
                  >
                    {item.value < 0 ? `-¥${fmt(Math.abs(item.value))}` : `¥${fmt(item.value)}`}
                  </td>
                </tr>
              ))}

            {/* 负债 */}
            {items
              .filter((i) => i.group === '负债')
              .map((item) => (
                <tr
                  key={item.label}
                  className={`border-t border-gray-50 ${item.isTotal ? 'bg-[#FFF7F0]' : ''}`}
                >
                  <td className={`px-4 py-2.5 ${item.isTotal ? 'text-amber-600' : 'text-gray-700'}`}>
                    {item.label}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-mono ${
                      item.isTotal
                        ? 'text-amber-600 font-bold'
                        : item.value < 0
                        ? 'text-red-500'
                        : 'text-gray-800'
                    }`}
                  >
                    {item.value < 0 ? `-¥${fmt(Math.abs(item.value))}` : `¥${fmt(item.value)}`}
                  </td>
                </tr>
              ))}

            {/* 权益 */}
            {items
              .filter((i) => i.group === '权益')
              .map((item) => (
                <tr
                  key={item.label}
                  className={`border-t border-gray-50 ${item.isTotal ? 'bg-[#F0F0FF]' : ''}`}
                >
                  <td className={`px-4 py-2.5 ${item.isTotal ? 'text-purple-600' : 'text-gray-700'}`}>
                    {item.label}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-mono ${
                      item.isTotal
                        ? 'text-purple-600 font-bold'
                        : item.value < 0
                        ? 'text-red-500'
                        : 'text-gray-800'
                    }`}
                  >
                    {item.value < 0 ? `-¥${fmt(Math.abs(item.value))}` : `¥${fmt(item.value)}`}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* 校验行 */}
      <div className="bg-white rounded-xl border border-[#07C160] p-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">校验：资产合计 = 负债 + 权益</span>
        <span className="text-sm font-bold text-[#07C160]">
          ¥2,304,000 = ¥283,000 + ¥2,021,000 ✓
        </span>
      </div>
    </div>
  );
}

function ProfitSheet() {
  const { items } = PROFIT_SHEET_DATA;

  return (
    <div>
      <div className="bg-[#07C160] text-white text-xs px-4 py-2 rounded-xl mb-4 text-center">
        报告期间：{PROFIT_SHEET_DATA.reportDate} · 单位：元
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={idx}
                className={`border-t border-gray-50 ${
                  item.isHighlight
                    ? 'bg-[#07C160]/5'
                    : item.isTotal
                    ? 'bg-[#F7F7F7]'
                    : item.isSection
                    ? 'bg-blue-50'
                    : ''
                }`}
              >
                <td
                  className={`px-4 py-2.5 ${
                    item.isHighlight
                      ? 'text-[#07C160] font-bold text-base'
                      : item.isTotal
                      ? 'text-gray-800 font-medium'
                      : item.isSection
                      ? 'text-blue-700 font-medium'
                      : item.isExpense
                      ? 'text-gray-600'
                      : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-mono ${
                    item.isHighlight
                      ? 'text-[#07C160] font-bold text-base'
                      : item.isTotal
                      ? 'text-gray-800 font-bold'
                      : item.isExpense
                      ? 'text-red-500'
                      : 'text-gray-800'
                  }`}
                >
                  {item.value < 0
                    ? `-¥${fmt(Math.abs(item.value))}`
                    : `¥${fmt(item.value)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CashFlowSheet() {
  const { sections } = CASHFLOW_SHEET_DATA;

  return (
    <div>
      <div className="bg-[#07C160] text-white text-xs px-4 py-2 rounded-xl mb-4 text-center">
        报告期间：{CASHFLOW_SHEET_DATA.reportDate} · 单位：元
      </div>

      {sections.map((section) => (
        <div key={section.title} className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
          {/* 章节标题 */}
          <div
            className="px-4 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: section.color }}
          >
            {section.title}
          </div>

          <table className="w-full text-sm">
            <tbody>
              {section.items.map((item, idx) => (
                <tr
                  key={idx}
                  className={`border-t border-gray-50 ${
                    item.isSubtotal
                      ? 'bg-gray-50'
                      : item.isTotal
                      ? 'bg-[#F7F7F7] font-medium'
                      : ''
                  }`}
                >
                  <td
                    className={`px-4 py-2.5 ${
                      item.isSubtotal
                        ? 'text-gray-500 text-xs pl-8'
                        : item.isTotal
                        ? 'text-gray-800 font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-mono ${
                      item.isTotal
                        ? 'font-bold'
                        : item.value < 0
                        ? 'text-red-500'
                        : 'text-gray-800'
                    } ${item.isSubtotal ? 'text-gray-600' : ''}`}
                    style={item.isTotal ? { color: section.color } : {}}
                  >
                    {item.value < 0
                      ? `-¥${fmt(Math.abs(item.value))}`
                      : `¥${fmt(item.value)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* 现金净增加额 */}
      <div className="bg-[#07C160] rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-white font-medium">现金及现金等价物净增加额</span>
        <span className="text-base font-bold text-white">
          ¥606,000.00
        </span>
      </div>
    </div>
  );
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('资产负债表');

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 头部 */}
      <div className="bg-white px-4 pt-4 pb-0">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={20} className="text-[#07C160]" />
          <h1 className="text-lg font-bold text-gray-900">财务报表</h1>
        </div>

        {/* Tab切换 */}
        <div className="flex gap-1 bg-[#F0F0F0] p-1 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-[#07C160] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 内容 */}
      <div className="px-4 py-4 pb-8">
        {activeTab === '资产负债表' && <BalanceSheet />}
        {activeTab === '利润表' && <ProfitSheet />}
        {activeTab === '现金流量表' && <CashFlowSheet />}
      </div>
    </div>
  );
}
