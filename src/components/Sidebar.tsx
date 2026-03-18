import { FolderOpen, Timer, BarChart2 } from 'lucide-react';
import { Page, ActiveTimer } from '../types';

interface Props {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  activeTimer: ActiveTimer | null;
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'timer', label: 'タイマー', icon: <Timer size={20} /> },
  { page: 'projects', label: 'プロジェクト', icon: <FolderOpen size={20} /> },
  { page: 'reports', label: 'レポート', icon: <BarChart2 size={20} /> },
];

export default function Sidebar({ currentPage, onNavigate, activeTimer }: Props) {
  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-gray-200 z-10">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Timer size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-800 text-lg">工数管理</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ page, label, icon }) => {
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {icon}
              {label}
              {page === 'timer' && activeTimer && (
                <span className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">データはブラウザに保存</p>
      </div>
    </aside>
  );
}
