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

  return (
    <header className="h-16 bg-[#131313] border-b border-[#282828] px-6 lg:px-10 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-[4px] border border-[#282828] text-[#E8BDB3]/70 hover:text-white hover:bg-[#1C1B1B] transition-colors cursor-pointer"
            title="Back to Library"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {title ? (
          <h2 className="text-lg font-semibold text-[#E5E2E1] truncate">{title}</h2>
        ) : (
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Search projects, tracks, folders..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full max-w-md"
          />
        )}
      </div>

      {/* Right Action Header */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3 bg-[#1C1B1B] border border-[#282828] rounded-[4px] px-3 py-1.5">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4 text-[#FF3B00]" />
              )}
              <span className="text-xs font-medium text-[#E5E2E1] hidden sm:inline truncate max-w-[120px]">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>
            <div className="h-3 w-px bg-[#282828]" />
            <button
              onClick={() => logout()}
              title="Log Out"
              className="text-[#E8BDB3]/60 hover:text-[#FF3B00] transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="bg-[#E5E2E1] hover:bg-white text-black text-xs font-bold py-2 px-4 rounded-[4px] flex items-center gap-2 tracking-wider uppercase transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
