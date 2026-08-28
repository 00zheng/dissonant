import React from 'react';
import { Project } from '../types';
import { ProjectHeader } from '../components/project/ProjectHeader';
import { TrackList } from '../components/project/TrackList';

interface ProjectDetailViewProps {
  project: Project;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project }) => {
  return (
    <div className="pb-36 space-y-8">
      {/* Project Header */}
      <ProjectHeader project={project} />

      {/* Main Track List Container */}
      <div className="py-6 px-6 lg:px-12 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-[#282828] pb-3">
          <h2 className="text-lg font-semibold text-[#E5E2E1]">Tracks</h2>
          <span className="text-xs text-[#E8BDB3]/50">
            {project.tracks.length} tracks
          </span>
        </div>

        <div className="bg-[#131313] border border-[#282828] rounded-[8px] overflow-hidden">
          <TrackList tracks={project.tracks} project={project} />
        </div>
      </div>
    </div>
  );
};

