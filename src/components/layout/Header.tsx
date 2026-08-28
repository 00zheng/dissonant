import React from 'react';
import { Search, ArrowLeft, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Input } from '../ui/Input';
import { ViewMode } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentView: ViewMode;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBack?: () => void;
  title?: string;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  searchQuery,
  onSearchChange,
  onBack,
  title,
  onOpenAuth,
}) => {
  const { user, logout } = useAuth();

  const getMobileViewTitle = () => {
    if (title) return title;
    if (currentView === 'folders' || currentView === 'folder_detail') return 'Folders';
    if (currentView === 'projects' || currentView === 'project_detail') return 'Projects';
    return 'Dissonant';
  };

  return (
    <header className="h-14 md:h-16 bg-[#131313] border-b border-[#282828] px-4 sm:px-6 lg:px-10 flex items-center justify-between shrink-0 z-20">
      {/* Left / Center Section */}
      <div className="flex items-center gap-3 flex-1 min-w-0 max-w-xl">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 sm:p-2 rounded-[4px] border border-[#282828] text-[#E8BDB3]/70 hover:text-white hover:bg-[#1C1B1B] transition-colors cursor-pointer shrink-0"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* Mobile View Title (Hidden on Desktop when search is shown) */}
        <div className="flex items-center gap-2 min-w-0 md:hidden">
          {!title && (
            <div className="w-2 h-2 rounded-full bg-[#FF3B00] shrink-0" />
          )}
          <h2 className="text-base font-bold text-[#E5E2E1] truncate">
            {getMobileViewTitle()}
          </h2>
        </div>

        {/* Desktop Title or Search Input */}
        {title ? (
          <h2 className="hidden md:block text-lg font-semibold text-[#E5E2E1] truncate">{title}</h2>
        ) : (
          <div className="hidden md:block w-full max-w-md">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder="Search projects, tracks, folders..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Right Action Header */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 bg-[#1C1B1B] border border-[#282828] rounded-[4px] px-2.5 sm:px-3 py-1 sm:py-1.5">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full object-cover shrink-0" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF3B00] shrink-0" />
              )}
              <span className="text-xs font-medium text-[#E5E2E1] hidden sm:inline truncate max-w-[120px]">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>
            <div className="h-3 w-px bg-[#282828]" />
            <button
              onClick={() => logout()}
              title="Log Out"
              className="text-[#E8BDB3]/60 hover:text-[#FF3B00] transition-colors text-[11px] sm:text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="bg-[#E5E2E1] hover:bg-white text-black text-[11px] sm:text-xs font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-[4px] flex items-center gap-1.5 tracking-wider uppercase transition-colors cursor-pointer"
          >
            <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
