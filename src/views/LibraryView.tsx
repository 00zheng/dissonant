import React from 'react';
import { Folder, Project } from '../types';
import { ProjectGrid } from '../components/library/ProjectGrid';
import { FolderList } from '../components/library/FolderList';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Plus, ArrowRight, Folder as FolderIcon, Disc } from 'lucide-react';

interface LibraryViewProps {
  folders: Folder[];
  projects: Project[];
  searchQuery: string;
  onProjectSelect: (project: Project) => void;
  onFolderSelect: (folder: Folder) => void;
  onViewAllFolders: () => void;
  onViewAllProjects: () => void;
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

const CATEGORIES = ['All', 'Album', 'EP', 'Single', 'Stems', 'Demo'];

export const LibraryView: React.FC<LibraryViewProps> = ({
  folders,
  projects,
  searchQuery,
  onProjectSelect,
  onFolderSelect,
  onViewAllFolders,
  onViewAllProjects,
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
  // Filter projects by search query & category tab
  const filteredProjects = projects.filter((project) => {
    if (activeFilterTab !== 'All' && activeFilterTab !== 'Library') {
      if (project.category.toLowerCase() !== activeFilterTab.toLowerCase()) {
        return false;
      }
    }
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

  const getCategoryCount = (category: string) => {
    if (category === 'All') return projects.length;
    return projects.filter((p) => p.category.toLowerCase() === category.toLowerCase()).length;
  };

  return (
    <div className="py-10 px-8 lg:px-12 space-y-10 max-w-7xl mx-auto pb-36">
      {/* Main Library Header */}
      <div className="border-b border-[#282828] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#E5E2E1] tracking-tight">
            Library
          </h1>
          <p className="text-xs text-[#E8BDB3]/60 mt-1">
            Combined overview of your cloud workspace folders, projects, and multi-track audio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCreateFolder}
            className="gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Folder</span>
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => onCreateProject()}
            className="gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* 1. Folders Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderIcon className="w-5 h-5 text-[#FF3B00]" />
            <h2 className="text-xl font-semibold text-[#E5E2E1]">Folders</h2>
            <span className="text-xs text-[#E8BDB3]/50 ml-1">({folders.length})</span>
          </div>
          <button
            onClick={onViewAllFolders}
            className="text-xs text-[#E8BDB3]/70 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View all folders</span>
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
      <section className="space-y-4 pt-4 border-t border-[#282828]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-[#FF3B00]" />
            <h2 className="text-xl font-semibold text-[#E5E2E1]">Projects</h2>
            <span className="text-xs text-[#E8BDB3]/50 ml-1">({projects.length})</span>
          </div>
          <button
            onClick={onViewAllProjects}
            className="text-xs text-[#E8BDB3]/70 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View all projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              count={getCategoryCount(cat)}
              active={activeFilterTab === cat || (cat === 'All' && activeFilterTab === 'Library')}
              onClick={() => onFilterChange(cat)}
            />
          ))}
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
