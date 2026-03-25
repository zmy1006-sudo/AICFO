/**
 * 主布局组件 — 微信风格
 * 底部Tab导航（手机端375px为主）
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MessageSquare, FileText, Calendar, User } from 'lucide-react';

const TABS = [
  { path: '/chat', label: 'AI记账', icon: MessageSquare },
  { path: '/vouchers', label: '凭证', icon: FileText },
  { path: '/calendar', label: '报税', icon: Calendar },
  { path: '/profile', label: '我的', icon: User },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col max-w-[430px] mx-auto relative">
      {/* 顶部栏 — 微信风格白底灰线 */}
      <header
        className="bg-white px-4 pt-[calc(16px+env(safe-area-inset-top))] pb-3 flex items-center justify-center sticky top-0 z-50"
        style={{ borderBottom: '1px solid #EDEDED' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#07C160' }}
          >
            <span className="text-white font-bold text-xs">财</span>
          </div>
          <span className="font-semibold text-gray-900 text-base tracking-wide">AI-CFO</span>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* 底部Tab导航 — 微信风格白底绿高亮 */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
        style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #EDEDED' }}
      >
        <div className="flex">
          {TABS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <NavLink
                key={path}
                to={path}
                className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors"
                style={isActive ? { color: '#07C160' } : { color: '#888888' }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
