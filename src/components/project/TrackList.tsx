import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Track, Project } from '../../types';
import { Play, Pause, MoreHorizontal, Download, GripVertical, Edit2, Trash2, ListMusic } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { clsx } from 'clsx';
import { DropdownPortal } from '../ui/DropdownPortal';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableMobileRowProps {
  track: Track;
  index: number;
  project?: Project;
  isSelected: boolean;
  isPlaying: boolean;
  hasRealAudio: boolean;
  onPlay: () => void;
  onTogglePlay: () => void;
  onToggleMenu: (e: React.MouseEvent<HTMLButtonElement>, trackId: string) => void;
  onEditTrack?: (track: Track) => void;
  onDeleteTrack?: (track: Track) => void;
  isReorderable: boolean;
}

const SortableMobileRow = ({
  track,
  index,
  project,
  isSelected,
  isPlaying,
  hasRealAudio,
  onPlay,
  onTogglePlay,
  onToggleMenu,
  onEditTrack,
  onDeleteTrack,
  isReorderable,
}: SortableMobileRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.95 : 1,
    zIndex: isDragging ? 50 : 0,
    backgroundColor: isDragging ? '#1C1B1B' : undefined,
    borderLeft: isDragging ? '2px solid #FF3B00' : '2px solid transparent',
    boxShadow: isDragging ? '0 8px 24px rgba(0, 0, 0, 0.6)' : undefined,
  };

  const isTrackPlaying = isSelected && isPlaying;
  const orderNumber = String(index + 1).padStart(2, '0');
  const secondaryMeta = [track.artist, track.bpm ? track.bpm + ' BPM' : '', track.key].filter(Boolean).join(' • ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'px-3.5 py-2.5 flex items-center justify-between gap-2 transition-colors text-left relative bg-[#000000]',
        hasRealAudio ? 'active:bg-[#1C1B1B]' : 'opacity-85 active:bg-[#161616]',
        isSelected && !isDragging ? 'bg-[#1C1B1B]' : ''
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {isReorderable ? (
          <div
            {...attributes}
            {...listeners}
            className={clsx(
              "w-11 h-11 shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none -ml-2 transition-colors",
              isDragging ? "text-[#FF3B00]" : "text-[#E8BDB3]/40 hover:text-white"
            )}
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 shrink-0 flex items-center justify-center">
            {hasRealAudio && isTrackPlaying ? (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay();
                }}
                className="text-[#FF3B00] cursor-pointer p-1"
              >
                <Pause className="w-4 h-4 fill-[#FF3B00]" />
              </motion.button>
            ) : (
              <span className="font-mono text-xs text-[#E8BDB3]/50">{orderNumber}</span>
            )}
          </div>
        )}

        <div
          className="min-w-0 flex-1 py-1"
          onClick={() => {
            if (hasRealAudio) onPlay();
          }}
          style={{ cursor: hasRealAudio ? 'pointer' : 'default' }}
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className={clsx('text-sm font-semibold truncate', isSelected ? 'text-[#FF3B00]' : 'text-[#E5E2E1]')}>
              {track.title}
            </p>
            {track.versionTag && (
              <span className="font-mono text-[10px] uppercase font-medium px-1.5 py-0.5 bg-[#0E0E0E] border border-[#282828] text-[#E8BDB3]/70 rounded-[3px]">
                {track.versionTag}
              </span>
            )}
          </div>
          {secondaryMeta && <p className="text-[11px] text-[#E8BDB3]/50 truncate mt-0.5">{secondaryMeta}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-xs text-[#E8BDB3]/60">{track.durationFormatted}</span>
        {(onEditTrack || onDeleteTrack || hasRealAudio) && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => onToggleMenu(e, track.id)}
            className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-[#E8BDB3]/60 hover:text-white rounded-[4px] hover:bg-[#2A2A2A] transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

interface SortableDesktopRowProps {
  track: Track;
  index: number;
  project?: Project;
  isSelected: boolean;
  isPlaying: boolean;
  hasRealAudio: boolean;
  onPlay: () => void;
  onTogglePlay: () => void;
  onToggleMenu: (e: React.MouseEvent<HTMLButtonElement>, trackId: string) => void;
  onEditTrack?: (track: Track) => void;
  onDeleteTrack?: (track: Track) => void;
  isReorderable: boolean;
}

const SortableDesktopRow = ({
  track,
  index,
  project,
  isSelected,
  isPlaying,
  hasRealAudio,
  onPlay,
  onTogglePlay,
  onToggleMenu,
  onEditTrack,
  onDeleteTrack,
  isReorderable,
}: SortableDesktopRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.95 : 1,
    zIndex: isDragging ? 50 : 0,
    backgroundColor: isDragging ? '#1C1B1B' : undefined,
    borderLeft: isDragging ? '2px solid #FF3B00' : undefined,
    boxShadow: isDragging ? '0 8px 24px rgba(0, 0, 0, 0.6)' : undefined,
  };

  const isTrackPlaying = isSelected && isPlaying;
  const secondaryMeta = [track.artist, track.bpm ? track.bpm + ' BPM' : '', track.key].filter(Boolean).join(' • ');

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={clsx(
        'group transition-colors text-sm relative bg-[#000000]',
        hasRealAudio ? 'hover:bg-[#1C1B1B]' : 'cursor-default opacity-85 hover:bg-[#161616]',
        isSelected && !isDragging && 'bg-[#1C1B1B]'
      )}
    >
      <td
        className="py-3 px-2 text-center text-[#E8BDB3]/30 group-hover:text-[#E5E2E1] cursor-grab active:cursor-grabbing touch-none"
        {...(isReorderable ? { ...attributes, ...listeners } : {})}
      >
        {isReorderable && <GripVertical className="w-4 h-4 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
      </td>
      <td className="py-3 px-3 text-center text-xs text-[#E8BDB3]/50 group-hover:text-white">
        <div className="relative flex items-center justify-center h-6 w-6 mx-auto">
          {hasRealAudio ? (
            isTrackPlaying ? (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay();
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
                    onPlay();
                  }}
                  className="hidden group-hover:block text-[#E5E2E1] hover:text-[#FF3B00] transition-colors cursor-pointer"
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
      <td
        className="py-3 px-4"
        onClick={() => {
          if (hasRealAudio) onPlay();
        }}
        style={{ cursor: hasRealAudio ? 'pointer' : 'default' }}
      >
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
            {secondaryMeta && <p className="text-xs text-[#E8BDB3]/50 truncate mt-0.5">{secondaryMeta}</p>}
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-right text-xs text-[#E8BDB3]/60 font-mono">
        {track.durationFormatted}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {hasRealAudio && (
            <motion.a
              whileTap={{ scale: 0.92 }}
              href={track.audioUrl}
              download={`${track.title}.mp3`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-[#E8BDB3]/60 hover:text-white hover:bg-[#2A2A2A] rounded transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </motion.a>
          )}
          {(onEditTrack || onDeleteTrack) && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={(e) => onToggleMenu(e, track.id)}
              className="p-1.5 text-[#E8BDB3]/60 hover:text-white hover:bg-[#2A2A2A] rounded transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </td>
    </tr>
  );
};

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
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex((t) => t.id === active.id);
      const newIndex = tracks.findIndex((t) => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && onReorderTracks) {
        onReorderTracks(arrayMove(tracks, oldIndex, newIndex));
      }
    }
  };

  return (
    <div className="w-full select-none">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {isDesktop ? (
            /* Desktop Table Tracklist (>= md) */
            <div className="w-full overflow-x-auto">
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

                    return (
                      <SortableDesktopRow
                        key={track.id}
                        track={track}
                        index={index}
                        project={project}
                        isSelected={isSelected}
                        isPlaying={isPlaying}
                        hasRealAudio={hasRealAudio}
                        onPlay={() => playTrack(track, project)}
                        onTogglePlay={togglePlay}
                        onToggleMenu={toggleMenu}
                        onEditTrack={onEditTrack}
                        onDeleteTrack={onDeleteTrack}
                        isReorderable={Boolean(onReorderTracks)}
                      />
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
          ) : (
            /* Mobile Stacked Tracklist (< md) */
            <div className="divide-y divide-[#282828]/60">
              {tracks.map((track, index) => {
                const hasRealAudio = track.hasAudio !== false && Boolean(track.audioUrl) && !track.isSample;
                const isSelected = currentTrack?.id === track.id;

                return (
                  <SortableMobileRow
                    key={track.id}
                    track={track}
                    index={index}
                    project={project}
                    isSelected={isSelected}
                    isPlaying={isPlaying}
                    hasRealAudio={hasRealAudio}
                    onPlay={() => playTrack(track, project)}
                    onTogglePlay={togglePlay}
                    onToggleMenu={toggleMenu}
                    onEditTrack={onEditTrack}
                    onDeleteTrack={onDeleteTrack}
                    isReorderable={Boolean(onReorderTracks)}
                  />
                );
              })}
              {tracks.length === 0 && (
                <div className="py-12 text-center text-xs text-[#E8BDB3]/50 px-4">
                  No tracks in this project yet. Tap "Add Songs" above to upload audio files.
                </div>
              )}
            </div>
          )}
        </SortableContext>
      </DndContext>

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
