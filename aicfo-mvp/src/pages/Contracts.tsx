/**
 * 合同管理页面
 * 合同列表 + 状态标签 + 新建/编辑/删除
 */

import React, { useState, useMemo } from 'react';
import { Plus, ChevronRight, FileText, AlertCircle, CheckCircle2, Clock, X, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Contract } from '../types';

const CONTRACT_TYPES: Contract['type'][] = ['采购合同', '销售合同', '服务合同', '租赁合同', '其他'];

const STATUS_CONFIG: Record<Contract['status'], {
  bg: string;
  text: string;
  icon: React.ElementType;
}> = {
  '执行中': { bg: 'bg-green-50', text: 'text-green-600', icon: CheckCircle2 },
  '即将到期': { bg: 'bg-amber-50', text: 'text-amber-600', icon: AlertCircle },
  '已完成': { bg: 'bg-gray-100', text: 'text-gray-500', icon: Clock },
  '已终止': { bg: 'bg-red-50', text: 'text-red-500', icon: X },
};

function fmt(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
}

function daysLeft(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatus(endDate: string, currentStatus: Contract['status']): Contract['status'] {
  if (currentStatus === '已完成' || currentStatus === '已终止') return currentStatus;
  const days = daysLeft(endDate);
  if (days < 0) return '已完成';
  if (days <= 30) return '即将到期';
  return '执行中';
}

export default function Contracts() {
  const { contracts, addContract, updateContract, deleteContract } = useAppStore();

  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('全部');

  const [form, setForm] = useState({
    name: '',
    type: '采购合同' as Contract['type'],
    counterparty: '',
    amount: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { 全部: contracts.length, 执行中: 0, 即将到期: 0, 已完成: 0, 已终止: 0 };
    contracts.forEach((c) => {
      const status = getStatus(c.endDate, c.status);
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    if (filterStatus === '全部') return contracts;
    return contracts.filter((c) => {
      const status = getStatus(c.endDate, c.status);
      return status === filterStatus;
    });
  }, [contracts, filterStatus]);

  function openAddModal() {
    setEditingContract(null);
    setForm({ name: '', type: '采购合同', counterparty: '', amount: '', startDate: '', endDate: '', description: '' });
    setShowModal(true);
  }

  function openEditModal(contract: Contract) {
    setEditingContract(contract);
    setForm({
      name: contract.name,
      type: contract.type,
      counterparty: contract.counterparty,
      amount: contract.amount.toString(),
      startDate: contract.startDate,
      endDate: contract.endDate,
      description: contract.description || '',
    });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name || !form.counterparty || !form.amount || !form.startDate || !form.endDate) {
      alert('请填写必填项');
      return;
    }

    const contractData = {
      name: form.name,
      type: form.type,
      counterparty: form.counterparty,
      amount: parseFloat(form.amount),
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description || undefined,
      status: getStatus(form.endDate, '执行中') as Contract['status'],
    };

    if (editingContract) {
      updateContract(editingContract.id, contractData);
    } else {
      addContract(contractData);
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    if (confirm('确认删除此合同？')) {
      deleteContract(id);
    }
  }

  function handleTerminate(contract: Contract) {
    if (confirm('确认终止此合同？')) {
      updateContract(contract.id, { status: '已终止' });
    }
  }

  const statusOptions = ['全部', '执行中', '即将到期', '已完成', '已终止'];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 头部 */}
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-[#07C160]" />
              <h1 className="text-lg font-bold text-gray-900">合同管理</h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">共{contracts.length}份合同</p>
          </div>
          <button
            onClick={openAddModal}
            className="w-10 h-10 rounded-full bg-[#07C160] flex items-center justify-center shadow-sm"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* 状态筛选 */}
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: filterStatus === status ? '#07C160' : '#F0F0F0',
                color: filterStatus === status ? '#FFFFFF' : '#666666',
              }}
            >
              {status} {statusCounts[status] > 0 && `(${statusCounts[status]})`}
            </button>
          ))}
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500">执行中</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{statusCounts['执行中']}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs text-gray-500">即将到期</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{statusCounts['即将到期']}</p>
          </div>
        </div>

        {/* 合同列表 */}
        {filteredContracts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">暂无合同</p>
            <button
              onClick={openAddModal}
              className="mt-3 px-4 py-2 bg-[#07C160] text-white text-sm rounded-full"
            >
              新建合同
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContracts.map((contract) => {
              const status = getStatus(contract.endDate, contract.status);
              const cfg = STATUS_CONFIG[status];
              const Icon = cfg.icon;
              const days = daysLeft(contract.endDate);

              return (
                <div key={contract.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <Icon size={20} className={cfg.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-800 text-sm truncate">{contract.name}</h3>
                        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{contract.counterparty}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium text-[#07C160]">¥{fmt(contract.amount)}</span>
                        {status === '即将到期' && (
                          <span className="text-xs text-amber-500">剩余{days}天</span>
                        )}
                        {status === '执行中' && (
                          <span className="text-xs text-gray-400">剩余{days}天</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => openEditModal(contract)}
                      className="flex-1 py-1.5 text-xs text-gray-500 hover:text-[#07C160] transition-colors"
                    >
                      编辑
                    </button>
                    {status !== '已完成' && status !== '已终止' && (
                      <button
                        onClick={() => handleTerminate(contract)}
                        className="flex-1 py-1.5 text-xs text-red-400 hover:text-red-500 transition-colors"
                      >
                        终止
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(contract.id)}
                      className="flex-1 py-1.5 text-xs text-red-400 hover:text-red-500 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 新建/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowModal(false)}>
          <div
            className="bg-white w-full max-w-md rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            style={{ paddingBottom: 'max(60px, env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingContract ? '编辑合同' : '新建合同'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">合同名称 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="请输入合同名称"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">合同类型 *</label>
                <div className="flex gap-2 flex-wrap">
                  {CONTRACT_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm({ ...form, type })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        form.type === type ? 'bg-[#07C160] text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">对方单位 *</label>
                <input
                  type="text"
                  value={form.counterparty}
                  onChange={(e) => setForm({ ...form, counterparty: e.target.value })}
                  placeholder="请输入对方单位名称"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">合同金额 *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">开始日期 *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">结束日期 *</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">备注</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="可选"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
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
