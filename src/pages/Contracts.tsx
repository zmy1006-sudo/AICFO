/**
 * 合同管理页面
 * 简化版：合同列表 + 状态标签 + 新建入口
 */

import React, { useState } from 'react';
import { Plus, ChevronRight, FileText, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

type ContractStatus = '执行中' | '即将到期' | '已完成';

interface Contract {
  id: string;
  name: string;
  counterparty: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  type: string;
}

const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'ct-001',
    name: '办公设备采购合同',
    counterparty: '京东电商平台',
    amount: 58000,
    startDate: '2026-01-15',
    endDate: '2026-07-15',
    status: '执行中',
    type: '采购合同',
  },
  {
    id: 'ct-002',
    name: '软件外包服务合同',
    counterparty: '北京华软科技有限公司',
    amount: 120000,
    startDate: '2025-10-01',
    endDate: '2026-03-31',
    status: '即将到期',
    type: '销售合同',
  },
  {
    id: 'ct-003',
    name: '云服务器租赁合同',
    counterparty: '阿里云计算有限公司',
    amount: 36000,
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    status: '已完成',
    type: '服务合同',
  },
];

const STATUS_CONFIG: Record<ContractStatus, {
  bg: string;
  text: string;
  icon: React.ElementType;
  border: string;
}> = {
  '执行中': {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: CheckCircle2,
    border: 'border-green-200',
  },
  '即将到期': {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    icon: AlertCircle,
    border: 'border-amber-200',
  },
  '已完成': {
    bg: 'bg-gray-50',
    text: 'text-gray-400',
    icon: Clock,
    border: 'border-gray-200',
  },
};

function fmt(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
}

function daysLeft(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function Contracts() {
  const [showNewTip, setShowNewTip] = useState(false);

  const executing = MOCK_CONTRACTS.filter((c) => c.status === '执行中').length;
  const expiring = MOCK_CONTRACTS.filter((c) => c.status === '即将到期').length;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 头部 */}
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-[#07C160]" />
            <h1 className="text-lg font-bold text-gray-900">合同管理</h1>
          </div>
          <button
            onClick={() => setShowNewTip(true)}
            className="flex items-center gap-1.5 bg-[#07C160] text-white text-xs font-medium px-3 py-1.5 rounded-full"
          >
            <Plus size={14} />
            新建合同
          </button>
        </div>

        {/* 统计 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#F0F9F0] rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-[#07C160]">{executing}</p>
            <p className="text-xs text-[#07C160]">执行中</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-amber-600">{expiring}</p>
            <p className="text-xs text-amber-500">即将到期</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-gray-400">{MOCK_CONTRACTS.length}</p>
            <p className="text-xs text-gray-400">全部合同</p>
          </div>
        </div>
      </div>

      {/* 合同列表 */}
      <div className="px-4 py-4 space-y-3 pb-8">
        {MOCK_CONTRACTS.map((contract) => {
          const cfg = STATUS_CONFIG[contract.status];
          const Icon = cfg.icon;
          const left = daysLeft(contract.endDate);

          return (
            <div
              key={contract.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            >
              {/* 顶部：名称+状态 */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm leading-snug">{contract.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{contract.type}</p>
                </div>
                <div className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-full border ${cfg.bg} ${cfg.border}`}>
                  <Icon size={11} className={cfg.text} />
                  <span className={`text-xs font-medium ${cfg.text}`}>{contract.status}</span>
                </div>
              </div>

              {/* 对方单位 */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-[#F0F0F0] rounded-lg flex items-center justify-center">
                  <span className="text-xs">🏢</span>
                </div>
                <span className="text-xs text-gray-600">{contract.counterparty}</span>
              </div>

              {/* 金额+到期日 */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div>
                  <p className="text-xs text-gray-400">合同金额</p>
                  <p className="text-base font-bold text-gray-800">¥{fmt(contract.amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">到期日</p>
                  <p className="text-sm font-medium text-gray-700">{contract.endDate}</p>
                  {contract.status === '即将到期' && (
                    <p className="text-xs text-amber-500 font-medium">
                      剩余 {left} 天
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 新建弹窗 */}
      {showNewTip && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setShowNewTip(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-xs text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-3">📑</div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">合同管理</h3>
            <p className="text-sm text-gray-500 mb-5">合同功能即将上线，敬请期待！</p>
            <button
              onClick={() => setShowNewTip(false)}
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
