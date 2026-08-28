import React from 'react';
import { Project } from '../../types';
import { Button } from '../ui/Button';
import { Play, Pause, Shuffle, Plus, MoreHorizontal } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

interface ProjectHeaderProps {
  project: Project;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const { currentProject, isPlaying, playTrack, togglePlay } = usePlayer();
  const isPlayingThisProject = currentProject?.id === project.id && isPlaying;

  const handleMainPlay = () => {
    if (isPlayingThisProject) {
      togglePlay();
    } else if (project.tracks.length > 0) {
      playTrack(project.tracks[0], project);
    }
  };

  return (
    <div className="bg-[#131313] border-b border-[#282828] p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-end max-w-7xl mx-auto">
        {/* Cover Art */}
        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-[8px] bg-[#1C1B1B] border border-[#282828] overflow-hidden shrink-0 relative">
          <img
            src={project.coverUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info Block */}
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#E5E2E1] tracking-tight">
              {project.title}
            </h1>
            <p className="text-base sm:text-lg text-[#E8BDB3]/80 font-medium">
              {project.artist}
            </p>
          </div>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-[4px] bg-[#1C1B1B] border border-[#282828] text-xs text-[#E8BDB3]/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-[#E8BDB3]/60 pt-1">
            <span>{project.tracksCount} tracks</span>
            <span>•</span>
            <span>{project.totalDuration}</span>
            {project.releaseDate && (
              <>
                <span>•</span>
                <span>{project.releaseDate}</span>
              </>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Button
              variant="accent"
              size="md"
              onClick={handleMainPlay}
              className="gap-2"
            >
              {isPlayingThisProject ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play</span>
                </>
              )}
            </Button>

            <Button variant="secondary" size="md" className="gap-2">
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </Button>

            <Button variant="secondary" size="md" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Add Songs</span>
            </Button>

            <button className="p-2 text-[#E8BDB3]/60 hover:text-white rounded-[4px] border border-[#282828] hover:bg-[#1C1B1B] transition-colors cursor-pointer ml-auto">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

