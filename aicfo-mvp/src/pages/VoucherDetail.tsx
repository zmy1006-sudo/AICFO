/**
 * 凭证详情页面
 * 查看凭证分录、确认入账、审核、修改、作废（红字凭证）
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Edit3, X, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateId } from '../api/mockEngine';
import type { VoucherStatus, Voucher } from '../types';

const STATUS_ACTION: Record<VoucherStatus, { next: VoucherStatus | null; label: string; color: string } | null> = {
  '草稿': { next: '待审核', label: '提交审核', color: 'bg-amber-500 hover:bg-amber-600' },
  '待审核': { next: '已入账', label: '确认入账', color: 'bg-green-600 hover:bg-green-700' },
  '已入账': null,
  '已作废': null,
};

export default function VoucherDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vouchers, updateVoucherStatus, addVoucher, enterprise, userName } = useAppStore();
  const voucher = vouchers.find((v) => v.id === id);
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [showModifyTip, setShowModifyTip] = useState(false);

  if (!voucher) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-gray-400">凭证不存在</p>
        <button onClick={() => navigate('/vouchers')} className="mt-3 text-[#07C160] text-sm">
          返回凭证列表
        </button>
      </div>
    );
  }

  const action = STATUS_ACTION[voucher.status];

  function handleStatusChange(next: VoucherStatus) {
    updateVoucherStatus(voucher.id, next);
  }

  /**
   * 作废凭证：生成红字凭证（原凭证金额取反），同时将原凭证状态改为"已作废"
   */
  function handleVoid() {
    if (voucher.status === '已作废') return;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    // 红字凭证：借贷方向对调，金额取反
    const redVoucher: Omit<Voucher, 'id' | 'voucherNo' | 'createdAt' | 'updatedAt'> = {
      enterpriseId: voucher.enterpriseId,
      date: today,
      summary: `[作废] ${voucher.summary}`,
      status: '已入账',
      amount: voucher.amount,
      items: voucher.items.map((item) => ({
        id: generateId(),
        voucherId: '',
        // 红字：借贷方向互换
        direction: item.direction === '借' ? '贷' as const : '借' as const,
        accountName: item.accountName,
        amount: -item.amount, // 红字金额为负
      })),
      creator: userName || '管理员',
      reviewer: userName || '管理员',
    };

    addVoucher(redVoucher);
    updateVoucherStatus(voucher.id, '已作废');
    setShowVoidConfirm(false);
  }

  const totalDebit = voucher.items
    .filter((i) => i.direction === '借')
    .reduce((s, i) => s + i.amount, 0);
  const totalCredit = voucher.items
    .filter((i) => i.direction === '贷')
    .reduce((s, i) => s + i.amount, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 顶部栏 */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 hover:bg-[#F0F0F0] rounded-lg">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="font-semibold text-gray-900">凭证详情</h1>
        <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium ${
          voucher.status === '已入账' ? 'bg-green-50 text-green-600' :
          voucher.status === '待审核' ? 'bg-amber-50 text-amber-600' :
          voucher.status === '草稿' ? 'bg-[#F0F0F0] text-gray-500' :
          'bg-red-50 text-red-400'
        }`}>
          {voucher.status}
        </span>
      </div>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* 凭证信息卡 */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-sm text-gray-400">{voucher.voucherNo}</span>
            <span className="text-xs text-gray-400">{voucher.date}</span>
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">{voucher.summary}</h2>
          <p className="text-2xl font-bold text-gray-900">
            ¥{voucher.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
            <span>制单：{voucher.creator}</span>
            {voucher.reviewer && <span>审核：{voucher.reviewer}</span>}
          </div>
        </div>

        {/* 借贷平衡提示 */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
          isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {isBalanced ? (
            <>
              <CheckCircle size={16} />
              借贷平衡 ✓（借方 = 贷方 = ¥{totalDebit.toLocaleString()}）
            </>
          ) : (
            <>
              <XCircle size={16} />
              借贷不平衡！借方 ¥{totalDebit.toLocaleString()} ≠ 贷方 ¥{totalCredit.toLocaleString()}
            </>
          )}
        </div>

        {/* 凭证分录 */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 font-medium text-sm text-gray-700">
            凭证分录
          </div>

          {/* 表头 */}
          <div className="grid grid-cols-12 px-4 py-2 bg-[#F7F7F7] text-xs text-gray-400 font-medium">
            <span className="col-span-2">方向</span>
            <span className="col-span-5">科目</span>
            <span className="col-span-5 text-right">金额</span>
          </div>

          {/* 分录行 */}
          {voucher.items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 px-4 py-3 border-b border-gray-50 items-center">
              <span className={`col-span-2 text-sm font-medium ${
                item.direction === '借' ? 'text-[#07C160]' : 'text-orange-500'
              }`}>
                {item.direction}
              </span>
              <span className="col-span-5 text-sm text-gray-800">{item.accountName}</span>
              <span className="col-span-5 text-right font-mono text-sm text-gray-900">
                ¥{item.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}

          {/* 合计行 */}
          <div className="grid grid-cols-12 px-4 py-3 bg-[#F7F7F7] font-medium">
            <span className="col-span-7 text-sm text-gray-600">合计</span>
            <span className="col-span-5 text-right font-mono text-sm text-gray-900">
              ¥{voucher.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 操作区 */}
        <div className="space-y-2">
          {action && action.next && (
            <button
              onClick={() => handleStatusChange(action.next!)}
              className={`w-full ${action.color} text-white font-medium py-3 rounded-xl transition-colors`}
            >
              {action.label}
            </button>
          )}

          {/* 修改凭证（已入账状态可修改） */}
          {(voucher.status === '已入账' || voucher.status === '待审核') && (
            <button
              onClick={() => setShowModifyTip(true)}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-[#F7F7F7] font-medium py-3 rounded-xl transition-colors"
            >
              <Edit3 size={15} />
              修改凭证
            </button>
          )}

          {/* 作废凭证 */}
          {(voucher.status === '已入账' || voucher.status === '待审核') && (
            <button
              onClick={() => setShowVoidConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 font-medium py-3 rounded-xl transition-colors"
            >
              <X size={15} />
              作废凭证（生成红字）
            </button>
          )}

          {voucher.status === '草稿' && (
            <button
              onClick={() => handleStatusChange('已作废')}
              className="w-full bg-white border border-gray-200 text-gray-500 hover:bg-[#F7F7F7] font-medium py-3 rounded-xl transition-colors"
            >
              删除草稿
            </button>
          )}

          {voucher.status === '已入账' && (
            <button
              onClick={() => handleStatusChange('待审核')}
              className="w-full bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 font-medium py-3 rounded-xl transition-colors"
            >
              申请反审核
            </button>
          )}
        </div>
      </div>

      {/* 作废确认弹窗 */}
      {showVoidConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={20} className="text-red-500" />
              <h3 className="font-bold text-gray-900">确认作废此凭证？</h3>
            </div>
            <p className="text-sm text-gray-500 mb-1">作废后系统将自动生成一张<strong className="text-red-500">红字凭证</strong>（借贷方向互换、金额取反），原凭证状态更新为「已作废」。</p>
            <p className="text-xs text-gray-400 mb-5">此操作不可撤销。</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowVoidConfirm(false)}
                className="flex-1 py-2.5 bg-[#F0F0F0] text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleVoid}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                确认作废
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 修改提示 */}
      {showModifyTip && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Edit3 size={20} style={{ color: '#3B5BDB' }} />
              <h3 className="font-bold text-gray-900">修改凭证</h3>
            </div>
            <p className="text-sm text-gray-600 mb-1">请在「AI记账」中重新描述这笔业务，系统将生成新的凭证草稿。</p>
            <p className="text-xs text-gray-400 mb-5">建议先作废原凭证，再重新录入。</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowModifyTip(false)}
                className="flex-1 py-2.5 bg-[#F0F0F0] text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                知道了
              </button>
              <button
                onClick={() => { setShowModifyTip(false); navigate('/chat'); }}
                className="flex-1 py-2.5 text-white rounded-xl font-medium transition-colors"
                style={{ backgroundColor: '#3B5BDB' }}
              >
                去记账
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
