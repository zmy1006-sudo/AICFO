/**
 * 工具箱页面
 * 集中入口：报税日历、工资算薪、数据导入、档案管理
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Calculator, Upload, Archive, FileText, Receipt } from 'lucide-react';

interface ToolItem {
  id: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  path: string;
  badge?: string;
  color: string;
  bg: string;
}

const TOOLS: ToolItem[] = [
  {
    id: 'calendar',
    icon: Calendar,
    title: '报税日历',
    desc: '月度+季度申报节点提醒',
    path: '/calendar',
    badge: 'NEW',
    color: '#07C160',
    bg: '#E8F5E9',
  },
  {
    id: 'salary',
    icon: Calculator,
    title: '工资算薪',
    desc: '个税/社保/年终奖方案对比',
    path: '/salary',
    badge: 'NEW',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    id: 'import',
    icon: Upload,
    title: '数据导入',
    desc: 'Excel/用友/金蝶/银行流水',
    path: '/import',
    badge: 'NEW',
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    id: 'archive',
    icon: Archive,
    title: '档案管理',
    desc: '凭证汇总册/到期提醒',
    path: '/archive',
    badge: 'NEW',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    id: 'invoice',
    icon: Receipt,
    title: '发票OCR',
    desc: '拍照识别发票自动生成凭证',
    path: '/invoice',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
  {
    id: 'contracts',
    icon: FileText,
    title: '合同管理',
    desc: '合同台账与到期提醒',
    path: '/contracts',
    color: '#6366F1',
    bg: '#EEF2FF',
  },
];

export default function Tools() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#07C160' }}>
            <Wrench size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">工具箱</h1>
            <p className="text-xs text-gray-400">财税管理利器</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => navigate(tool.path)}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left relative overflow-hidden"
              >
                {tool.badge && (
                  <span
                    className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: tool.color, color: '#FFFFFF' }}
                  >
                    {tool.badge}
                  </span>
                )}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: tool.bg }}
                >
                  <Icon size={20} style={{ color: tool.color }} />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">{tool.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{tool.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">快捷操作</h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/chat')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#E8F5E9]">
                <Receipt size={16} className="text-[#07C160]" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-gray-800">AI智能记账</p>
                <p className="text-xs text-gray-400">说一句话，自动生成凭证</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#EFF6FF]">
                <BarChart2 size={16} className="text-[#3B82F6]" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-gray-800">财务报表</p>
                <p className="text-xs text-gray-400">实时查看经营状况</p>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-4 bg-gradient-to-r from-[#07C160] to-[#06A050] rounded-2xl p-4 text-white">
          <p className="font-semibold text-sm">💡 提示</p>
          <p className="text-xs opacity-90 mt-1">
            所有数据均在本地加密存储，不上传服务器。如需完整功能，请配置DeepSeek API Key。
          </p>
        </div>
      </div>
    </div>
  );
}

function Wrench(props: { size: number; className?: string }) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
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
