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

      {projects.length === 0 && (
        <div className="col-span-full py-16 text-center border border-dashed border-[#282828] rounded-[8px] bg-[#0E0E0E]">
          <p className="font-headline-md text-base text-[#E5E2E1] font-semibold">No Projects Found</p>
          <p className="font-body-sm text-xs text-[#E8BDB3]/50 mt-1">Create a project to start organizing your songs.</p>
        </div>
      )}
    </div>
  );
};
