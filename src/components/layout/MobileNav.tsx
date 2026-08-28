import React from 'react';
import { Library, Folder, Disc } from 'lucide-react';
import { ViewMode } from '../../types';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenAuth?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'library' as const, label: 'Library', icon: Library },
    { id: 'folders' as const, label: 'Folders', icon: Folder },
    { id: 'projects' as const, label: 'Projects', icon: Disc },
  ];

  const isItemActive = (itemId: 'library' | 'folders' | 'projects') => {
    if (itemId === 'library') {
      return currentView === 'library';
    }
    if (itemId === 'folders') {
      return currentView === 'folders' || currentView === 'folder_detail';
    }
    if (itemId === 'projects') {
      return currentView === 'projects' || currentView === 'project_detail';
    }
    return false;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0E0E0E] border-t border-[#282828] px-4 py-2 flex items-center justify-around z-40 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isItemActive(item.id);
        return (
          <button
            key={item.id}
            onClick={() => {
              if (!user && onOpenAuth) {
                onOpenAuth();
                return;
              }
              onNavigate(item.id);
            }}
            className={clsx(
              'flex flex-col items-center gap-1 px-4 py-1.5 rounded-full transition-all cursor-pointer',
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
