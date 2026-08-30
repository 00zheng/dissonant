import React, { useState, useRef } from 'react';
import { Project } from '../../types';
import { Button } from '../ui/Button';
import {
  Play,
  Pause,
  Shuffle,
  Plus,
  MoreHorizontal,
  Edit2,
  FolderInput,
  Trash2,
  Image as ImageIcon,
  Loader2,
  ImageOff
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { NEUTRAL_COVER_FALLBACK } from '../../data/mockData';
import { DropdownPortal } from '../ui/DropdownPortal';

interface ProjectHeaderProps {
  project: Project;
  onEditProject?: (project: Project) => void;
  onMoveProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  onUploadTracks?: () => void;
  onChangeCover?: (project: Project, file: File) => Promise<void>;
  onRemoveCover?: (project: Project) => Promise<void>;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onEditProject,
  onMoveProject,
  onDeleteProject,
  onUploadTracks,
  onChangeCover,
  onRemoveCover,
}) => {
  const { currentProject, isPlaying, playTrack, togglePlay } = usePlayer();
  const isPlayingThisProject = currentProject?.id === project.id && isPlaying;
  const [showMenu, setShowMenu] = useState(false);
  const [menuTriggerRect, setMenuTriggerRect] = useState<DOMRect | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const hasCustomCover = Boolean(
    project.coverUrl &&
    project.coverUrl !== NEUTRAL_COVER_FALLBACK &&
    !project.coverUrl.startsWith('data:image/svg+xml')
  );

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

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onChangeCover) {
      const file = e.target.files[0];
      setCoverError(null);

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const fileExt = (file.name.split('.').pop() || '').toLowerCase();
      const isValidType = validTypes.includes(file.type) || ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt);

      if (!isValidType) {
        setCoverError('Please select a valid image file (JPEG, PNG, or WebP).');
        if (coverInputRef.current) coverInputRef.current.value = '';
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setCoverError('Cover image exceeds maximum file size (10 MB).');
        if (coverInputRef.current) coverInputRef.current.value = '';
        return;
      }

      try {
        setIsUploadingCover(true);
        await onChangeCover(project, file);
      } catch (err: any) {
        console.error('Failed to change cover:', err);
        setCoverError(err?.message || 'Failed to upload cover image. Please try again.');
      } finally {
        setIsUploadingCover(false);
        if (coverInputRef.current) coverInputRef.current.value = '';
      }
    }
  };

  const handleTriggerCoverUpload = () => {
    if (isUploadingCover) return;
    setCoverError(null);
    coverInputRef.current?.click();
  };

  const handleRemoveCoverClick = async () => {
    if (!onRemoveCover || isUploadingCover) return;
    try {
      setIsUploadingCover(true);
      setShowMenu(false);
      setCoverError(null);
      await onRemoveCover(project);
    } catch (err: any) {
      console.error('Failed to remove cover:', err);
      setCoverError(err?.message || 'Failed to remove cover. Please try again.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  return (
    <div className="bg-[#131313] border-b border-[#282828] p-5 sm:p-6 lg:p-10">
      {/* Hidden File Input for Cover Art */}
      <input
        type="file"
        ref={coverInputRef}
        onChange={handleCoverFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {coverError && (
        <div className="max-w-7xl mx-auto mb-4 bg-red-950/60 border border-red-800/80 rounded-[6px] p-3 text-xs text-red-200 flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <span>{coverError}</span>
          <button
            onClick={() => setCoverError(null)}
            className="text-red-400 hover:text-white text-sm cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-center sm:items-end max-w-7xl mx-auto text-center sm:text-left">
        {/* Cover Art Container with Change Cover Overlay */}
        <div
          onClick={onChangeCover ? handleTriggerCoverUpload : undefined}
          className={`w-36 h-36 sm:w-48 sm:h-48 lg:w-52 lg:h-52 rounded-[8px] bg-[#1C1B1B] border border-[#282828] overflow-hidden shrink-0 relative shadow-xl group ${
            onChangeCover ? 'cursor-pointer' : ''
          }`}
          title={onChangeCover ? 'Click to change cover artwork' : undefined}
        >
          <img
            src={project.coverUrl || NEUTRAL_COVER_FALLBACK}
            alt={project.title}
            className="w-full h-full object-cover"
          />

          {/* Hover Overlay */}
          {onChangeCover && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-3 text-center text-white">
              {isUploadingCover ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF3B00]" />
                  <span className="text-[11px] font-medium">Uploading...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-6 h-6 text-[#FF3B00]" />
                  <span className="text-xs font-semibold">Change Cover</span>
                  <span className="text-[10px] text-[#E8BDB3]/60">JPEG, PNG, WebP</span>
                </>
              )}
            </div>
          )}

          {isUploadingCover && (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF3B00]" />
            </div>
          )}
        </div>

        {/* Info Block */}
        <div className="flex-1 space-y-2 sm:space-y-3 min-w-0 w-full">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#E5E2E1] tracking-tight truncate">
              {project.title}
            </h1>
            {project.artist && (
              <p className="text-sm sm:text-base lg:text-lg text-[#E8BDB3]/80 font-medium truncate">
                {project.artist}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs text-[#E8BDB3]/60 font-mono">
            <span>{project.tracksCount} {project.tracksCount === 1 ? 'track' : 'tracks'}</span>
            <span>•</span>
            <span>{project.totalDuration}</span>
            {project.releaseDate && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{project.releaseDate}</span>
              </>
            )}
          </div>

          {/* Tags (Desktop) */}
          {project.tags && project.tags.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-2 pt-1">
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

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 pt-2 sm:pt-3 relative">
            <Button
              variant="accent"
              size="md"
              onClick={handleMainPlay}
              disabled={!hasPlayableAudio && !isPlayingThisProject}
              className={`gap-2 min-h-[40px] px-4 ${!hasPlayableAudio && !isPlayingThisProject ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              className={`gap-2 min-h-[40px] px-4 ${!hasPlayableAudio ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={hasPlayableAudio ? 'Shuffle Play' : 'No audio files uploaded'}
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </Button>

            {onUploadTracks && (
              <Button variant="secondary" size="md" onClick={onUploadTracks} className="gap-2 min-h-[40px] px-4">
                <Plus className="w-4 h-4" />
                <span>Add Songs</span>
              </Button>
            )}

            {(onEditProject || onMoveProject || onDeleteProject || onChangeCover) && (
              <div className="sm:ml-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (showMenu) {
                      setShowMenu(false);
                      setMenuTriggerRect(null);
                    } else {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMenuTriggerRect(rect);
                      setShowMenu(true);
                    }
                  }}
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-[#E8BDB3]/60 hover:text-white rounded-[4px] border border-[#282828] hover:bg-[#1C1B1B] transition-colors cursor-pointer"
                  title="Project Options"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Options Dropdown via Portal */}
      <DropdownPortal
        isOpen={showMenu}
        onClose={() => {
          setShowMenu(false);
          setMenuTriggerRect(null);
        }}
        triggerRect={menuTriggerRect}
        className="w-48"
      >
        {onChangeCover && (
          <button
            onClick={() => {
              setShowMenu(false);
              setMenuTriggerRect(null);
              handleTriggerCoverUpload();
            }}
            className="w-full text-left px-3.5 py-2.5 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            <span>{hasCustomCover ? 'Replace Cover Art' : 'Upload Cover Art'}</span>
          </button>
        )}
        {hasCustomCover && onRemoveCover && (
          <button
            onClick={() => {
              setMenuTriggerRect(null);
              handleRemoveCoverClick();
            }}
            className="w-full text-left px-3.5 py-2.5 text-[#E8BDB3]/80 hover:bg-[#1C1B1B] hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <ImageOff className="w-4 h-4" />
            <span>Remove Cover Art</span>
          </button>
        )}
        {onEditProject && (
          <button
            onClick={() => {
              setShowMenu(false);
              setMenuTriggerRect(null);
              onEditProject(project);
            }}
            className="w-full text-left px-3.5 py-2.5 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Rename Project</span>
          </button>
        )}
        {onMoveProject && (
          <button
            onClick={() => {
              setShowMenu(false);
              setMenuTriggerRect(null);
              onMoveProject(project);
            }}
            className="w-full text-left px-3.5 py-2.5 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <FolderInput className="w-4 h-4" />
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
            className="w-full text-left px-3.5 py-2.5 text-[#FF3B00] hover:bg-[#1C1B1B] flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Project</span>
          </button>
        )}
      </DropdownPortal>
    </div>
  );
};
