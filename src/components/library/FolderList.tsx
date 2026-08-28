import React, { useState } from 'react';
import { Folder as FolderType } from '../../types';
import { Card } from '../ui/Card';
import { Folder, ChevronRight, MoreVertical, Edit2, Trash2, Plus } from 'lucide-react';

interface FolderListProps {
  folders: FolderType[];
  onFolderSelect: (folder: FolderType) => void;
  onEditFolder?: (folder: FolderType) => void;
  onDeleteFolder?: (folder: FolderType) => void;
  onCreateFolder?: () => void;
}

export const FolderList: React.FC<FolderListProps> = ({
  folders,
  onFolderSelect,
  onEditFolder,
  onDeleteFolder,
  onCreateFolder,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Create New Folder Card */}
      {onCreateFolder && (
        <button
          onClick={onCreateFolder}
          className="p-5 flex flex-col items-center justify-center gap-3 rounded-[8px] border border-dashed border-[#282828] hover:border-[#FF3B00]/60 bg-[#0E0E0E] hover:bg-[#131313] transition-all cursor-pointer group min-h-[160px]"
        >
          <div className="w-10 h-10 rounded-full bg-[#1C1B1B] border border-[#282828] flex items-center justify-center group-hover:border-[#FF3B00] transition-colors">
            <Plus className="w-5 h-5 text-[#E8BDB3]/70 group-hover:text-[#FF3B00]" />
          </div>
          <span className="text-xs font-semibold text-[#E8BDB3]/80 group-hover:text-white">
            New Folder
          </span>
        </button>
      )}

      {folders.map((folder) => (
        <Card
          key={folder.id}
          variant="low"
          hoverEffect
          onClick={() => onFolderSelect(folder)}
          className="p-5 flex flex-col justify-between group border-[#282828] hover:border-[#2A2A2A] transition-colors relative"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-[6px] bg-[#131313] border border-[#282828] flex items-center justify-center">
                <Folder className="w-5 h-5 text-[#E5E2E1]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#E8BDB3]/60 font-medium">
                  {folder.itemCount} projects
                </span>

                {(onEditFolder || onDeleteFolder) && (
                  <div className="relative">
                    <button
                      onClick={(e) => toggleMenu(e, folder.id)}
                      className="p-1 text-[#E8BDB3]/40 hover:text-white rounded-[4px] hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                      title="Folder Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === folder.id && (
                      <div
                        className="absolute right-0 top-7 z-20 w-36 bg-[#2A2A2A] border border-[#282828] rounded-[6px] shadow-xl py-1 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {onEditFolder && (
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditFolder(folder);
                            }}
                            className="w-full text-left px-3 py-2 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Rename</span>
                          </button>
                        )}
                        {onDeleteFolder && (
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onDeleteFolder(folder);
                            }}
                            className="w-full text-left px-3 py-2 text-[#FF3B00] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-base font-semibold text-[#E5E2E1] group-hover:text-white truncate">
              {folder.name}
            </h3>
            <p className="text-xs text-[#E8BDB3]/60 line-clamp-2 mt-1">
              {folder.description || 'No description'}
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
