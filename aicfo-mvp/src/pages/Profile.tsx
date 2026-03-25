/**
 * 个人中心页面
 * Phase 3: 企业信息/发票OCR/体验模式/一键重置
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Phone, HelpCircle, Settings, LogOut, ChevronRight,
  MessageSquare, ScanLine, RotateCcw, AlertTriangle, BarChart2, FileText,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Profile() {
  const navigate = useNavigate();
  const { enterprise, userName, vouchers, isDemo, isOnboarded } = useAppStore();
  const [showOcrTip, setShowOcrTip] = useState(false);
  const [showResetTip, setShowResetTip] = useState(false);

  const confirmedCount = vouchers.filter((v) => v.status === '已入账').length;
  const totalAmount = vouchers.reduce((s, v) => s + v.amount, 0);

  // 本月数据
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const monthPrefix = `${yyyy}-${mm}`;
  const monthVouchers = vouchers.filter((v) => v.date.startsWith(monthPrefix));
  const monthIncome = monthVouchers
    .filter((v) => v.status === '已入账')
    .reduce((sum, v) => {
      const item = v.items.find((i) => i.direction === '借' && i.accountName.includes('银行'));
      return sum + (item ? item.amount : 0);
    }, 0);
  const monthExpense = monthVouchers
    .filter((v) => v.status === '已入账')
    .reduce((sum, v) => {
      const item = v.items.find((i) => i.direction === '贷' && i.accountName.includes('银行'));
      return sum + (item ? item.amount : 0);
    }, 0);

  function fmt(n: number) {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
    return n.toLocaleString('zh-CN');
  }

  function handleReset() {
    if (confirm('确定要重置体验数据吗？所有凭证和设置将被清空。')) {
      localStorage.removeItem('aicfo-mvp-storage');
      window.location.href = '/onboarding';
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 体验模式提示条 */}
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500 shrink-0" />
          <span className="text-xs text-amber-700">体验模式 · 演示数据，随时可重置</span>
        </div>
      )}

      {/* 头部 */}
      <div className="bg-[#07C160] px-4 pt-8 pb-16 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <p className="font-semibold text-lg">{userName || '未设置姓名'}</p>
            <p className="text-[#95EC69] text-xs mt-0.5">
              {isDemo ? '体验用户' : 'AICFO用户'}
            </p>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="px-4 -mt-10">

        {/* 企业信息卡 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-[#07C160]" />
            <span className="text-sm font-medium text-gray-700">企业信息</span>
          </div>
          {enterprise ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">企业名称</span>
                <span className="text-gray-800 font-medium">{enterprise.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">纳税类型</span>
                <span className="text-[#07C160] font-medium">{enterprise.taxType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">信用代码</span>
                <span className="font-mono text-gray-600">{enterprise.creditCode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">注册资本</span>
                <span className="text-gray-600">{enterprise.registeredCapital}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/onboarding')}
              className="w-full py-2 text-[#07C160] text-sm font-medium"
            >
              去完成企业认证 →
            </button>
          )}
        </div>

        {/* 本月数据概览 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">📊 本月数据</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-[#07C160]">{monthVouchers.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">凭证数</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">{fmt(monthIncome)}</p>
              <p className="text-xs text-gray-400 mt-0.5">本月收入</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-red-500">{fmt(monthExpense)}</p>
              <p className="text-xs text-gray-400 mt-0.5">本月支出</p>
            </div>
          </div>
        </div>

        {/* 发票OCR入口 */}
        <div
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 cursor-pointer active:bg-gray-50 transition-colors"
          onClick={() => navigate('/invoice')}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <ScanLine size={18} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">发票识别</p>
              <p className="text-xs text-gray-400 mt-0.5">拍照/上传发票自动提取信息</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>
        </div>

        {/* 财务报表入口 */}
        <div
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 cursor-pointer active:bg-gray-50 transition-colors"
          onClick={() => navigate('/reports')}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0F9F0] flex items-center justify-center">
              <BarChart2 size={18} className="text-[#07C160]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">财务报表</p>
              <p className="text-xs text-gray-400 mt-0.5">资产负债表 · 利润表 · 现金流量表</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>
        </div>

        {/* 合同管理入口 */}
        <div
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 cursor-pointer active:bg-gray-50 transition-colors"
          onClick={() => navigate('/contracts')}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <FileText size={18} className="text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">合同管理</p>
              <p className="text-xs text-gray-400 mt-0.5">采购合同 · 销售合同 · 服务合同</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>
        </div>

        {/* 功能菜单 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
          {[
            { icon: HelpCircle, label: '帮助与反馈', action: () => {} },
            { icon: Phone, label: '联系客服', action: () => {} },
            { icon: MessageSquare, label: '咨询专家', action: () => {} },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F7F7F7] transition-colors border-b border-gray-50 last:border-0"
            >
              <Icon size={18} className="text-gray-400" />
              <span className="flex-1 text-left text-sm text-gray-700">{label}</span>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>

        {/* 一键重置体验 */}
        {isDemo && (
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 text-red-500 text-sm font-medium bg-white rounded-xl border border-red-100 hover:bg-red-50 transition-colors mb-4"
          >
            <RotateCcw size={16} />
            重新体验
          </button>
        )}

        {/* 切换企业 */}
        <button
          onClick={() => {
            useAppStore.setState({
              isOnboarded: false,
              enterprise: null,
              userName: '',
              vouchers: [],
              sessions: [],
              messages: [],
              currentSessionId: null,
            });
            navigate('/onboarding');
          }}
          className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 text-sm font-medium bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <LogOut size={16} />
          切换企业
        </button>

        <p className="text-center text-xs text-gray-300 mt-6">AICFO v1.0.0 MVP</p>
      </div>

      {/* OCR提示弹窗 */}
      {showOcrTip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setShowOcrTip(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl mb-3">📷</div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">发票识别</h3>
            <p className="text-sm text-gray-500 mb-5">OCR功能即将上线，敬请期待！</p>
            <button
              onClick={() => setShowOcrTip(false)}
              className="w-full py-2.5 bg-[#07C160] text-white text-sm font-medium rounded-full"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
