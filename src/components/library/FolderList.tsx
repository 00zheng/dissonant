import React from 'react';
import { Folder as FolderType } from '../../types';
import { Card } from '../ui/Card';
import { Folder, ChevronRight } from 'lucide-react';

interface FolderListProps {
  folders: FolderType[];
  onFolderSelect: (folder: FolderType) => void;
}

export const FolderList: React.FC<FolderListProps> = ({ folders, onFolderSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {folders.map((folder) => (
        <Card
          key={folder.id}
          variant="low"
          hoverEffect
          onClick={() => onFolderSelect(folder)}
          className="p-5 flex flex-col justify-between group border-[#282828] hover:border-[#2A2A2A] transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-[6px] bg-[#131313] border border-[#282828] flex items-center justify-center">
                <Folder className="w-5 h-5 text-[#E5E2E1]" />
              </div>
              <span className="text-xs text-[#E8BDB3]/60 font-medium">
                {folder.itemCount} projects
              </span>
            </div>

            <h3 className="text-base font-semibold text-[#E5E2E1] group-hover:text-white truncate">
              {folder.name}
            </h3>
            <p className="text-xs text-[#E8BDB3]/60 line-clamp-2 mt-1">
              {folder.description}
            </p>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-xs text-[#E8BDB3]/50">
            <span>{folder.updatedAt}</span>
            <ChevronRight className="w-4 h-4 text-[#E8BDB3]/40 group-hover:text-white transition-colors" />
          </div>
        </Card>
      ))}
    </div>
  );
};

