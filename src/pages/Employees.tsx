/**
 * 员工管理页面
 * 员工列表 + 新增/编辑员工表单
 */

import React, { useState } from 'react';
import { Users, Plus, Search, ChevronRight, Shield, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const CITIES = ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉', '西安', '重庆', '南京', '天津', '苏州', '郑州', '长沙', '东莞', '佛山', '青岛', '济南', '大连', '沈阳', '厦门', '福州', '合肥', '昆明', '哈尔滨'];

interface Employee {
  id: string;
  name: string;
  idCard: string;
  phone: string;
  bankAccount: string;
  bankName: string;
  department: string;
  position: string;
  baseSalary: number;
  socialCity: string;
  socialBase: number;
  housingBase: number;
  socialEnabled: boolean;
  housingEnabled: boolean;
  specialDeduction: {
    children: number;        // 子女教育（人数）
    housingLoan: boolean;    // 房贷
    housingRent: boolean;    // 住房租金
    elderly: number;        // 赡养老人（人数）
    continuing: boolean;    // 继续教育
  };
  status: 'active' | 'probation' | 'inactive';
  hireDate: string;
}

const EMPTY_FORM: Omit<Employee, 'id'> = {
  name: '', idCard: '', phone: '',
  bankAccount: '', bankName: '',
  department: '', position: '',
  baseSalary: 0,
  socialCity: '北京',
  socialBase: 0, housingBase: 0,
  socialEnabled: true, housingEnabled: true,
  specialDeduction: { children: 0, housingLoan: false, housingRent: false, elderly: 0, continuing: false },
  status: 'probation',
  hireDate: new Date().toISOString().slice(0, 10),
};

function EmployeeForm({
  employee,
  onSave,
  onClose,
}: {
  employee?: Employee;
  onSave: (emp: Employee) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Employee, 'id'>>(employee ? { ...employee } : { ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

  function set(key: keyof typeof EMPTY_FORM, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function setSD(key: keyof Employee['specialDeduction'], value: unknown) {
    setForm((f) => ({ ...f, specialDeduction: { ...f.specialDeduction, [key]: value } }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = '请输入姓名';
    if (!form.idCard.trim() || form.idCard.length !== 18) e.idCard = '请输入18位身份证号';
    if (!form.phone.trim() || !/^1\d{10}$/.test(form.phone)) e.phone = '请输入11位手机号';
    if (!form.bankAccount.trim()) e.bankAccount = '请输入工资卡号';
    if (!form.bankName.trim()) e.bankName = '请输入开户行';
    if (!form.department.trim()) e.department = '请输入部门';
    if (!form.position.trim()) e.position = '请输入职位';
    if (!form.baseSalary || form.baseSalary <= 0) e.baseSalary = '请输入月基本工资';
    if (form.socialEnabled && (!form.socialBase || form.socialBase <= 0)) e.socialBase = '请输入社保基数';
    if (form.housingEnabled && (!form.housingBase || form.housingBase <= 0)) e.housingBase = '请输入公积金基数';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave({
      ...form,
      id: employee?.id || 'E' + Date.now().toString().slice(-6),
    });
  }

  const inputStyle = (hasError?: string) => ({
    width: '100%', padding: '10px 12px', borderRadius: '10px', border: `1.5px solid ${hasError ? '#E53935' : '#EDEDED'}`,
    fontSize: '14px', backgroundColor: '#F7F7F7', outline: 'none', color: '#1A1A1A',
  });

  const labelStyle = { fontSize: '13px', fontWeight: '600' as const, color: '#1A1A1A', marginBottom: '6px' };
  const errorStyle = { fontSize: '11px', color: '#E53935', marginTop: '4px' };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex flex-col items-end" onClick={onClose}>
      <div
        className="bg-white w-full max-w-[380px] h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideInRight 0.25s ease-out' }}
      >
        {/* 头部 */}
        <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EDEDED' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
              <Users size={16} style={{ color: '#07C160' }} />
            </div>
            <span className="font-semibold text-base" style={{ color: '#1A1A1A' }}>
              {employee ? '编辑员工' : '新增员工'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full" style={{ backgroundColor: '#F0F0F0' }}>
            <X size={16} style={{ color: '#888888' }} />
          </button>
        </div>

        <div className="p-4 space-y-5">

          {/* 基本信息 */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: '#1A1A1A' }}>基本信息</p>
            {[
              { key: 'name', label: '姓名', placeholder: '张三', type: 'text' },
              { key: 'idCard', label: '身份证号', placeholder: '18位身份证号', type: 'text' },
              { key: 'phone', label: '手机号', placeholder: '11位手机号', type: 'tel' },
              { key: 'department', label: '部门', placeholder: '研发部', type: 'text' },
              { key: 'position', label: '职位', placeholder: '前端工程师', type: 'text' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key} className="mb-3">
                <p style={labelStyle}>{label}</p>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as Record<string, unknown>)[key] as string}
                  onChange={(e) => set(key as keyof typeof EMPTY_FORM, e.target.value)}
                  style={inputStyle(errors[key as keyof typeof errors])}
                />
                {errors[key as keyof typeof errors] && <p style={errorStyle}>{errors[key as keyof typeof errors]}</p>}
              </div>
            ))}

            {/* 入职日期 */}
            <div className="mb-3">
              <p style={labelStyle}>入职日期</p>
              <input
                type="date"
                value={form.hireDate}
                onChange={(e) => set('hireDate', e.target.value)}
                style={inputStyle()}
              />
            </div>

            {/* 状态 */}
            <div className="mb-3">
              <p style={labelStyle}>员工状态</p>
              <div className="flex gap-2">
                {[
                  { value: 'probation', label: '试用期' },
                  { value: 'active', label: '正式' },
                  { value: 'inactive', label: '离职' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => set('status', value as Employee['status'])}
                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: form.status === value ? '#E8F5E9' : '#F7F7F7',
                      color: form.status === value ? '#07C160' : '#888888',
                      border: `1.5px solid ${form.status === value ? '#07C160' : '#EDEDED'}`,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 工资结构 */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: '#1A1A1A' }}>工资结构</p>
            <div className="mb-3">
              <p style={labelStyle}>月基本工资（元）</p>
              <input
                type="number"
                placeholder="如：15000"
                value={form.baseSalary || ''}
                onChange={(e) => set('baseSalary', Number(e.target.value))}
                style={inputStyle(errors.baseSalary)}
              />
              {errors.baseSalary && <p style={errorStyle}>{errors.baseSalary}</p>}
            </div>
          </div>

          {/* 银行账户 */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: '#1A1A1A' }}>工资账户</p>
            {[
              { key: 'bankAccount', label: '工资卡号', placeholder: '银行卡号', type: 'text' },
              { key: 'bankName', label: '开户行', placeholder: '如：招商银行北京中关村支行', type: 'text' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key} className="mb-3">
                <p style={labelStyle}>{label}</p>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as Record<string, unknown>)[key] as string}
                  onChange={(e) => set(key as keyof typeof EMPTY_FORM, e.target.value)}
                  style={inputStyle(errors[key as keyof typeof errors])}
                />
                {errors[key as keyof typeof errors] && <p style={errorStyle}>{errors[key as keyof typeof errors]}</p>}
              </div>
            ))}
          </div>

          {/* 社保公积金 */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: '#1A1A1A' }}>社保公积金</p>
            <div className="mb-3">
              <p style={labelStyle}>参保城市</p>
              <select
                value={form.socialCity}
                onChange={(e) => set('socialCity', e.target.value)}
                style={{ ...inputStyle(), appearance: 'none', paddingRight: '12px' }}
              >
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* 社保开关 */}
            <div className="flex items-center justify-between mb-3 p-3 rounded-xl" style={{ backgroundColor: '#F7F7F7', border: '1px solid #EDEDED' }}>
              <div className="flex items-center gap-2">
                <Shield size={16} style={{ color: '#07C160' }} />
                <span className="text-sm" style={{ color: '#1A1A1A' }}>参加社保</span>
              </div>
              <button
                onClick={() => set('socialEnabled', !form.socialEnabled)}
                className="relative w-11 h-6 rounded-full transition-all"
                style={{ backgroundColor: form.socialEnabled ? '#07C160' : '#DDDDDD' }}
              >
                <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: form.socialEnabled ? '26px' : '2px' }} />
              </button>
            </div>

            {form.socialEnabled && (
              <div className="mb-3">
                <p style={labelStyle}>社保基数</p>
                <input
                  type="number"
                  placeholder="如：10000"
                  value={form.socialBase || ''}
                  onChange={(e) => set('socialBase', Number(e.target.value))}
                  style={inputStyle(errors.socialBase)}
                />
                {errors.socialBase && <p style={errorStyle}>{errors.socialBase}</p>}
              </div>
            )}

            {/* 公积金开关 */}
            <div className="flex items-center justify-between mb-3 p-3 rounded-xl" style={{ backgroundColor: '#F7F7F7', border: '1px solid #EDEDED' }}>
              <div className="flex items-center gap-2">
                <Shield size={16} style={{ color: '#07C160' }} />
                <span className="text-sm" style={{ color: '#1A1A1A' }}>参加公积金</span>
              </div>
              <button
                onClick={() => set('housingEnabled', !form.housingEnabled)}
                className="relative w-11 h-6 rounded-full transition-all"
                style={{ backgroundColor: form.housingEnabled ? '#07C160' : '#DDDDDD' }}
              >
                <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: form.housingEnabled ? '26px' : '2px' }} />
              </button>
            </div>

            {form.housingEnabled && (
              <div className="mb-3">
                <p style={labelStyle}>公积金基数</p>
                <input
                  type="number"
                  placeholder="如：10000"
                  value={form.housingBase || ''}
                  onChange={(e) => set('housingBase', Number(e.target.value))}
                  style={inputStyle(errors.housingBase)}
                />
                {errors.housingBase && <p style={errorStyle}>{errors.housingBase}</p>}
              </div>
            )}
          </div>

          {/* 专项附加扣除 */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: '#1A1A1A' }}>专项附加扣除</p>
            <div className="space-y-2">
              {[
                { key: 'children', label: '子女教育（3岁以下婴幼儿）', unit: '人', max: 3 },
                { key: 'elderly', label: '赡养老人', unit: '人', max: 4 },
              ].map(({ key, label, unit, max }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#F7F7F7', border: '1px solid #EDEDED' }}>
                  <div>
                    <p className="text-sm" style={{ color: '#1A1A1A' }}>{label}</p>
                    <p className="text-xs" style={{ color: '#07C160' }}>¥1,000/人/月</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSD(key as keyof Employee['specialDeduction'], Math.max(0, (form.specialDeduction as Record<string, unknown>)[key] as number - 1))}
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                      style={{ backgroundColor: '#FFFFFF', color: '#07C160', border: '1.5px solid #07C160' }}
                    >−</button>
                    <span className="w-6 text-center font-bold" style={{ color: '#1A1A1A' }}>{(form.specialDeduction as Record<string, unknown>)[key] as number}</span>
                    <button
                      onClick={() => setSD(key as keyof Employee['specialDeduction'], Math.min(max, (form.specialDeduction as Record<string, unknown>)[key] as number + 1))}
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                      style={{ backgroundColor: '#07C160', color: '#FFFFFF' }}
                    >+</button>
                  </div>
                </div>
              ))}

              {[
                { key: 'housingLoan', label: '住房贷款利息' },
                { key: 'housingRent', label: '住房租金' },
                { key: 'continuing', label: '继续教育' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#F7F7F7', border: '1px solid #EDEDED' }}>
                  <span className="text-sm" style={{ color: '#1A1A1A' }}>{label}</span>
                  <button
                    onClick={() => setSD(key as keyof Employee['specialDeduction'], !(form.specialDeduction as Record<string, unknown>)[key])}
                    className="relative w-11 h-6 rounded-full transition-all"
                    style={{ backgroundColor: (form.specialDeduction as Record<string, unknown>)[key] ? '#07C160' : '#DDDDDD' }}
                  >
                    <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: (form.specialDeduction as Record<string, unknown>)[key] ? '26px' : '2px' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 提交 */}
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-base mt-2"
            style={{ background: 'linear-gradient(135deg, #07C160 0%, #06AD56 100%)', boxShadow: '0 4px 16px rgba(7,193,96,0.35)' }}
          >
            {employee ? '保存修改' : '添加员工'}
          </button>
        </div>
      </div>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}

// 员工类型存入 store
function Employees() {
  const { employees, setEmployees } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'active' | 'probation' | 'inactive'>('active');

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.includes(search) || e.department.includes(search);
    const matchTab = e.status === tab;
    return matchSearch && matchTab;
  });

  function handleSave(emp: Employee) {
    if (editing) {
      setEmployees(employees.map((e) => (e.id === emp.id ? emp : e)));
    } else {
      setEmployees([...employees, emp]);
    }
    setShowForm(false);
    setEditing(undefined);
  }

  const counts = {
    active: employees.filter((e) => e.status === 'active').length,
    probation: employees.filter((e) => e.status === 'probation').length,
    inactive: employees.filter((e) => e.status === 'inactive').length,
  };

  const STATUS_LABEL: Record<string, string> = { active: '正式', probation: '试用期', inactive: '离职' };
  const STATUS_COLOR: Record<string, string> = { active: '#07C160', probation: '#FF9800', inactive: '#888888' };

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#F7F7F7' }}>
      {/* 头部 */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px 16px 12px', borderBottom: '1px solid #EDEDED' }}>
        <div className="flex items-center justify-between mb-3">
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1A1A1A' }}>员工管理</h1>
          <button
            onClick={() => { setEditing(undefined); setShowForm(true); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#E8F5E9', color: '#07C160' }}
          >
            <Plus size={14} /> 添加员工
          </button>
        </div>

        {/* Tab切换 */}
        <div className="flex gap-1 mb-3">
          {(['active', 'probation', 'inactive'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: tab === t ? '#E8F5E9' : 'transparent',
                color: tab === t ? '#07C160' : '#888888',
                border: `1px solid ${tab === t ? '#C8E6C9' : 'transparent'}`,
              }}
            >
              {STATUS_LABEL[t]} {counts[t]}人
            </button>
          ))}
        </div>

        {/* 搜索 */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#F7F7F7', border: '1px solid #EDEDED' }}>
          <Search size={15} style={{ color: '#BBBBBB' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索姓名或部门..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: '#1A1A1A' }}
          />
        </div>
      </div>

      {/* 列表 */}
      <div style={{ padding: '12px 16px' }}>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">👥</p>
            <p className="text-sm" style={{ color: '#BBBBBB' }}>暂无{STATUS_LABEL[tab]}员工</p>
            {tab !== 'inactive' && (
              <button
                onClick={() => { setEditing(undefined); setShowForm(true); }}
                className="mt-4 px-4 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: '#E8F5E9', color: '#07C160' }}
              >
                + 添加第一个员工
              </button>
            )}
          </div>
        )}

        {filtered.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-xl p-4 mb-2 cursor-pointer transition-all"
            style={{ border: '1px solid #EDEDED' }}
            onClick={() => { setEditing(emp); setShowForm(true); }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: STATUS_COLOR[emp.status] }}
                >
                  {emp.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{emp.name}</p>
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#F0F0F0', color: STATUS_COLOR[emp.status] }}>
                      {STATUS_LABEL[emp.status]}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#888888' }}>{emp.department} · {emp.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>¥{emp.baseSalary.toLocaleString()}</p>
                  <p className="text-xs" style={{ color: '#888888' }}>基本工资</p>
                </div>
                <ChevronRight size={16} style={{ color: '#BBBBBB' }} />
              </div>
            </div>

            {/* 标签行 */}
            <div className="flex flex-wrap gap-1 mt-2">
              {[
                { label: emp.socialCity, color: '#F0F0F0' },
                { label: emp.socialEnabled ? `社保基数¥${emp.socialBase.toLocaleString()}` : '未参保', color: emp.socialEnabled ? '#E8F5E9' : '#FFF3E0' },
                { label: emp.housingEnabled ? `公积金¥${emp.housingBase.toLocaleString()}` : '无公积金', color: emp.housingEnabled ? '#E8F5E9' : '#FFF3E0' },
              ].map(({ label, color }) => (
                <span key={label} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: color, color: '#666666' }}>{label}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 表单弹窗 */}
      {showForm && (
        <EmployeeForm
          employee={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}
    </div>
  );
}

export default Employees;
