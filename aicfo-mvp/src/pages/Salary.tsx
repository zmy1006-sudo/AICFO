/**
 * 工资算薪页面
 * 支持员工管理、工资计算、年终奖方案对比
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Users, Download, X, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Employee } from '../types';

const DEFAULT_EMPLOYEE: Omit<Employee, 'id' | 'createdAt'> = {
  name: '',
  idCard: '',
  bankAccount: '',
  baseSalary: 0,
  performanceSalary: 0,
  overtimePay: 0,
  mealSubsidy: 0,
  transportationSubsidy: 0,
  fullAttendanceBonus: 0,
  otherAllowances: 0,
  socialInsuranceRate: 10.5,
  housingFundRate: 12,
};

function calcPersonalTax(gross: number, socialInsurance: number, housingFund: number): number {
  const taxableIncome = gross - socialInsurance - housingFund - 5000;
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 36000) return Math.round(taxableIncome * 0.03);
  if (taxableIncome <= 144000) return Math.round(taxableIncome * 0.10 - 2520);
  if (taxableIncome <= 300000) return Math.round(taxableIncome * 0.20 - 16920);
  if (taxableIncome <= 420000) return Math.round(taxableIncome * 0.25 - 31920);
  if (taxableIncome <= 660000) return Math.round(taxableIncome * 0.30 - 52920);
  if (taxableIncome <= 960000) return Math.round(taxableIncome * 0.35 - 85920);
  return Math.round(taxableIncome * 0.45 - 181920);
}

function calcYearEndBonusTax单独(bonus: number): number {
  const monthly = bonus / 12;
  let tax = 0;
  if (monthly <= 3000) tax = monthly * 0.03 * 12;
  else if (monthly <= 12000) tax = monthly * 0.10 * 12 - 2520;
  else if (monthly <= 25000) tax = monthly * 0.20 * 12 - 16920;
  else if (monthly <= 35000) tax = monthly * 0.25 * 12 - 31920;
  else if (monthly <= 55000) tax = monthly * 0.30 * 12 - 52920;
  else if (monthly <= 80000) tax = monthly * 0.35 * 12 - 85920;
  else tax = monthly * 0.45 * 12 - 181920;
  return Math.round(tax);
}

function fmt(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
}

export default function Salary() {
  const navigate = useNavigate();
  const { enterprise, employees, addEmployee, updateEmployee, deleteEmployee, addSalaryRecord, salaryRecords } = useAppStore();

  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [showBonusCompare, setShowBonusCompare] = useState(false);
  const [socialInsuranceRate, setSocialInsuranceRate] = useState(10.5);
  const [housingFundRate, setHousingFundRate] = useState(12);

  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] = useState<Omit<Employee, 'id' | 'createdAt'>>(DEFAULT_EMPLOYEE);

  const [salaryInputs, setSalaryInputs] = useState<Record<string, Record<string, string>>>({});

  function getInputValue(empId: string, field: keyof Employee): string {
    return salaryInputs[empId]?.[field] ?? '';
  }

  function setInputValue(empId: string, field: keyof Employee, value: string) {
    setSalaryInputs((prev) => ({
      ...prev,
      [empId]: { ...prev[empId], [field]: value },
    }));
  }

  function getSalaryField(emp: Employee, field: keyof Employee): number {
    if (field === 'id' || field === 'name' || field === 'idCard' || field === 'bankAccount' || field === 'socialInsuranceRate' || field === 'housingFundRate' || field === 'createdAt') return 0;
    const val = getInputValue(emp.id, field);
    if (val === '') return emp[field] as number;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }

  function calcGross(emp: Employee): number {
    return ['baseSalary', 'performanceSalary', 'overtimePay', 'mealSubsidy', 'transportationSubsidy', 'fullAttendanceBonus', 'otherAllowances']
      .reduce((sum, field) => sum + getSalaryField(emp, field as keyof Employee), 0);
  }

  function calcNetSalary(emp: Employee): { gross: number; socialInsurance: number; housingFund: number; personalTax: number; netSalary: number } {
    const gross = calcGross(emp);
    const socialInsurance = gross * (socialInsuranceRate / 100);
    const housingFund = gross * (housingFundRate / 100);
    const personalTax = calcPersonalTax(gross, socialInsurance, housingFund);
    const netSalary = gross - socialInsurance - housingFund - personalTax;
    return { gross, socialInsurance, housingFund, personalTax, netSalary };
  }

  const totalStats = useMemo(() => {
    return employees.reduce(
      (acc, emp) => {
        const { gross, socialInsurance, housingFund, personalTax, netSalary } = calcNetSalary(emp);
        acc.gross += gross;
        acc.socialInsurance += socialInsurance;
        acc.housingFund += housingFund;
        acc.personalTax += personalTax;
        acc.netSalary += netSalary;
        return acc;
      },
      { gross: 0, socialInsurance: 0, housingFund: 0, personalTax: 0, netSalary: 0 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, salaryInputs, socialInsuranceRate, housingFundRate]);

  function handleSaveSalary(emp: Employee) {
    const { gross, socialInsurance, housingFund, personalTax, netSalary } = calcNetSalary(emp);
    addSalaryRecord({
      employeeName: emp.name,
      baseSalary: getSalaryField(emp, 'baseSalary'),
      performanceSalary: getSalaryField(emp, 'performanceSalary'),
      overtimePay: getSalaryField(emp, 'overtimePay'),
      mealSubsidy: getSalaryField(emp, 'mealSubsidy'),
      transportationSubsidy: getSalaryField(emp, 'transportationSubsidy'),
      fullAttendanceBonus: getSalaryField(emp, 'fullAttendanceBonus'),
      otherAllowances: getSalaryField(emp, 'otherAllowances'),
      totalGross: gross,
      personalTax,
      socialInsurance,
      housingFund,
      otherDeductions: 0,
      totalDeductions: socialInsurance + housingFund + personalTax,
      netSalary,
      period,
    });
    alert(`${emp.name}的工资记录已保存`);
  }

  function openAddEmployee() {
    setEditingEmployee(null);
    setEmployeeForm(DEFAULT_EMPLOYEE);
    setShowEmployeeModal(true);
  }

  function openEditEmployee(emp: Employee) {
    setEditingEmployee(emp);
    setEmployeeForm({
      name: emp.name,
      idCard: emp.idCard,
      bankAccount: emp.bankAccount,
      baseSalary: emp.baseSalary,
      performanceSalary: emp.performanceSalary,
      overtimePay: emp.overtimePay,
      mealSubsidy: emp.mealSubsidy,
      transportationSubsidy: emp.transportationSubsidy,
      fullAttendanceBonus: emp.fullAttendanceBonus,
      otherAllowances: emp.otherAllowances,
      socialInsuranceRate: emp.socialInsuranceRate,
      housingFundRate: emp.housingFundRate,
    });
    setShowEmployeeModal(true);
  }

  function handleSaveEmployee() {
    if (!employeeForm.name) {
      alert('请输入员工姓名');
      return;
    }
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeForm);
    } else {
      addEmployee(employeeForm);
    }
    setShowEmployeeModal(false);
  }

  function handleDeleteEmployee(id: string) {
    if (confirm('确认删除此员工？')) {
      deleteEmployee(id);
    }
  }

  const bonusCompareResult = useMemo(() => {
    if (bonusAmount <= 0 || !selectedEmployee) return null;
    const monthlyIncome = getSalaryField(selectedEmployee, 'baseSalary') + getSalaryField(selectedEmployee, 'performanceSalary');
    const tax单独 = calcYearEndBonusTax单独(bonusAmount);
    const tax合并 = calcPersonalTax(bonusAmount + monthlyIncome, 0, 0) - calcPersonalTax(monthlyIncome, 0, 0);
    const net单独 = bonusAmount - tax单独;
    const net合并 = bonusAmount - tax合并;
    return {
      单独计税: { tax: tax单独, net: net单独, recommended: net单独 > net合并 },
      合并计税: { tax: tax合并, net: net合并, recommended: net合并 >= net单独 },
      节省: Math.abs(net单独 - net合并),
      推荐: net单独 > net合并 ? '单独计税' : '合并计税',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bonusAmount, selectedEmployee, salaryInputs]);

  function exportCSV() {
    const headers = ['姓名', '基本工资', '绩效工资', '加班费', '餐补', '交通补', '全勤奖', '其他补贴', '应发', '社保', '公积金', '个税', '实发'];
    const rows = employees.map((emp) => {
      const { gross, socialInsurance, housingFund, personalTax, netSalary } = calcNetSalary(emp);
      return [
        emp.name,
        getSalaryField(emp, 'baseSalary'),
        getSalaryField(emp, 'performanceSalary'),
        getSalaryField(emp, 'overtimePay'),
        getSalaryField(emp, 'mealSubsidy'),
        getSalaryField(emp, 'transportationSubsidy'),
        getSalaryField(emp, 'fullAttendanceBonus'),
        getSalaryField(emp, 'otherAllowances'),
        gross.toFixed(2),
        socialInsurance.toFixed(2),
        housingFund.toFixed(2),
        personalTax.toFixed(2),
        netSalary.toFixed(2),
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `工资表_${period}.csv`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calculator size={20} className="text-[#07C160]" />
            <h1 className="text-lg font-bold text-gray-900">工资算薪</h1>
          </div>
          <button
            onClick={exportCSV}
            disabled={employees.length === 0}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full disabled:opacity-50"
            style={{ backgroundColor: '#E8F5E9', color: '#07C160' }}
          >
            <Download size={12} />
            导出
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200"
          />
          <span className="text-xs text-gray-400">
            {enterprise?.taxType || '小规模纳税人'}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-[#07C160]" />
              <span className="text-xs text-gray-500">在职员工</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{employees.length}人</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">当月工资合计</span>
            </div>
            <p className="text-2xl font-bold text-[#07C160]">¥{fmt(totalStats.netSalary)}</p>
          </div>
        </div>

        {/* 社保公积金比例 */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-3">社保公积金缴纳比例</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">社保个人部分</label>
              <div className="mt-1">
                <div className="relative">
                  <input
                    type="number"
                    value={socialInsuranceRate}
                    onChange={(e) => setSocialInsuranceRate(parseFloat(e.target.value) || 0)}
                    placeholder="8"
                    className="w-full px-3 py-1.5 pr-8 border border-gray-200 rounded-lg text-sm text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">公积金</label>
              <div className="mt-1">
                <div className="relative">
                  <input
                    type="number"
                    value={housingFundRate}
                    onChange={(e) => setHousingFundRate(parseFloat(e.target.value) || 0)}
                    placeholder="12"
                    className="w-full px-3 py-1.5 pr-8 border border-gray-200 rounded-lg text-sm text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 员工列表 */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">员工工资</p>
            <button
              onClick={openAddEmployee}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#07C160', color: '#FFFFFF' }}
            >
              <Plus size={12} />
              添加员工
            </button>
          </div>

          {employees.length === 0 ? (
            <div className="text-center py-8">
              <Users size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">暂无员工，请添加</p>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((emp) => {
                const { gross, socialInsurance, housingFund, personalTax, netSalary } = calcNetSalary(emp);

                return (
                  <div key={emp.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{emp.name}</span>
                        <span className="text-xs text-gray-400">在职</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditEmployee(emp)}
                          className="p-1.5 text-gray-400 hover:text-[#07C160]"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* 工资输入 */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {(['baseSalary', 'performanceSalary', 'mealSubsidy', 'transportationSubsidy'] as const).map((field) => (
                        <div key={field}>
                          <label className="text-xs text-gray-400">{field === 'baseSalary' ? '基本' : field === 'performanceSalary' ? '绩效' : field === 'mealSubsidy' ? '餐补' : '交通'}</label>
                          <input
                            type="number"
                            value={getInputValue(emp.id, field)}
                            onChange={(e) => setInputValue(emp.id, field, e.target.value)}
                            placeholder={emp[field].toString()}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm mt-0.5"
                          />
                        </div>
                      ))}
                    </div>

                    {/* 工资条 */}
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">应发</span>
                        <span className="font-medium text-gray-800">¥{fmt(gross)}</span>
                      </div>
                      <div className="flex items-start justify-between text-xs mb-1 gap-2">
                        <span className="text-gray-500 shrink-0">社保 + 公积金</span>
                        <span className="text-red-500 shrink-0">-¥{fmt(socialInsurance + housingFund)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">个税</span>
                        <span className="text-red-500">-¥{fmt(personalTax)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-gray-200">
                        <span className="text-gray-700 font-medium">实发</span>
                        <span className="text-[#07C160] font-bold">¥{fmt(netSalary)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSaveSalary(emp)}
                      className="w-full mt-2 py-1.5 text-xs rounded-lg"
                      style={{ backgroundColor: '#E8F5E9', color: '#07C160' }}
                    >
                      保存工资记录
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 年终奖对比 */}
        {employees.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">年终奖方案对比</p>
              <button
                onClick={() => setShowBonusCompare(!showBonusCompare)}
                className="text-xs text-[#07C160]"
              >
                {showBonusCompare ? '收起' : '展开'}
              </button>
            </div>

            {showBonusCompare && (
              <>
                <div className="mb-3">
                  <select
                    value={selectedEmployee?.id || ''}
                    onChange={(e) => setSelectedEmployee(employees.find((emp) => emp.id === e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">选择员工</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <input
                    type="number"
                    value={bonusAmount || ''}
                    onChange={(e) => setBonusAmount(parseFloat(e.target.value) || 0)}
                    placeholder="输入年终奖金额"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>

                {bonusCompareResult && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl border-2 ${bonusCompareResult.单独计税.recommended ? 'border-[#07C160] bg-[#E8F5E9]' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-medium">单独计税</span>
                        {bonusCompareResult.推荐 === '单独计税' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#07C160] text-white">推荐</span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-gray-800">¥{fmt(bonusCompareResult.单独计税.net)}</p>
                      <p className="text-xs text-gray-500">个税¥{fmt(bonusCompareResult.单独计税.tax)}</p>
                    </div>
                    <div className={`p-3 rounded-xl border-2 ${bonusCompareResult.合并计税.recommended ? 'border-[#07C160] bg-[#E8F5E9]' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-medium">合并计税</span>
                        {bonusCompareResult.推荐 === '合并计税' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#07C160] text-white">推荐</span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-gray-800">¥{fmt(bonusCompareResult.合并计税.net)}</p>
                      <p className="text-xs text-gray-500">个税¥{fmt(bonusCompareResult.合并计税.tax)}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 历史工资记录 */}
        {salaryRecords.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-3">历史工资记录</p>
            <div className="space-y-2">
              {salaryRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{record.employeeName}</p>
                    <p className="text-xs text-gray-400">{record.period}</p>
                  </div>
                  <span className="text-[#07C160] font-medium">¥{fmt(record.netSalary)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 员工编辑弹窗 */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowEmployeeModal(false)}>
          <div
            className="bg-white w-full max-w-md rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            style={{ paddingBottom: 'max(60px, env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingEmployee ? '编辑员工' : '添加员工'}
              </h2>
              <button onClick={() => setShowEmployeeModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">姓名 *</label>
                <input
                  type="text"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  placeholder="请输入姓名"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">身份证号</label>
                <input
                  type="text"
                  value={employeeForm.idCard}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, idCard: e.target.value })}
                  placeholder="可选"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">银行账号</label>
                <input
                  type="text"
                  value={employeeForm.bankAccount}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, bankAccount: e.target.value })}
                  placeholder="可选"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">基本工资</label>
                  <input
                    type="number"
                    value={employeeForm.baseSalary || ''}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, baseSalary: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">绩效工资</label>
                  <input
                    type="number"
                    value={employeeForm.performanceSalary || ''}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, performanceSalary: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">餐补</label>
                  <input
                    type="number"
                    value={employeeForm.mealSubsidy || ''}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, mealSubsidy: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">交通补</label>
                  <input
                    type="number"
                    value={employeeForm.transportationSubsidy || ''}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, transportationSubsidy: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveEmployee}
              className="w-full mt-6 py-3 bg-[#07C160] text-white rounded-xl text-sm font-medium"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
