import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Track, Project } from '../../types';
import { Play, Pause, MoreHorizontal, Download, GripVertical, Edit2, Trash2, ListMusic } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { clsx } from 'clsx';
import { DropdownPortal } from '../ui/DropdownPortal';


interface TrackListProps {
  tracks: Track[];
  project?: Project;
  onEditTrack?: (track: Track) => void;
  onDeleteTrack?: (track: Track) => void;
  onReorderTracks?: (reorderedTracks: Track[]) => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  project,
  onEditTrack,
  onDeleteTrack,
  onReorderTracks,
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue } = usePlayer();
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);
  const [menuTriggerRect, setMenuTriggerRect] = useState<DOMRect | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>, trackId: string) => {
    e.stopPropagation();
    if (activeMenuTrackId === trackId) {
      setActiveMenuTrackId(null);
      setMenuTriggerRect(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuTriggerRect(rect);
      setActiveMenuTrackId(trackId);
    }
  };

  const closeMenu = () => {
    setActiveMenuTrackId(null);
    setMenuTriggerRect(null);
  };

  const activeTrack = tracks.find((t) => t.id === activeMenuTrackId) || null;
  const activeTrackHasRealAudio =
    activeTrack && activeTrack.hasAudio !== false && Boolean(activeTrack.audioUrl) && !activeTrack.isSample;

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newTracks = [...tracks];
    const [movedTrack] = newTracks.splice(draggedIndex, 1);
    newTracks.splice(dropIndex, 0, movedTrack);

    setDraggedIndex(null);
    setDragOverIndex(null);

    if (onReorderTracks) {
      onReorderTracks(newTracks);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-full select-none">
      {/* Mobile Stacked Tracklist (< md) */}
      <div className="md:hidden divide-y divide-[#282828]/60">
        {tracks.map((track, index) => {
          const hasRealAudio = track.hasAudio !== false && Boolean(track.audioUrl) && !track.isSample;
          const isSelected = currentTrack?.id === track.id;
          const isTrackPlaying = isSelected && isPlaying;
          const orderNumber = String(index + 1).padStart(2, '0');

          const secondaryMeta = [
            track.artist,
            track.bpm ? `${track.bpm} BPM` : '',
            track.key,
          ]
            .filter(Boolean)
            .join(' • ');

          return (
            <div
              key={track.id}
              onClick={() => {
                if (hasRealAudio) {
                  playTrack(track, project);
                }
              }}
              className={clsx(
                'px-3.5 py-3 flex items-center justify-between gap-3 transition-colors text-left relative',
                hasRealAudio ? 'active:bg-[#1C1B1B] cursor-pointer' : 'opacity-85 active:bg-[#161616]',
                isSelected ? 'bg-[#1C1B1B]' : 'hover:bg-[#161616]'
              )}
            >
              {/* Left: Index / Play Icon & Track Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Index / Play Button */}
                <div className="w-6 shrink-0 flex items-center justify-center">
                  {hasRealAudio && isTrackPlaying ? (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="text-[#FF3B00] cursor-pointer p-1"
                    >
                      <Pause className="w-4 h-4 fill-[#FF3B00]" />
                    </motion.button>
                  ) : (
                    <span className="font-mono text-xs text-[#E8BDB3]/50">
                      {orderNumber}
                    </span>
                  )}
                </div>

                {/* Title & Metadata */}
                <div className="min-w-0 flex-1 ml-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p
                      className={clsx(
                        'text-sm font-semibold truncate',
                        isSelected ? 'text-[#FF3B00]' : 'text-[#E5E2E1]'
                      )}
                    >
                      {track.title}
                    </p>
                    {track.versionTag && (
                      <span className="font-mono text-[10px] uppercase font-medium px-1.5 py-0.5 bg-[#0E0E0E] border border-[#282828] text-[#E8BDB3]/70 rounded-[3px]">
                        {track.versionTag}
                      </span>
                    )}
                  </div>
                  {secondaryMeta && (
                    <p className="text-[11px] text-[#E8BDB3]/50 truncate mt-0.5">
                      {secondaryMeta}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Duration & Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-xs text-[#E8BDB3]/60">
                  {track.durationFormatted}
                </span>

                {(onEditTrack || onDeleteTrack || hasRealAudio) && (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => toggleMenu(e, track.id)}
                    className="p-1.5 text-[#E8BDB3]/60 hover:text-white rounded-[4px] hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                    title="Track Options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          );
        })}

        {tracks.length === 0 && (
          <div className="py-12 text-center text-xs text-[#E8BDB3]/50 px-4">
            No tracks in this project yet. Tap "Add Songs" above to upload audio files.
          </div>
        )}
      </div>

      {/* Desktop Table Tracklist (>= md) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#282828] text-[#E8BDB3]/50 text-xs font-medium">
              <th className="py-3 px-2 w-8"></th>
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4 text-right">Duration</th>
              <th className="py-3 px-4 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#282828]/50">
            {tracks.map((track, index) => {
              const hasRealAudio = track.hasAudio !== false && Boolean(track.audioUrl) && !track.isSample;
              const isSelected = currentTrack?.id === track.id;
              const isTrackPlaying = isSelected && isPlaying;
              const isBeingDragged = draggedIndex === index;
              const isTargetDrop = dragOverIndex === index;

              const secondaryMeta = [
                track.artist,
                track.bpm ? `${track.bpm} BPM` : '',
                track.key,
              ]
                .filter(Boolean)
                .join(' • ');

              return (
                <tr
                  key={track.id}
                  draggable={Boolean(onReorderTracks)}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    if (hasRealAudio) {
                      playTrack(track, project);
                    }
                  }}
                  className={clsx(
                    'group transition-colors text-sm relative',
                    hasRealAudio ? 'hover:bg-[#1C1B1B] cursor-pointer' : 'cursor-default opacity-85 hover:bg-[#161616]',
                    isSelected && 'bg-[#1C1B1B]',
                    isBeingDragged && 'opacity-40 bg-[#2A2A2A]',
                    isTargetDrop && 'border-t-2 border-t-[#FF3B00]'
                  )}
                >
                  {/* Drag Handle */}
                  <td className="py-3 px-2 text-center text-[#E8BDB3]/30 group-hover:text-[#E5E2E1] cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>

                  {/* Index / Play Button Cell */}
                  <td className="py-3 px-3 text-center text-xs text-[#E8BDB3]/50 group-hover:text-white">
                    <div className="relative flex items-center justify-center h-6 w-6 mx-auto">
                      {hasRealAudio ? (
                        isTrackPlaying ? (
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlay();
                            }}
                            className="text-[#FF3B00] hover:scale-105 transition-transform cursor-pointer"
                          >
                            <Pause className="w-4 h-4 fill-[#FF3B00]" />
                          </motion.button>
                        ) : (
                          <>
                            <span className="group-hover:hidden font-mono text-xs">{index + 1}</span>
                            <motion.button
                              whileTap={{ scale: 0.92 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                playTrack(track, project);
                              }}
                              className="hidden group-hover:block text-[#E5E2E1] hover:text-[#FF3B00] transition-colors cursor-pointer"
                              title="Play Track"
                            >
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </motion.button>
                          </>
                        )
                      ) : (
                        <span className="font-mono text-xs text-[#E8BDB3]/40">{index + 1}</span>
                      )}
                    </div>
                  </td>

                  {/* Title & Optional Secondary Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={clsx('font-medium text-[#E5E2E1]', hasRealAudio && 'group-hover:text-white', isSelected && 'text-[#FF3B00]')}>
                            {track.title}
                          </p>
                          {track.versionTag && (
                            <span className="font-mono text-[10px] uppercase font-medium px-1.5 py-0.5 bg-[#0E0E0E] border border-[#282828] text-[#E8BDB3]/70 rounded-[3px]">
                              {track.versionTag}
                            </span>
                          )}
                        </div>
                        {secondaryMeta && (
                          <p className="text-xs text-[#E8BDB3]/50 truncate mt-0.5">
                            {secondaryMeta}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-4 text-right text-xs text-[#E8BDB3]/60 font-mono">
                    {track.durationFormatted}
                  </td>

                  {/* Row Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {hasRealAudio && (
                        <motion.a
                          whileTap={{ scale: 0.92 }}
                          href={track.audioUrl}
                          download={`${track.title}.mp3`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-[#E8BDB3]/60 hover:text-white hover:bg-[#2A2A2A] rounded transition-colors cursor-pointer"
                          title="Download Track"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </motion.a>
                      )}

                      {(onEditTrack || onDeleteTrack) && (
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => toggleMenu(e, track.id)}
                          className="p-1.5 text-[#E8BDB3]/60 hover:text-white hover:bg-[#2A2A2A] rounded transition-colors cursor-pointer"
                          title="Track Options"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {tracks.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-[#E8BDB3]/50">
                  No tracks in this project yet. Click "Add Songs" above to upload MP3 or WAV files.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Global Dropdown Portal for Track Actions - Eliminates Overflow Clipping & Auto-Flips */}
      <DropdownPortal
        isOpen={Boolean(activeMenuTrackId && activeTrack)}
        onClose={closeMenu}
        triggerRect={menuTriggerRect}
        className="w-36"
      >
        {activeTrack && (
          <>
            {activeTrackHasRealAudio && (
              <>
                <button
                  onClick={() => {
                    addToQueue(activeTrack);
                    closeMenu();
                  }}
                  className="w-full text-left px-3 py-2 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>Add to queue</span>
                </button>
                <a
                  href={activeTrack.audioUrl}
                  download={`${activeTrack.title}.mp3`}
                  className="w-full text-left px-3 py-2 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer transition-colors"
                  onClick={closeMenu}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </>
            )}
            {onEditTrack && (
              <button
                onClick={() => {
                  const trackToEdit = activeTrack;
                  closeMenu();
                  onEditTrack(trackToEdit);
                }}
                className="w-full text-left px-3 py-2 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Rename</span>
              </button>
            )}
            {onDeleteTrack && (
              <button
                onClick={() => {
                  const trackToDelete = activeTrack;
                  closeMenu();
                  onDeleteTrack(trackToDelete);
                }}
                className="w-full text-left px-3 py-2 text-[#FF3B00] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </>
        )}
      </DropdownPortal>
    </div>
  );
};
