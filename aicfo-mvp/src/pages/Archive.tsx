/**
 * 档案管理页面
 * 凭证汇总册、账簿、财务报告等自动归档管理
 */

import React, { useState, useMemo } from 'react';
import { Archive as ArchiveIcon, FileText, Calendar, Download, Trash2, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

function Book(props: { size: number; className?: string }) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function BarChart2(props: { size: number; className?: string }) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

const ARCHIVE_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  '月度凭证汇总': { icon: FileText, color: '#07C160', bg: '#E8F5E9' },
  '账簿': { icon: Book, color: '#3B82F6', bg: '#EFF6FF' },
  '财务报表': { icon: BarChart2, color: '#8B5CF6', bg: '#F5F3FF' },
  '年度财务报告': { icon: FileText, color: '#F59E0B', bg: '#FEF3C7' },
  '税务资料': { icon: Calendar, color: '#EF4444', bg: '#FEE2E2' },
  '合同': { icon: FileText, color: '#6366F1', bg: '#EEF2FF' },
};

function fmt(n: number) {
  return n.toLocaleString('zh-CN');
}

export default function Archive() {
  const { vouchers, archives, addArchive, updateArchiveStatus, generateMonthlyArchive, enterprise } = useAppStore();

  const [filterType, setFilterType] = useState<string>('全部');
  const [filterStatus, setFilterStatus] = useState<string>('全部');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const monthlyStats = useMemo(() => {
    const stats: Record<string, { income: number; expense: number; count: number }> = {};
    vouchers.forEach((v) => {
      const key = v.date.slice(0, 7);
      if (!stats[key]) stats[key] = { income: 0, expense: 0, count: 0 };
      stats[key].count++;
      if (v.status === '已入账' || v.status === '已归档') {
        const isIncome = v.items.some((i) => i.direction === '借' && i.accountName.includes('银行'));
        const isExpense = v.items.some((i) => i.direction === '贷' && i.accountName.includes('银行'));
        if (isIncome && !isExpense) stats[key].income += v.amount;
        if (!isIncome && isExpense) stats[key].expense += v.amount;
      }
    });
    return stats;
  }, [vouchers]);

  const filteredArchives = useMemo(() => {
    return archives.filter((a) => {
      if (filterType !== '全部' && a.type !== filterType) return false;
      if (filterStatus !== '全部' && a.status !== filterStatus) return false;
      return true;
    });
  }, [archives, filterType, filterStatus]);

  function handleGenerateMonthly(year: number, month: number) {
    generateMonthlyArchive(year, month);
  }

  function handleDownloadArchive(archive: typeof archives[0]) {
    const content = `AICFO 档案导出\n\n档案类型：${archive.type}\n档案标题：${archive.title}\n所属期间：${archive.period}\n状态：${archive.status}\n创建时间：${archive.createdAt}\n归档时间：${archive.archivedAt || '-'}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${archive.title}.txt`;
    a.click();
  }

  function handleDestory(archive: typeof archives[0]) {
    if (archive.status !== '待销毁') {
      updateArchiveStatus(archive.id, '待销毁');
    } else {
      if (confirm('确认销毁此档案？此操作不可撤销。')) {
        updateArchiveStatus(archive.id, '已销毁');
      }
    }
  }

  const typeOptions = ['全部', '月度凭证汇总', '账簿', '财务报表', '年度财务报告', '税务资料', '合同'];
  const statusOptions = ['全部', '待归档', '已归档', '待销毁', '已销毁'];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <ArchiveIcon size={20} className="text-[#07C160]" />
          <h1 className="text-lg font-bold text-gray-900">档案管理</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">依据《会计档案管理办法》自动管理</p>
      </div>

      <div className="px-4 py-4 space-y-4 pb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">凭证汇总生成</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">自动生成月度凭证汇总册PDF</p>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3].map((offset) => {
              const month = currentMonth - offset;
              const year = month <= 0 ? currentYear - 1 : currentYear;
              const adjustedMonth = month <= 0 ? month + 12 : month;
              const key = `${year}-${String(adjustedMonth).padStart(2, '0')}`;
              const stats = monthlyStats[key];
              const hasArchive = archives.some((a) => a.period === key && a.type === '月度凭证汇总');

              return (
                <div key={key} className="p-3 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">{year}年{adjustedMonth}月</span>
                    {hasArchive ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#07C160]">已生成</span>
                    ) : stats ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{stats.count}笔</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">无数据</span>
                    )}
                  </div>
                  {stats && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-green-600">+{fmt(stats.income)}</span>
                      <span className="text-red-500">-{fmt(stats.expense)}</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleGenerateMonthly(year, adjustedMonth)}
                    disabled={!stats || hasArchive}
                    className="w-full mt-2 py-1.5 text-xs rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: hasArchive ? '#E8F5E9' : '#07C160', color: hasArchive ? '#07C160' : '#FFFFFF' }}
                  >
                    {hasArchive ? '已归档' : '生成汇总'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">保管期限</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-gray-400" />
                <span className="text-sm text-gray-700">10年</span>
              </div>
              <span className="text-xs text-gray-500">凭证/账簿/财务报告/发票/工资/合同</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-amber-500" />
                <span className="text-sm text-amber-700">永久</span>
              </div>
              <span className="text-xs text-amber-600">会计档案销毁清单</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-gray-800">档案列表</h2>
            <span className="text-xs text-gray-400">({filteredArchives.length})</span>
          </div>

          <div className="flex gap-2 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {typeOptions.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: filterType === type ? '#07C160' : '#F0F0F0',
                  color: filterType === type ? '#FFFFFF' : '#666666',
                }}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: filterStatus === status ? '#3B82F6' : '#F0F0F0',
                  color: filterStatus === status ? '#FFFFFF' : '#666666',
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {filteredArchives.length === 0 ? (
            <div className="text-center py-8">
              <ArchiveIcon size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">暂无档案记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredArchives.map((archive) => {
                const cfg = ARCHIVE_TYPE_CONFIG[archive.type] || ARCHIVE_TYPE_CONFIG['月度凭证汇总'];
                const Icon = cfg.icon;

                return (
                  <div key={archive.id} className="p-3 rounded-xl border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg }}>
                        <Icon size={20} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 text-sm truncate">{archive.title}</p>
                          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                            archive.status === '已归档' ? 'bg-[#E8F5E9] text-[#07C160]' :
                            archive.status === '待归档' ? 'bg-blue-50 text-blue-600' :
                            archive.status === '待销毁' ? 'bg-amber-50 text-amber-600' :
                            archive.status === '已销毁' ? 'bg-gray-100 text-gray-400' : ''
                          }`}>
                            {archive.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{archive.type} · {archive.period}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => handleDownloadArchive(archive)}
                            className="flex items-center gap-1 text-xs text-[#07C160]"
                          >
                            <Download size={12} />
                            导出
                          </button>
                          {archive.status === '已归档' && (
                            <button
                              onClick={() => updateArchiveStatus(archive.id, '待销毁')}
                              className="flex items-center gap-1 text-xs text-amber-600"
                            >
                              申请销毁
                            </button>
                          )}
                          {archive.status === '待销毁' && (
                            <button
                              onClick={() => handleDestory(archive)}
                              className="flex items-center gap-1 text-xs text-red-500"
                            >
                              <Trash2 size={12} />
                              确认销毁
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">到期提醒</p>
              <p className="text-xs text-amber-600 mt-1">
                根据《会计档案管理办法》，档案到期前30天将推送提醒。到期后档案将自动锁定（只读），需人工确认后方可销毁。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
