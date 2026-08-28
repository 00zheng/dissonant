import React, { useState } from 'react';
import { Project } from '../../types';
import { Button } from '../ui/Button';
import { Play, Pause, Shuffle, Plus, MoreHorizontal, Edit2, FolderInput, Trash2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

interface ProjectHeaderProps {
  project: Project;
  onEditProject?: (project: Project) => void;
  onMoveProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  onUploadTracks?: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onEditProject,
  onMoveProject,
  onDeleteProject,
  onUploadTracks,
}) => {
  const { currentProject, isPlaying, playTrack, togglePlay } = usePlayer();
  const isPlayingThisProject = currentProject?.id === project.id && isPlaying;
  const [showMenu, setShowMenu] = useState(false);

  const playableTrack = project.tracks?.find(
    (t) => t.hasAudio !== false && Boolean(t.audioUrl) && !t.isSample
  );
  const hasPlayableAudio = Boolean(playableTrack);

  const handleMainPlay = () => {
    if (isPlayingThisProject) {
      togglePlay();
    } else if (playableTrack) {
      playTrack(playableTrack, project);
    }
  };

  const handleShuffle = () => {
    if (!hasPlayableAudio) return;
    const playableTracks = (project.tracks || []).filter(
      (t) => t.hasAudio !== false && Boolean(t.audioUrl) && !t.isSample
    );
    if (playableTracks.length === 0) return;
    const randomIndex = Math.floor(Math.random() * playableTracks.length);
    playTrack(playableTracks[randomIndex], project);
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
          {project.tags && project.tags.length > 0 && (
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
          <div className="flex flex-wrap items-center gap-3 pt-3 relative">
            <Button
              variant="accent"
              size="md"
              onClick={handleMainPlay}
              disabled={!hasPlayableAudio && !isPlayingThisProject}
              className={`gap-2 ${!hasPlayableAudio && !isPlayingThisProject ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={hasPlayableAudio ? 'Play Project' : 'No audio files uploaded in this project'}
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

            <Button
              variant="secondary"
              size="md"
              onClick={handleShuffle}
              disabled={!hasPlayableAudio}
              className={`gap-2 ${!hasPlayableAudio ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={hasPlayableAudio ? 'Shuffle Play' : 'No audio files uploaded'}
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </Button>

            {onUploadTracks && (
              <Button variant="secondary" size="md" onClick={onUploadTracks} className="gap-2">
                <Plus className="w-4 h-4" />
                <span>Add Songs</span>
              </Button>
            )}

            {(onEditProject || onMoveProject || onDeleteProject) && (
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-[#E8BDB3]/60 hover:text-white rounded-[4px] border border-[#282828] hover:bg-[#1C1B1B] transition-colors cursor-pointer"
                  title="Project Options"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showMenu && (
                  <div
                    className="absolute right-0 top-11 z-30 w-44 bg-[#2A2A2A] border border-[#282828] rounded-[6px] shadow-xl py-1 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onEditProject && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onEditProject(project);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2.5 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Rename Project</span>
                      </button>
                    )}
                    {onMoveProject && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onMoveProject(project);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2.5 cursor-pointer"
                      >
                        <FolderInput className="w-4 h-4" />
                        <span>Move to Folder</span>
                      </button>
                    )}
                    {onDeleteProject && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDeleteProject(project);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-[#FF3B00] hover:bg-[#1C1B1B] flex items-center gap-2.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Project</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
