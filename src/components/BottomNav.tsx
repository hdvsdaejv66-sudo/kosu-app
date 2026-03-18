import { FolderOpen, Timer, BarChart2 } from 'lucide-react';
import { Page, ActiveTimer } from '../types';

interface Props {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  activeTimer: ActiveTimer | null;
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'timer', label: 'タイマー', icon: <Timer size={22} /> },
  { page: 'projects', label: 'プロジェクト', icon: <FolderOpen size={22} /> },
  { page: 'reports', label: 'レポート', icon: <BarChart2 size={22} /> },
];

export default function BottomNav({ currentPage, onNavigate, activeTimer }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 safe-area-inset-bottom">
      <div className="flex">
        {navItems.map(({ page, label, icon }) => {
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors relative ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {icon}
              {label}
              {page === 'timer' && activeTimer && (
                <span className="absolute top-2 right-1/2 translate-x-4 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
