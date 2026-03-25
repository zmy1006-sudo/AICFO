/**
 * 凭证卡片组件
 * Phase 3: 增加已作废状态样式
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Voucher, VoucherStatus } from '../types';

const STATUS_CONFIG: Record<VoucherStatus, { label: string; color: string; icon: React.ElementType }> = {
  '草稿': { label: '草稿', color: 'bg-gray-100 text-gray-500', icon: Clock },
  '待审核': { label: '待审核', color: 'bg-amber-50 text-amber-600', icon: Clock },
  '已入账': { label: '已入账', color: 'bg-green-50 text-green-600', icon: CheckCircle },
  '已作废': { label: '已作废', color: 'bg-red-50 text-red-400', icon: XCircle },
};

interface VoucherCardProps {
  voucher: Voucher;
  onClick?: () => void;
}

export default function VoucherCard({ voucher, onClick }: VoucherCardProps) {
  const statusCfg = STATUS_CONFIG[voucher.status];
  const StatusIcon = statusCfg.icon;
  const isCancelled = voucher.status === '已作废';

  return (
    <div
      className={`bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer ${isCancelled ? 'opacity-50' : ''}`}
      onClick={onClick}
    >
      {/* 顶部：凭证号 + 状态 */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-mono ${isCancelled ? 'text-gray-300' : 'text-gray-400'}`}>
          {voucher.voucherNo}
        </span>
        {isCancelled ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-400">
            <XCircle size={12} />
            已作废
          </span>
        ) : (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
            <StatusIcon size={12} />
            {statusCfg.label}
          </span>
        )}
      </div>

      {/* 摘要 */}
      <p className={`text-sm font-medium mb-2 leading-snug ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
        {voucher.summary}
      </p>

      {/* 金额 */}
      <div className="flex items-end justify-between">
        <div className={`text-xs ${isCancelled ? 'text-gray-300' : 'text-gray-400'}`}>
          <span>{voucher.date}</span>
          <span className="mx-1">·</span>
          <span>{voucher.creator}</span>
        </div>
        <div className={`text-lg font-bold ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
          ¥{voucher.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* 分录预览 */}
      {voucher.items.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-50">
          {voucher.items.slice(0, 2).map((item) => (
            <div key={item.id} className={`flex justify-between text-xs py-0.5 ${isCancelled ? 'text-gray-300' : 'text-gray-500'}`}>
              <span className={item.direction === '借' ? 'text-[#07C160]' : 'text-[#FF9800]'}>
                [{item.direction}] {item.accountName}
              </span>
              <span className="font-mono">¥{item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
