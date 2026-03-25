/**
 * 凭证列表页面
 * 支持按月份筛选 + 状态筛选 + 查看详情
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, ChevronDown } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import VoucherCard from '../components/VoucherCard';
import type { VoucherStatus } from '../types';

const STATUS_FILTERS: Array<{ label: string; value: VoucherStatus | '全部' }> = [
  { label: '全部', value: '全部' },
  { label: '草稿', value: '草稿' },
  { label: '待审核', value: '待审核' },
  { label: '已入账', value: '已入账' },
  { label: '已作废', value: '已作废' },
];

export default function Vouchers() {
  const navigate = useNavigate();
  const { vouchers } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<VoucherStatus | '全部'>('全部');
  const [activeMonth, setActiveMonth] = useState<string>('all');
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // 获取所有有凭证的月份
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    vouchers.forEach((v) => {
      const y = v.date.slice(0, 4);
      const m = v.date.slice(5, 7);
      months.add(`${y}-${m}`);
    });
    return Array.from(months).sort().reverse();
  }, [vouchers]);

  // 当前默认选中最近月份
  const currentMonth = availableMonths[0] || '';
  const selectedMonth = activeMonth === 'all' ? currentMonth : activeMonth;

  // 月份筛选
  const monthFiltered = activeMonth === 'all'
    ? vouchers
    : vouchers.filter((v) => v.date.startsWith(activeMonth));

  const filtered = activeFilter === '全部'
    ? monthFiltered
    : monthFiltered.filter((v) => v.status === activeFilter);

  const statusCounts: Record<string, number> = {};
  vouchers.forEach((v) => {
    statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;
  });

  function formatMonthLabel(m: string) {
    const [y, mo] = m.split('-');
    return `${y}年${parseInt(mo)}月`;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 头部 */}
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900">凭证管理</h1>
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-1.5 bg-[#07C160] text-white text-xs font-medium px-3 py-1.5 rounded-full"
          >
            <Plus size={14} />
            新增
          </button>
        </div>

        {/* 月份筛选器 */}
        <div className="mb-3 relative">
          <button
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="flex items-center gap-1.5 bg-[#F0F9F0] text-[#07C160] text-xs font-medium px-3 py-1.5 rounded-full border border-[#C8E6C9]"
          >
            <span>{activeMonth === 'all' ? '全部月份' : formatMonthLabel(activeMonth)}</span>
            <ChevronDown size={12} className={`transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
          </button>

          {showMonthPicker && (
            <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1 min-w-[140px]">
              <button
                onClick={() => { setActiveMonth('all'); setShowMonthPicker(false); }}
                className={`w-full text-left px-3 py-2 text-xs ${activeMonth === 'all' ? 'text-[#07C160] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                全部月份
              </button>
              {availableMonths.map((m) => (
                <button
                  key={m}
                  onClick={() => { setActiveMonth(m); setShowMonthPicker(false); }}
                  className={`w-full text-left px-3 py-2 text-xs ${activeMonth === m ? 'text-[#07C160] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {formatMonthLabel(m)}
                </button>
              ))}
              {availableMonths.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-400">暂无数据</p>
              )}
            </div>
          )}
        </div>

        {/* 状态筛选 */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === value
                  ? 'bg-[#07C160] text-white'
                  : 'bg-[#F0F0F0] text-gray-500 hover:bg-gray-200'
              }`}
            >
              {label}
              {value !== '全部' && statusCounts[value] != null && (
                <span className={`ml-1 ${activeFilter === value ? 'opacity-80' : ''}`}>
                  {statusCounts[value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="px-4 py-3 grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-900">{monthFiltered.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {activeMonth === 'all' ? '全部凭证' : formatMonthLabel(activeMonth)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-green-600">
            {monthFiltered.filter((v) => v.status === '已入账').length}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">已入账</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-amber-600">
            {monthFiltered.filter((v) => v.status === '待审核').length}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">待审核</p>
        </div>
      </div>

      {/* 凭证列表 */}
      <div className="px-4 pb-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🧾</div>
            <p className="text-gray-400 text-base font-medium mb-1">还没有凭证，开始记账吧</p>
            <p className="text-gray-300 text-xs mb-6">AI帮你自动生成记账凭证</p>
            <button
              onClick={() => navigate('/chat')}
              className="inline-flex items-center gap-2 bg-[#07C160] text-white text-sm font-medium px-5 py-2.5 rounded-full"
            >
              <Sparkles size={14} />
              去记账
            </button>
          </div>
        ) : (
          filtered.map((voucher) => (
            <VoucherCard
              key={voucher.id}
              voucher={voucher}
              onClick={() => navigate(`/vouchers/${voucher.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
