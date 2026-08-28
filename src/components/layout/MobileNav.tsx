import React from 'react';
import { Library, Folder, Disc, Search } from 'lucide-react';
import { ViewMode } from '../../types';
import { clsx } from 'clsx';

interface MobileNavProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'library', label: 'Library', icon: Library },
    { id: 'folders', label: 'Folders', icon: Folder },
    { id: 'projects', label: 'Projects', icon: Disc },
    { id: 'search', label: 'Search', icon: Search },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0E0E0E] border-t border-[#282828] px-4 py-2 flex items-center justify-around z-40 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as ViewMode)}
            className={clsx(
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-full transition-all cursor-pointer',
              isActive
                ? 'bg-[#1C1B1B] text-[#E5E2E1] font-semibold border border-[#282828]'
                : 'text-[#E8BDB3]/60 hover:text-white'
            )}
          >
            <Icon className={clsx('w-4 h-4', isActive && 'text-[#FF3B00]')} />
            <span className="text-[11px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

