import React from 'react';
import { Folder, Project } from '../types';
import { ProjectGrid } from '../components/library/ProjectGrid';
import { FolderList } from '../components/library/FolderList';
import { Button } from '../components/ui/Button';
import { Plus, ArrowRight, Folder as FolderIcon, Disc } from 'lucide-react';

interface LibraryViewProps {
  folders: Folder[];
  projects: Project[];
  searchQuery: string;
  onProjectSelect: (project: Project) => void;
  onFolderSelect: (folder: Folder) => void;
  onViewAllFolders: () => void;
  onViewAllProjects: () => void;
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
  onProjectSelect,
  onFolderSelect,
  onViewAllFolders,
  onViewAllProjects,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onCreateProject,
  onEditProject,
  onMoveProject,
  onDeleteProject,
}) => {
  // Filter projects by search query
  const filteredProjects = projects.filter((project) => {
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

  const filteredFolders = folders.filter((folder) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      folder.name.toLowerCase().includes(q) ||
      (folder.description && folder.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="py-6 sm:py-10 px-5 sm:px-8 lg:px-12 space-y-8 sm:space-y-10 max-w-7xl mx-auto pb-44">
      {/* Main Library Header */}
      <div className="border-b border-[#282828] pb-5 sm:pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#E5E2E1] tracking-tight">
            Library
          </h1>
          <p className="text-xs text-[#E8BDB3]/60 mt-1">
            Combined overview of your music folders and projects.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCreateFolder}
            className="gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-center min-h-[38px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Folder</span>
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => onCreateProject()}
            className="gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-center min-h-[38px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* 1. Folders Section */}
      <section className="space-y-3.5 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF3B00]" />
            <h2 className="text-lg sm:text-xl font-semibold text-[#E5E2E1]">Folders</h2>
            <span className="text-xs text-[#E8BDB3]/50">({folders.length})</span>
          </div>
          <button
            onClick={onViewAllFolders}
            className="text-xs text-[#E8BDB3]/70 hover:text-white flex items-center gap-1 transition-colors cursor-pointer py-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <FolderList
          folders={filteredFolders.slice(0, 4)}
          onFolderSelect={onFolderSelect}
          onEditFolder={onEditFolder}
          onDeleteFolder={onDeleteFolder}
          onCreateFolder={onCreateFolder}
        />
      </section>

      {/* 2. Projects Section */}
      <section className="space-y-3.5 sm:space-y-4 pt-4 border-t border-[#282828]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF3B00]" />
            <h2 className="text-lg sm:text-xl font-semibold text-[#E5E2E1]">Projects</h2>
            <span className="text-xs text-[#E8BDB3]/50">({projects.length})</span>
          </div>
          <button
            onClick={onViewAllProjects}
            className="text-xs text-[#E8BDB3]/70 hover:text-white flex items-center gap-1 transition-colors cursor-pointer py-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <ProjectGrid
          projects={filteredProjects}
          onProjectSelect={onProjectSelect}
          onEditProject={onEditProject}
          onMoveProject={onMoveProject}
          onDeleteProject={onDeleteProject}
          onCreateProject={() => onCreateProject()}
        />
      </section>
    </div>
  );
};
