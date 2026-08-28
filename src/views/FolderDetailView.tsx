import React from 'react';
import { Folder, Project } from '../types';
import { ProjectGrid } from '../components/library/ProjectGrid';
import { Button } from '../components/ui/Button';
import { Folder as FolderIcon, Plus, ArrowLeft, Edit2, Trash2 } from 'lucide-react';

interface FolderDetailViewProps {
  folder: Folder;
  projects: Project[];
  searchQuery?: string;
  onBack: () => void;
  onProjectSelect: (project: Project) => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onCreateProject: (folderId?: string) => void;
  onEditProject?: (project: Project) => void;
  onMoveProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
}

export const FolderDetailView: React.FC<FolderDetailViewProps> = ({
  folder,
  projects,
  searchQuery = '',
  onBack,
  onProjectSelect,
  onEditFolder,
  onDeleteFolder,
  onCreateProject,
  onEditProject,
  onMoveProject,
  onDeleteProject,
}) => {
  const folderProjects = projects.filter((project) => {
    if (project.folderId !== folder.id) return false;
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
    <div className="py-6 sm:py-10 px-5 sm:px-8 lg:px-12 space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-44">
      {/* Folder Header Bar */}
      <div className="border-b border-[#282828] pb-5 sm:pb-6 space-y-3.5 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onBack}
            className="p-1.5 sm:p-2 rounded-[4px] border border-[#282828] text-[#E8BDB3]/70 hover:text-white hover:bg-[#1C1B1B] transition-colors cursor-pointer"
            title="Back to Folders"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs uppercase font-semibold tracking-wider text-[#FF3B00]">
            Folder View
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <FolderIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF3B00] shrink-0" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#E5E2E1] tracking-tight truncate">
                {folder.name}
              </h1>
            </div>
            {folder.description && (
              <p className="text-xs sm:text-sm text-[#E8BDB3]/70">
                {folder.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEditFolder(folder)}
              className="gap-1.5 sm:gap-2 min-h-[38px] flex-1 sm:flex-initial justify-center"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Rename</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteFolder(folder)}
              className="gap-1.5 sm:gap-2 text-[#FF3B00] border-[#FF3B00]/40 hover:bg-[#FF3B00]/10 min-h-[38px] flex-1 sm:flex-initial justify-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => onCreateProject(folder.id)}
              className="gap-1.5 sm:gap-2 min-h-[38px] w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Project</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Projects in this folder */}
      <section className="space-y-3.5 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-[#E5E2E1]">Folder Projects</h2>
          <span className="text-xs text-[#E8BDB3]/50">
            {folderProjects.length} {folderProjects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        <ProjectGrid
          projects={folderProjects}
          onProjectSelect={onProjectSelect}
          onEditProject={onEditProject}
          onMoveProject={onMoveProject}
          onDeleteProject={onDeleteProject}
          onCreateProject={() => onCreateProject(folder.id)}
        />
      </section>
    </div>
  );
};
