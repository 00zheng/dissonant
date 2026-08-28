import React from 'react';
import { Project } from '../../types';
import { Card } from '../ui/Card';
import { Play } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const { playTrack, currentProject, isPlaying } = usePlayer();
  const isCurrentPlayingProject = currentProject?.id === project.id && isPlaying;

  const handlePlayHero = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.tracks.length > 0) {
      playTrack(project.tracks[0], project);
    }
  };

  return (
    <Card
      variant="low"
      hoverEffect
      onClick={() => onClick(project)}
      className="flex flex-col h-full group border-[#282828] hover:border-[#353534] transition-colors rounded-[8px] overflow-hidden bg-[#1C1B1B]"
    >
      {/* Artwork Container - Visually Dominant */}
      <div className="relative aspect-square w-full bg-[#131313] overflow-hidden">
        <img
          src={project.coverUrl}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />

        {/* Hover Overlay with Play Button */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
          <button
            onClick={handlePlayHero}
            className="w-12 h-12 rounded-full bg-[#FF3B00] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title="Play Project"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        </div>

        {/* Active Playing indicator */}
        {isCurrentPlayingProject && (
          <div className="absolute bottom-3 right-3 bg-[#FF3B00] w-3 h-3 rounded-full shadow-md" />
        )}
      </div>

      {/* Info Block */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-semibold text-base text-[#E5E2E1] group-hover:text-white truncate">
            {project.title}
          </h3>
          <p className="text-xs text-[#E8BDB3]/60 truncate mt-0.5">
            {project.artist}
          </p>
        </div>

        <div className="mt-3 pt-2 flex items-center justify-between text-xs text-[#E8BDB3]/50">
          <span>{project.tracksCount} tracks</span>
          <span>{project.totalDuration}</span>
        </div>
      </div>
    </Card>
  );
};

