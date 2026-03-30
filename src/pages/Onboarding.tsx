/**
 * 冷启动引导页面
 * 页面加载 → 自动用演示代码查询 → Step2确认企业信息 → 点击"激活AICFO"直接进入系统
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Enterprise, TaxType } from '../types';

// Mock企业数据库（真实场景对接企查查API）
const MOCK_ENTERPRISE_DB: Record<string, Enterprise> = {
  '91110108MA01ABC123': {
    id: 'ent-001',
    creditCode: '91110108MA01ABC123',
    name: '北京云起科技有限公司',
    taxType: '小规模纳税人',
    registeredAddress: '北京市海淀区中关村大街1号',
    registeredCapital: '100万元人民币',
  },
  '91310000MA1FWXYZ456': {
    id: 'ent-002',
    creditCode: '91310000MA1FWXYZ456',
    name: '上海智联数字技术有限公司',
    taxType: '一般纳税人',
    registeredAddress: '上海市浦东新区张江高科技园区',
    registeredCapital: '500万元人民币',
  },
};

const TAX_TYPE_OPTIONS: TaxType[] = ['小规模纳税人', '一般纳税人'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setEnterprise, setUserName, setOnboarded, setIsDemo, enterprise } = useAppStore();

  // 如果已初始化，直接跳转
  React.useEffect(() => {
    if (enterprise) {
      navigate('/chat');
    }
  }, []);

  const [step, setStep] = useState(1);
  // 默认预填演示信用代码（小规模纳税人）
  const [creditCode, setCreditCode] = useState('91110108MA01ABC123');
  const [isLoading, setIsLoading] = useState(false);
  const [foundEnterprise, setFoundEnterprise] = useState<Enterprise | null>(null);
  const [searchError, setSearchError] = useState('');

  // 页面加载时自动触发查询（600ms延迟）
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step 1: 查询企业
  async function handleSearch() {
    if (!creditCode.trim()) {
      setSearchError('请输入统一社会信用代码');
      return;
    }
    setIsLoading(true);
    setSearchError('');

    // Mock API延迟
    await new Promise((r) => setTimeout(r, 1200));

    const found = MOCK_ENTERPRISE_DB[creditCode.trim()];
    if (found) {
      setFoundEnterprise(found);
      setStep(2);
    } else {
      // 未知信用代码也允许继续，生成示例数据
      setFoundEnterprise({
        id: 'ent-new',
        creditCode: creditCode.trim(),
        name: '示例科技有限公司',
        taxType: '小规模纳税人',
        registeredAddress: '北京市朝阳区',
        registeredCapital: '50万元人民币',
      });
      setStep(2);
    }
    setIsLoading(false);
  }

  // Step 2: 确认企业信息，直接激活系统
  function handleActivate() {
    if (!foundEnterprise) return;
    setEnterprise(foundEnterprise);
    setUserName('管理员');
    setOnboarded(true);
    navigate('/chat');
  }

  return (
    <div className="min-h-screen bg-[#F0F9F0] flex flex-col max-w-[430px] mx-auto">
      {/* 顶部 */}
      <div className="bg-white px-4 pt-10 pb-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-[#07C160] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">财</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">AICFO</h1>
            <p className="text-xs text-gray-400">AI财税助手 · 冷启动</p>
          </div>
        </div>

        {/* 步骤指示器：Step1查询 → Step2确认 */}
        <div className="flex items-center gap-2 mb-1">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  step >= s ? 'bg-[#07C160]' : 'bg-[#E8E8E8]'
                }`}
              />
            </React.Fragment>
          ))}
        </div>
        <div className="flex">
          <span className="flex-1 text-center text-xs font-medium text-[#07C160] mt-1">验证企业</span>
          <span className="flex-1 text-center text-xs font-medium mt-1" style={{ color: step >= 2 ? '#3B5BDB' : '#D1D5DB' }}>
            确认信息
          </span>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 bg-white rounded-t-3xl mt-4 px-5 pt-6 pb-8 shadow-lg">

        {/* Step 1: 输入信用代码 */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">验证企业信息</h2>
            <p className="text-sm text-gray-500 mb-6">输入统一社会信用代码，自动识别企业</p>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                统一社会信用代码
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={creditCode}
                  onChange={(e) => setCreditCode(e.target.value.toUpperCase())}
                  onFocus={() => { if (foundEnterprise) { setStep(1); setFoundEnterprise(null); } }}
                  placeholder="18位信用代码，如 91110108MA01ABC123"
                  className="w-full pl-9 pr-4 py-3 bg-[#F7F7F7] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#07C160] focus:ring-2 focus:ring-[#C8E6C9] transition-all"
                  maxLength={18}
                />
              </div>
              {searchError && (
                <p className="text-xs text-red-500 mt-1.5">{searchError}</p>
              )}
            </div>

            <div className="bg-[#F0F9F0] border border-[#C8E6C9] rounded-xl p-3 mb-6">
              <p className="text-xs text-[#07C160]">
                💡 演示信用代码：<br />
                <code className="font-mono">91110108MA01ABC123</code>（小规模纳税人）<br />
                <code className="font-mono">91310000MA1FWXYZ456</code>（一般纳税人）
              </p>
            </div>

            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full bg-[#07C160] hover:bg-[#06AD56] disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="animate-pulse">查询中...</span>
              ) : (
                <>
                  查询企业
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            {/* 一键体验入口 */}
            <button
              onClick={() => {
                const demo = MOCK_ENTERPRISE_DB['91110108MA01ABC123'];
                setEnterprise({ ...demo });
                setUserName('体验用户');
                setIsDemo(true); // 标记为演示模式，setOnboarded时自动生成3条演示凭证
                setOnboarded(true);
                navigate('/chat');
              }}
              className="w-full mt-3 bg-[#F0F0F0] hover:bg-[#E8E8E8] text-gray-600 font-medium py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-1"
            >
              体验一下，不注册 →
            </button>
          </div>
        )}

        {/* Step 2: 确认企业信息 → 激活系统 */}
        {step === 2 && foundEnterprise && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">确认企业信息</h2>
            <p className="text-sm text-gray-500 mb-5">核对信息，点击按钮直接激活AICFO</p>

            {/* 企业信息卡片 - 可编辑 */}
            <div className="bg-[#F7F7F7] border border-gray-100 rounded-xl p-4 mb-4">
              {/* 企业名称 */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-[#07C160]" />
                  <span className="text-xs font-medium text-gray-500">企业名称</span>
                </div>
                <input
                  type="text"
                  value={foundEnterprise.name}
                  onChange={(e) => setFoundEnterprise({ ...foundEnterprise, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#07C160] focus:ring-1 focus:ring-[#C8E6C9]"
                />
              </div>

              {/* 信用代码（只读） */}
              <div className="mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">信用代码</span>
                  <span className="font-mono text-xs text-gray-400">{foundEnterprise.creditCode}</span>
                </div>
              </div>

              {/* 注册资本 */}
              <div className="mb-3">
                <span className="text-xs font-medium text-gray-500 block mb-2">注册资本</span>
                <input
                  type="text"
                  value={foundEnterprise.registeredCapital}
                  onChange={(e) => setFoundEnterprise({ ...foundEnterprise, registeredCapital: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#07C160] focus:ring-1 focus:ring-[#C8E6C9]"
                />
              </div>

              {/* 注册地址 */}
              <div className="mb-1">
                <span className="text-xs font-medium text-gray-500 block mb-2">注册地址</span>
                <input
                  type="text"
                  value={foundEnterprise.registeredAddress}
                  onChange={(e) => setFoundEnterprise({ ...foundEnterprise, registeredAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#07C160] focus:ring-1 focus:ring-[#C8E6C9]"
                  placeholder="请输入注册地址"
                />
              </div>
            </div>

            {/* 纳税类型选择 */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">纳税类型</label>
              <div className="grid grid-cols-2 gap-2">
                {TAX_TYPE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFoundEnterprise({ ...foundEnterprise, taxType: t })}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                      foundEnterprise.taxType === t
                        ? 'border-[#07C160] bg-[#F0F9F0] text-[#07C160]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 直接激活按钮 */}
            <button
              onClick={handleActivate}
              className="w-full bg-[#07C160] hover:bg-[#06AD56] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-base shadow-sm"
            >
              激活AICFO，开启财税管理
              <ChevronRight size={20} />
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              如需修改信息，请在上方编辑后点击激活
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
