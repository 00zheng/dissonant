import React from 'react';
import { Project, Track } from '../types';
import { ProjectHeader } from '../components/project/ProjectHeader';
import { TrackList } from '../components/project/TrackList';

interface ProjectDetailViewProps {
  project: Project;
  onEditProject?: (project: Project) => void;
  onMoveProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  onUploadTracks?: () => void;
  onEditTrack?: (track: Track) => void;
  onDeleteTrack?: (track: Track) => void;
  onReorderTracks?: (reorderedTracks: Track[]) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onEditProject,
  onMoveProject,
  onDeleteProject,
  onUploadTracks,
  onEditTrack,
  onDeleteTrack,
  onReorderTracks,
}) => {
  return (
    <div className="pb-36 space-y-8">
      {/* Project Header */}
      <ProjectHeader
        project={project}
        onEditProject={onEditProject}
        onMoveProject={onMoveProject}
        onDeleteProject={onDeleteProject}
        onUploadTracks={onUploadTracks}
      />

      {/* Main Track List Container */}
      <div className="py-6 px-6 lg:px-12 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-[#282828] pb-3">
          <h2 className="text-lg font-semibold text-[#E5E2E1]">Tracks</h2>
          <span className="text-xs text-[#E8BDB3]/50">
            {project.tracks ? project.tracks.length : 0} tracks
          </span>
        </div>

        <div className="bg-[#131313] border border-[#282828] rounded-[8px] overflow-hidden">
          <TrackList
            tracks={project.tracks || []}
            project={project}
            onEditTrack={onEditTrack}
            onDeleteTrack={onDeleteTrack}
            onReorderTracks={onReorderTracks}
          />
        </div>
      </div>
    </div>
  );
};
