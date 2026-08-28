import React from 'react';
import { Folder } from '../types';
import { FolderList } from '../components/library/FolderList';
import { Button } from '../components/ui/Button';
import { Plus, Folder as FolderIcon } from 'lucide-react';

interface FoldersViewProps {
  folders: Folder[];
  searchQuery?: string;
  onFolderSelect: (folder: Folder) => void;
  onCreateFolder: () => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
}

export const FoldersView: React.FC<FoldersViewProps> = ({
  folders,
  searchQuery = '',
  onFolderSelect,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
}) => {
  const filteredFolders = folders.filter((folder) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      folder.name.toLowerCase().includes(q) ||
      (folder.description && folder.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="py-10 px-8 lg:px-12 space-y-8 max-w-7xl mx-auto pb-36">
      {/* Header bar */}
      <div className="border-b border-[#282828] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <FolderIcon className="w-7 h-7 text-[#FF3B00]" />
            <h1 className="text-3xl lg:text-4xl font-bold text-[#E5E2E1] tracking-tight">
              Folders
            </h1>
          </div>
          <p className="text-xs text-[#E8BDB3]/60 mt-1">
            Organize your projects, sessions, and audio stems into dedicated workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="accent"
            size="sm"
            onClick={onCreateFolder}
            className="gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Folder</span>
          </Button>
        </div>
      </div>

      {/* Folders Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#E5E2E1]">All Folders</h2>
          <span className="text-xs text-[#E8BDB3]/50">
            {filteredFolders.length} {filteredFolders.length === 1 ? 'folder' : 'folders'}
          </span>
        </div>

        {filteredFolders.length === 0 && searchQuery ? (
          <div className="py-16 text-center border border-dashed border-[#282828] rounded-[8px] bg-[#0E0E0E]">
            <p className="text-base text-[#E5E2E1] font-semibold">No Matching Folders</p>
            <p className="text-xs text-[#E8BDB3]/50 mt-1">
              No folders match the search query "{searchQuery}".
            </p>
          </div>
        ) : (
          <FolderList
            folders={filteredFolders}
            onFolderSelect={onFolderSelect}
            onEditFolder={onEditFolder}
            onDeleteFolder={onDeleteFolder}
            onCreateFolder={onCreateFolder}
          />
        )}
      </section>
    </div>
  );
};
