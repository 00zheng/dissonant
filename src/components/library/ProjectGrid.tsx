import React from 'react';
import { Project } from '../../types';
import { ProjectCard } from './ProjectCard';

interface ProjectGridProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, onProjectSelect }) => {
  if (projects.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-[#282828] rounded-[8px] bg-[#0E0E0E]">
        <p className="font-headline-md text-base text-[#E5E2E1] font-semibold">No Projects Found</p>
        <p className="font-body-sm text-xs text-[#E8BDB3]/50 mt-1">Try adjusting your filter search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={onProjectSelect}
        />
      ))}
    </div>
  );
};
