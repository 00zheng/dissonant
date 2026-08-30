import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Project } from '../../types';
import { Card } from '../ui/Card';
import { Play, MoreVertical, Edit2, FolderInput, Trash2 } from 'lucide-react';

import { usePlayer } from '../../context/PlayerContext';
import { NEUTRAL_COVER_FALLBACK } from '../../data/mockData';
import { DropdownPortal } from '../ui/DropdownPortal';

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
  const [menuTriggerRect, setMenuTriggerRect] = useState<DOMRect | null>(null);

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

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (showMenu) {
      setShowMenu(false);
      setMenuTriggerRect(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuTriggerRect(rect);
      setShowMenu(true);
    }
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
          src={project.coverUrl || NEUTRAL_COVER_FALLBACK}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />

        {/* Hover Overlay with Play Button if real audio exists */}
        {hasPlayableAudio && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handlePlayHero}
              className="w-12 h-12 rounded-full bg-[#FF3B00] text-white flex items-center justify-center shadow-lg hover:scale-103 transition-transform cursor-pointer"
              title="Play Project"
            >
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </motion.button>
          </div>
        )}

        {/* Active Playing indicator */}
        {isCurrentPlayingProject && (
          <div className="absolute bottom-3 right-3 bg-[#FF3B00] w-3 h-3 rounded-full shadow-md" />
        )}

        {/* Project Context Menu Trigger */}
        {(onEditProject || onMoveProject || onDeleteProject) && (
          <div className="absolute top-3 right-3 z-10">
            <motion.button
              whileTap={{ scale: 0.90 }}
              onClick={handleMenuClick}
              className="p-1.5 rounded-[4px] bg-[#0E0E0E]/80 backdrop-blur-xs border border-[#282828] text-[#E5E2E1] hover:bg-[#2A2A2A] transition-colors cursor-pointer"
              title="Project Options"
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Options Dropdown via Portal */}
      <DropdownPortal
        isOpen={showMenu}
        onClose={() => {
          setShowMenu(false);
          setMenuTriggerRect(null);
        }}
        triggerRect={menuTriggerRect}
        className="w-40"
      >
        {onEditProject && (
          <button
            onClick={() => {
              setShowMenu(false);
              setMenuTriggerRect(null);
              onEditProject(project);
            }}
            className="w-full text-left px-3 py-2 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Rename</span>
          </button>
        )}
        {onMoveProject && (
          <button
            onClick={() => {
              setShowMenu(false);
              setMenuTriggerRect(null);
              onMoveProject(project);
            }}
            className="w-full text-left px-3 py-2 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FolderInput className="w-3.5 h-3.5" />
            <span>Move to Folder</span>
          </button>
        )}
        {onDeleteProject && (
          <button
            onClick={() => {
              setShowMenu(false);
              setMenuTriggerRect(null);
              onDeleteProject(project);
            }}
            className="w-full text-left px-3 py-2 text-[#FF3B00] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        )}
      </DropdownPortal>

      {/* Info Block */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-xs sm:text-base text-[#E5E2E1] group-hover:text-white truncate">
            {project.title}
          </h3>
          {project.artist && (
            <p className="text-[11px] sm:text-xs text-[#E8BDB3]/60 truncate mt-0.5">
              {project.artist}
            </p>
          )}
        </div>

        <div className="pt-1.5 sm:pt-2 flex items-center justify-between text-[10px] sm:text-xs text-[#E8BDB3]/50 border-t border-[#282828] font-mono">
          <span>{project.tracksCount} {project.tracksCount === 1 ? 'track' : 'tracks'}</span>
          <span className="hidden sm:inline">{project.totalDuration}</span>
        </div>
      </div>
    </Card>
  );
};
