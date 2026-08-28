import React, { useState } from 'react';
import { Project } from '../../types';
import { Card } from '../ui/Card';
import { Play, MoreVertical, Edit2, FolderInput, Trash2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  onMoveProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
  onEditProject,
  onMoveProject,
  onDeleteProject,
}) => {
  const { playTrack, currentProject, isPlaying } = usePlayer();
  const isCurrentPlayingProject = currentProject?.id === project.id && isPlaying;
  const [showMenu, setShowMenu] = useState(false);

  const playableTrack = project.tracks?.find(
    (t) => t.hasAudio !== false && Boolean(t.audioUrl) && !t.isSample
  );
  const hasPlayableAudio = Boolean(playableTrack);

  const handlePlayHero = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playableTrack) {
      playTrack(playableTrack, project);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <Card
      variant="low"
      hoverEffect
      onClick={() => onClick(project)}
      className="flex flex-col h-full group border-[#282828] hover:border-[#353534] transition-colors rounded-[8px] overflow-hidden bg-[#1C1B1B] relative"
    >
      {/* Artwork Container - Visually Dominant */}
      <div className="relative aspect-square w-full bg-[#131313] overflow-hidden">
        <img
          src={project.coverUrl}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />

        {/* Hover Overlay with Play Button if real audio exists */}
        {hasPlayableAudio && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
            <button
              onClick={handlePlayHero}
              className="w-12 h-12 rounded-full bg-[#FF3B00] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              title="Play Project"
            >
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </button>
          </div>
        )}

        {/* Active Playing indicator */}
        {isCurrentPlayingProject && (
          <div className="absolute bottom-3 right-3 bg-[#FF3B00] w-3 h-3 rounded-full shadow-md" />
        )}

        {/* Project Context Menu */}
        {(onEditProject || onMoveProject || onDeleteProject) && (
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={handleMenuClick}
              className="p-1.5 rounded-[4px] bg-[#0E0E0E]/80 backdrop-blur-xs border border-[#282828] text-[#E5E2E1] hover:bg-[#2A2A2A] transition-colors cursor-pointer"
              title="Project Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-8 w-40 bg-[#2A2A2A] border border-[#282828] rounded-[6px] shadow-xl py-1 text-xs z-30"
                onClick={(e) => e.stopPropagation()}
              >
                {onEditProject && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEditProject(project);
                    }}
                    className="w-full text-left px-3 py-2 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Rename</span>
                  </button>
                )}
                {onMoveProject && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onMoveProject(project);
                    }}
                    className="w-full text-left px-3 py-2 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer"
                  >
                    <FolderInput className="w-3.5 h-3.5" />
                    <span>Move to Folder</span>
                  </button>
                )}
                {onDeleteProject && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDeleteProject(project);
                    }}
                    className="w-full text-left px-3 py-2 text-[#FF3B00] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
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

        <div className="mt-3 pt-2 flex items-center justify-between text-xs text-[#E8BDB3]/50 border-t border-[#282828]">
          <span>{project.tracksCount} tracks</span>
          <span>{project.totalDuration}</span>
        </div>
      </div>
    </Card>
  );
};
