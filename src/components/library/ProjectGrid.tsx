import React from 'react';
import { Project } from '../../types';
import { ProjectCard } from './ProjectCard';
import { Plus } from 'lucide-react';

interface ProjectGridProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  onMoveProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  onCreateProject?: () => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  onProjectSelect,
  onEditProject,
  onMoveProject,
  onDeleteProject,
  onCreateProject,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {/* Create New Project Tile */}
      {onCreateProject && (
        <button
          onClick={onCreateProject}
          className="p-6 flex flex-col items-center justify-center gap-3 rounded-[8px] border border-dashed border-[#282828] hover:border-[#FF3B00]/60 bg-[#0E0E0E] hover:bg-[#131313] transition-all cursor-pointer group min-h-[260px]"
        >
          <div className="w-12 h-12 rounded-full bg-[#1C1B1B] border border-[#282828] flex items-center justify-center group-hover:border-[#FF3B00] transition-colors">
            <Plus className="w-6 h-6 text-[#E8BDB3]/70 group-hover:text-[#FF3B00]" />
          </div>
          <span className="text-sm font-semibold text-[#E8BDB3]/80 group-hover:text-white">
            New Project
          </span>
        </button>
      )}

      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={onProjectSelect}
          onEditProject={onEditProject}
          onMoveProject={onMoveProject}
          onDeleteProject={onDeleteProject}
        />
      ))}

      {projects.length === 0 && !onCreateProject && (
        <div className="col-span-full py-16 text-center border border-dashed border-[#282828] rounded-[8px] bg-[#0E0E0E]">
          <p className="font-headline-md text-base text-[#E5E2E1] font-semibold">No Projects Found</p>
          <p className="font-body-sm text-xs text-[#E8BDB3]/50 mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};
