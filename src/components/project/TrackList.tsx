import React, { useState } from 'react';
import { Track, Project } from '../../types';
import { Play, Pause, MoreHorizontal, Download, GripVertical, Edit2, Trash2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { clsx } from 'clsx';

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
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const toggleMenu = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    setActiveMenuTrackId(activeMenuTrackId === trackId ? null : trackId);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent or custom drag image if available
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
    <div className="w-full overflow-x-auto select-none">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-[#282828] text-[#E8BDB3]/50 text-xs font-medium">
            <th className="py-3 px-2 w-8"></th>
            <th className="py-3 px-3 w-10 text-center">#</th>
            <th className="py-3 px-4">Title</th>
            <th className="py-3 px-4 text-center">BPM / Key</th>
            <th className="py-3 px-4 text-right">Duration</th>
            <th className="py-3 px-4 w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#282828]/50">
          {tracks.map((track, index) => {
            const isSelected = currentTrack?.id === track.id;
            const isTrackPlaying = isSelected && isPlaying;
            const isBeingDragged = draggedIndex === index;
            const isTargetDrop = dragOverIndex === index;

            return (
              <tr
                key={track.id}
                draggable={Boolean(onReorderTracks)}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => playTrack(track, project)}
                className={clsx(
                  'group hover:bg-[#1C1B1B] transition-colors cursor-pointer text-sm relative',
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
                    {isTrackPlaying ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                        className="text-[#FF3B00] hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Pause className="w-4 h-4 fill-[#FF3B00]" />
                      </button>
                    ) : (
                      <>
                        <span className="group-hover:hidden font-mono text-xs">{index + 1}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrack(track, project);
                          }}
                          className="hidden group-hover:block text-[#E5E2E1] hover:text-[#FF3B00] transition-colors cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>

                {/* Title & Artist */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[4px] bg-[#131313] border border-[#282828] overflow-hidden shrink-0">
                      <img src={track.coverUrl || project?.coverUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={clsx('font-medium text-[#E5E2E1] group-hover:text-white', isSelected && 'text-[#FF3B00]')}>
                          {track.title}
                        </p>
                        {track.versionTag && (
                          <span className="px-1.5 py-0.2 bg-[#0E0E0E] border border-[#282828] text-[10px] text-[#E8BDB3]/60 rounded-[3px]">
                            {track.versionTag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#E8BDB3]/50 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Key / BPM */}
                <td className="py-3 px-4 text-center text-xs text-[#E8BDB3]/70 font-mono">
                  <span>{track.bpm || 120} BPM</span>
                  <span className="text-[#E8BDB3]/40 mx-1.5">•</span>
                  <span>{track.key || 'C'}</span>
                </td>

                {/* Duration */}
                <td className="py-3 px-4 text-right text-xs text-[#E8BDB3]/60 font-mono">
                  {track.durationFormatted}
                </td>

                {/* Row Actions */}
                <td className="py-3 px-4 text-right relative">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {track.audioUrl && (
                      <a
                        href={track.audioUrl}
                        download={`${track.title}.mp3`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-[#E8BDB3]/60 hover:text-white hover:bg-[#2A2A2A] rounded transition-colors cursor-pointer"
                        title="Download Track"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {(onEditTrack || onDeleteTrack) && (
                      <div className="relative">
                        <button
                          onClick={(e) => toggleMenu(e, track.id)}
                          className="p-1.5 text-[#E8BDB3]/60 hover:text-white hover:bg-[#2A2A2A] rounded transition-colors cursor-pointer"
                          title="Track Options"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {activeMenuTrackId === track.id && (
                          <div
                            className="absolute right-0 top-8 z-30 w-36 bg-[#2A2A2A] border border-[#282828] rounded-[6px] shadow-xl py-1 text-xs text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {onEditTrack && (
                              <button
                                onClick={() => {
                                  setActiveMenuTrackId(null);
                                  onEditTrack(track);
                                }}
                                className="w-full text-left px-3 py-2 text-[#E5E2E1] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Rename</span>
                              </button>
                            )}
                            {onDeleteTrack && (
                              <button
                                onClick={() => {
                                  setActiveMenuTrackId(null);
                                  onDeleteTrack(track);
                                }}
                                className="w-full text-left px-3 py-2 text-[#FF3B00] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {tracks.length === 0 && (
            <tr>
              <td colSpan={6} className="py-12 text-center text-xs text-[#E8BDB3]/50">
                No tracks in this project yet. Click "Add Songs" above to upload MP3 or WAV files.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
