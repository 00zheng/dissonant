import React from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Input } from '../ui/Input';
import { ViewMode } from '../../types';

interface HeaderProps {
  currentView: ViewMode;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBack?: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  searchQuery,
  onSearchChange,
  onBack,
  title
}) => {
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
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full max-w-md"
          />
        )}
      </div>
    </header>
  );
};

