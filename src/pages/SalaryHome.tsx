/**
 * 工资管理首页
 * 月份选择 + 员工列表 + 一键算薪 + 人员管理入口
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Users, ChevronLeft, ChevronRight, Check, X, Download, FileText, ChevronUp } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { calculateSocialSecurity } from '../api/socialSecurityRules';
import { calculateHousingFund } from '../api/housingFundRules';
import { calculateIndividualTax } from '../api/taxCalculator';

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function formatMoney(n: number) {
  return '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
}

export default function SalaryHome() {
  const navigate = useNavigate();
  const today = new Date();
  const [year] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCalc, setShowCalc] = useState(false);

  const { employees } = useAppStore();
  const paid = employees.filter((e) => e.status === 'active').filter((_, i) => i % 2 === 0);
  const unpaid = employees.filter((e) => e.status === 'active').filter((_, i) => i % 2 === 1);
  const allActive = employees.filter((e) => e.status === 'active');

  function calcNetSalary(emp: typeof employees[0]) {
    const social = emp.socialEnabled ? calculateSocialSecurity(emp.socialBase || emp.baseSalary, emp.socialCity) : null;
    const housing = emp.housingEnabled ? calculateHousingFund(emp.housingBase || emp.baseSalary, emp.socialCity) : null;
    const monthlySD = (emp.specialDeduction?.children || 0) * 1000 + (emp.specialDeduction?.elderly || 0) * 2000
      + (emp.specialDeduction?.housingLoan ? 1000 : 0)
      + (emp.specialDeduction?.housingRent ? 800 : 0)
      + (emp.specialDeduction?.continuing ? 400 : 0);
    const socialP = social?.employee.total || 0;
    const housingP = housing?.employeeFund || 0;
    const taxResult = calculateIndividualTax(month, emp.baseSalary * month, socialP * month, housingP * month, monthlySD * month);
    const monthlyTax = month === 1 ? taxResult.monthlyTax : taxResult.monthlyTax;
    return {
      socialP,
      housingP,
      tax: monthlyTax,
      net: emp.baseSalary - socialP - housingP - monthlyTax,
      socialTotal: social?.company.total || 0,
    };
  }

  const totalSalary = allActive.reduce((s, e) => s + e.baseSalary, 0);
  const paidSalary = paid.reduce((s, e) => s + calcNetSalary(e).net, 0);
  const unpaidSalary = unpaid.reduce((s, e) => s + calcNetSalary(e).net, 0);

  function prevMonth() { if (month > 1) setMonth(month - 1); }
  function nextMonth() { if (month < 12) setMonth(month + 1); }

  const calcResult = showCalc ? allActive.map((e) => ({ emp: e, ...calcNetSalary(e) })) : [];

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#F7F7F7' }}>
      {/* 头部 */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px 16px 12px', borderBottom: '1px solid #EDEDED' }}>
        <div className="flex items-center justify-between mb-3">
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1A1A1A' }}>工资管理</h1>
          <button
            onClick={() => navigate('/employees')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#E8F5E9', color: '#07C160' }}
          >
            <Users size={13} /> 人员管理
          </button>
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

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '应发总额', value: totalSalary, color: '#1A1A1A' },
            { label: '已发', value: paidSalary, color: '#07C160' },
            { label: '待发', value: unpaidSalary, color: '#FF6B35' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: '#F7F7F7', border: '1px solid #EDEDED' }}>
              <p className="text-xs mb-1" style={{ color: '#888888' }}>{label}</p>
              <p className="text-sm font-bold" style={{ color }}>{allActive.length === 0 ? '—' : formatMoney(value)}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* 一键算薪 */}
        <button
          onClick={() => {
            if (allActive.length === 0) { navigate('/employees'); return; }
            setShowCalc(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-base mb-4"
          style={{ background: 'linear-gradient(135deg, #07C160 0%, #06AD56 100%)', boxShadow: '0 4px 16px rgba(7,193,96,0.35)' }}
        >
          <DollarSign size={22} />
          {allActive.length === 0 ? '先去添加员工' : `一键算薪（${allActive.length}人）`}
        </button>

        {allActive.length === 0 && (
          <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFE0B2' }}>
            <p className="text-sm" style={{ color: '#E65100' }}>💡 请先在「人员管理」中添加员工，才能进行工资核算和发放。</p>
          </div>
        )}

        {/* 算薪弹层 */}
        {showCalc && (
          <div className="mb-4 rounded-xl overflow-hidden" style={{ border: '1px solid #C8E6C9' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#E8F5E9' }}>
              <p className="text-sm font-semibold" style={{ color: '#07C160' }}>{year}年{MONTHS[month - 1]} 算薪明细</p>
              <button onClick={() => setShowCalc(false)} className="p-1 rounded" style={{ backgroundColor: '#C8E6C9' }}>
                <ChevronUp size={16} style={{ color: '#07C160' }} />
              </button>
            </div>
            {calcResult.map(({ emp, socialP, housingP, tax, net }) => (
              <div key={emp.id} className="px-4 py-3" style={{ borderBottom: '1px solid #F0F0F0' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#07C160' }}>{emp.name.slice(0, 1)}</div>
                    <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{emp.name}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#07C160' }}>{formatMoney(net)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg p-2 text-center" style={{ backgroundColor: '#FFF3E0' }}>
                    <p style={{ color: '#888888' }}>社保个人</p><p className="font-bold" style={{ color: '#E53935' }}>-{formatMoney(socialP)}</p>
                  </div>
                  <div className="rounded-lg p-2 text-center" style={{ backgroundColor: '#FFF3E0' }}>
                    <p style={{ color: '#888888' }}>公积金个人</p><p className="font-bold" style={{ color: '#E53935' }}>-{formatMoney(housingP)}</p>
                  </div>
                  <div className="rounded-lg p-2 text-center" style={{ backgroundColor: '#FFF3E0' }}>
                    <p style={{ color: '#888888' }}>个税</p><p className="font-bold" style={{ color: '#E53935' }}>-{formatMoney(tax)}</p>
                  </div>
                </div>
                <div className="mt-1 text-xs" style={{ color: '#888888' }}>
                  基本工资 {formatMoney(emp.baseSalary)} → 应发 {formatMoney(emp.baseSalary - socialP - housingP)} → 实发 {formatMoney(net)}
                </div>
              </div>
            ))}
            <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#E8F5E9' }}>
              <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>本月发放合计</span>
              <span className="text-sm font-bold" style={{ color: '#07C160' }}>{formatMoney(calcResult.reduce((s, r) => s + r.net, 0))}</span>
            </div>
          </div>
        )}

        {/* 员工列表 */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>员工工资</p>
          {allActive.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#07C160]" />
              <span className="text-xs" style={{ color: '#07C160' }}>{paid.length}人已发</span>
              <div className="w-2 h-2 rounded-full ml-2" style={{ backgroundColor: '#FF6B35' }} />
              <span className="text-xs" style={{ color: '#FF6B35' }}>{unpaid.length}人待发</span>
            </div>
          )}
        </div>

        {allActive.map((emp) => {
          const isExpanded = expandedId === emp.id;
          const { net } = calcNetSalary(emp);
          return (
            <div
              key={emp.id}
              className="bg-white rounded-xl p-4 mb-2 transition-all"
              style={{ border: isExpanded ? '1.5px solid #07C160' : '1px solid #EDEDED' }}
              onClick={() => setExpandedId(isExpanded ? null : emp.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#07C160' }}>
                    {emp.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{emp.name}</p>
                    <p className="text-xs" style={{ color: '#888888' }}>{emp.department} · {emp.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: '#07C160' }}>
                    {allActive.length === 0 ? '—' : formatMoney(net)}
                  </p>
                  <p className="text-xs" style={{ color: '#888888' }}>实发</p>
                </div>
              </div>

              {/* 展开详情 */}
              {isExpanded && allActive.length > 0 && (() => {
                const { socialP, housingP, tax, socialTotal } = calcNetSalary(emp);
                return (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px dashed #C8E6C9' }}>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[
                        { label: '基本工资', value: emp.baseSalary, color: '#1A1A1A' },
                        { label: '社保个人', value: -socialP, color: '#E53935' },
                        { label: '公积金个人', value: -housingP, color: '#E53935' },
                        { label: '个税', value: -tax, color: '#E53935' },
                        { label: '实发工资', value: net, color: '#07C160' },
                        { label: '企业总成本', value: emp.baseSalary + socialTotal, color: '#FF9800' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-lg p-2.5" style={{ backgroundColor: '#F7F7F7' }}>
                          <p className="text-xs mb-0.5" style={{ color: '#888888' }}>{label}</p>
                          <p className="text-sm font-bold" style={{ color }}>{value < 0 ? '' : ''}{formatMoney(Math.abs(value))}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: '#F0F9F0', color: '#07C160' }}>
                        <FileText size={14} /> 工资条
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: '#E8F5E9', color: '#07C160' }}>
                        <Download size={14} /> 代发文件
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
