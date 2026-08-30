import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Folder as FolderType } from '../../types';
import { Card } from '../ui/Card';
import { Folder, ChevronRight, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { DropdownPortal } from '../ui/DropdownPortal';


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
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuTriggerRect, setMenuTriggerRect] = useState<DOMRect | null>(null);

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
      setMenuTriggerRect(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuTriggerRect(rect);
      setActiveMenuId(id);
    }
  };

  const closeMenu = () => {
    setActiveMenuId(null);
    setMenuTriggerRect(null);
  };

  const activeFolder = folders.find((f) => f.id === activeMenuId) || null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {folders.map((folder) => (
        <Card
          key={folder.id}
          variant="low"
          hoverEffect
          onClick={() => onFolderSelect(folder)}
          className="p-3.5 sm:p-5 flex flex-col justify-between group border-[#282828] hover:border-[#353534] transition-colors relative rounded-[8px]"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[6px] bg-[#131313] border border-[#282828] flex items-center justify-center shrink-0">
                <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-[#E5E2E1]" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="hidden sm:inline text-[11px] sm:text-xs text-[#E8BDB3]/60 font-mono">
                  {folder.itemCount} {folder.itemCount === 1 ? 'project' : 'projects'}
                </span>

                {(onEditFolder || onDeleteFolder) && (
                  <motion.button
                    whileTap={{ scale: 0.90 }}
                    onClick={(e) => toggleMenu(e, folder.id)}
                    className="p-1 text-[#E8BDB3]/40 hover:text-white rounded-[4px] hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                    title="Folder Options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-[#E5E2E1] group-hover:text-white truncate">
              {folder.name}
            </h3>
            {folder.description && (
              <p className="text-xs text-[#E8BDB3]/60 line-clamp-1 sm:line-clamp-2 mt-0.5 sm:mt-1">
                {folder.description}
              </p>
            )}
          </div>

          <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 flex items-center justify-between text-[11px] sm:text-xs text-[#E8BDB3]/50 border-t border-[#282828]/50 font-mono">
            <span>{folder.updatedAt}</span>
            <div className="flex items-center gap-2">
              <span className="sm:hidden">
                {folder.itemCount} {folder.itemCount === 1 ? 'project' : 'projects'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8BDB3]/40 group-hover:text-white transition-colors" />
            </div>
          </div>
        </Card>
      ))}

      {/* Options Dropdown via Portal */}
      <DropdownPortal
        isOpen={Boolean(activeMenuId && activeFolder)}
        onClose={closeMenu}
        triggerRect={menuTriggerRect}
        className="w-36"
      >
        {activeFolder && (
          <>
            {onEditFolder && (
              <button
                onClick={() => {
                  const target = activeFolder;
                  closeMenu();
                  onEditFolder(target);
                }}
                className="w-full text-left px-3 py-2 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Rename</span>
              </button>
            )}
            {onDeleteFolder && (
              <button
                onClick={() => {
                  const target = activeFolder;
                  closeMenu();
                  onDeleteFolder(target);
                }}
                className="w-full text-left px-3 py-2 text-[#FF3B00] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </>
        )}
      </DropdownPortal>

      {folders.length === 0 && (
        <div className="col-span-full py-12 sm:py-16 text-center border border-dashed border-[#282828] rounded-[8px] bg-[#0E0E0E]">
          <p className="text-base text-[#E5E2E1] font-semibold">No Folders Found</p>
          <p className="text-xs text-[#E8BDB3]/50 mt-1">
            Create a folder to start organizing your music projects.
          </p>
        </div>
      )}
    </div>
  );
};
