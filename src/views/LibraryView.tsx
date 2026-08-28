import React from 'react';
import { Folder, Project } from '../types';
import { ProjectGrid } from '../components/library/ProjectGrid';
import { FolderList } from '../components/library/FolderList';
import { Button } from '../components/ui/Button';
import { Folder as FolderIcon, Plus, ArrowLeft, Edit2, Trash2 } from 'lucide-react';

interface LibraryViewProps {
  folders: Folder[];
  projects: Project[];
  searchQuery: string;
  selectedFolder: Folder | null;
  onProjectSelect: (project: Project) => void;
  onFolderSelect: (folder: Folder | null) => void;
  activeFilterTab: string;
  onFilterChange: (filter: string) => void;
  onCreateFolder: () => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onCreateProject: (defaultFolderId?: string) => void;
  onEditProject: (project: Project) => void;
  onMoveProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  folders,
  projects,
  searchQuery,
  selectedFolder,
  onProjectSelect,
  onFolderSelect,
  activeFilterTab,
  onFilterChange,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onCreateProject,
  onEditProject,
  onMoveProject,
  onDeleteProject,
}) => {
  // Filter projects by selected folder & search query & active filter tab
  const filteredProjects = projects.filter((project) => {
    // 1. Folder match
    if (selectedFolder && project.folderId !== selectedFolder.id) {
      return false;
    }
    // 2. Filter Tab match (Albums, EP, Single, Stems, Demo)
    if (activeFilterTab !== 'All' && activeFilterTab !== 'Library') {
      if (activeFilterTab === 'Folders') {
        // Shown when folders section is visible
      } else if (activeFilterTab === 'Projects') {
        // Show all projects
      } else if (project.category.toLowerCase() !== activeFilterTab.toLowerCase()) {
        return false;
      }
    }
    // 3. Search query match
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        project.title.toLowerCase().includes(q) ||
        project.artist.toLowerCase().includes(q) ||
        project.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="py-10 px-8 lg:px-12 space-y-10 max-w-7xl mx-auto pb-36">
      {/* Header bar when inside a selected folder */}
      {selectedFolder ? (
        <div className="border-b border-[#282828] pb-6 space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onFolderSelect(null)}
              className="p-2 rounded-[4px] border border-[#282828] text-[#E8BDB3]/70 hover:text-white hover:bg-[#1C1B1B] transition-colors cursor-pointer"
              title="Back to All Folders"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs uppercase font-semibold tracking-wider text-[#FF3B00]">
              Folder View
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <FolderIcon className="w-8 h-8 text-[#FF3B00]" />
                <h1 className="text-3xl lg:text-4xl font-bold text-[#E5E2E1] tracking-tight">
                  {selectedFolder.name}
                </h1>
              </div>
              <p className="text-sm text-[#E8BDB3]/70">
                {selectedFolder.description || 'No description'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEditFolder(selectedFolder)}
                className="gap-2"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Rename Folder</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteFolder(selectedFolder)}
                className="gap-2 text-[#FF3B00] border-[#FF3B00]/40 hover:bg-[#FF3B00]/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Folder</span>
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => onCreateProject(selectedFolder.id)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project Here</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Main Library Header */
        <div className="border-b border-[#282828] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#E5E2E1] tracking-tight">
              Library
            </h1>
            <p className="text-xs text-[#E8BDB3]/60 mt-1">
              Manage your local projects, tracks, and workspace folders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={onCreateFolder}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Folder</span>
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => onCreateProject()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Button>
          </div>
        </div>
      )}

      {/* 1. Folders Section (hidden when inside a folder or during active search) */}
      {!selectedFolder && !searchQuery && activeFilterTab !== 'Projects' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#E5E2E1]">Folders</h2>
            <span className="text-xs text-[#E8BDB3]/50">{folders.length} folders</span>
          </div>
          <FolderList
            folders={folders}
            onFolderSelect={(f) => onFolderSelect(f)}
            onEditFolder={onEditFolder}
            onDeleteFolder={onDeleteFolder}
            onCreateFolder={onCreateFolder}
          />
        </section>
      )}

      {/* 2. Projects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#E5E2E1]">
            {selectedFolder ? 'Folder Projects' : 'Projects'}
          </h2>
          <span className="text-xs text-[#E8BDB3]/50">
            {filteredProjects.length} projects
          </span>
        </div>
        <ProjectGrid
          projects={filteredProjects}
          onProjectSelect={onProjectSelect}
          onEditProject={onEditProject}
          onMoveProject={onMoveProject}
          onDeleteProject={onDeleteProject}
          onCreateProject={() => onCreateProject(selectedFolder?.id)}
        />
      </section>
    </div>
  );
};
