import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { X, GripVertical, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '../../types';
import { DropdownPortal } from '../ui/DropdownPortal';
import { queuePanelVariants, EASE_OUT_EXPO } from '../../constants/motion';

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({ isOpen, onClose }) => {
  const {
    currentTrack,
    currentProject,
    manualQueue,
    isShuffle,
    shuffledContext,
    removeFromQueue,
    reorderQueue,
  } = usePlayer();

  const [draggedItem, setDraggedItem] = useState<{ type: 'manual', index: number } | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{ type: 'manual', index: number } | null>(null);

  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [menuTriggerRect, setMenuTriggerRect] = useState<DOMRect | null>(null);

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    e.stopPropagation();
    if (activeMenuIndex === index) {
      setActiveMenuIndex(null);
      setMenuTriggerRect(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuTriggerRect(rect);
      setActiveMenuIndex(index);
    }
  };

  const closeMenu = () => {
    setActiveMenuIndex(null);
    setMenuTriggerRect(null);
  };


  // Calculate remaining context tracks
  let upcomingContextTracks: Track[] = [];
  if (isShuffle) {
    upcomingContextTracks = shuffledContext;
  } else if (currentProject && currentTrack) {
    const playableTracks = currentProject.tracks.filter(
      (t) => t.hasAudio !== false && Boolean(t.audioUrl) && !t.isSample
    );
    const idx = playableTracks.findIndex((t) => t.id === currentTrack.id);
    if (idx !== -1) {
      upcomingContextTracks = playableTracks.slice(idx + 1);
    }
  }

  // Drag Handlers for manual queue
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem({ type: 'manual', index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverItem?.index !== index) {
      setDragOverItem({ type: 'manual', index });
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.index === dropIndex) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    reorderQueue(draggedItem.index, dropIndex);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={queuePanelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute bottom-full right-0 md:right-4 w-full md:w-[360px] h-[65vh] md:max-h-[480px] bg-[#1C1B1B] border-t md:border border-[#282828] rounded-t-[12px] md:rounded-[8px] shadow-2xl flex flex-col z-40 overflow-hidden md:mb-2 md:bottom-[100%]"
        >
          <div className="flex items-center justify-between p-3 border-b border-[#282828] bg-[#201F1F] sticky top-0 shrink-0">
            <h3 className="text-[12px] font-bold text-[#E5E2E1] uppercase tracking-[0.1em]">Play Queue</h3>
            <motion.button
              whileTap={{ scale: 0.90 }}
              onClick={onClose}
              className="text-[#E8BDB3]/60 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {/* Now Playing */}
            {currentTrack && (
              <div>
                <h4 className="text-[10px] font-bold text-[#FF3B00] uppercase tracking-widest px-2 mb-1.5">Now Playing</h4>
                <div className="flex items-center gap-3 p-2 bg-[#2A2A2A] rounded-[4px] border border-[#FF3B00]/30 shadow-inner">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-white truncate">{currentTrack.title}</div>
                    <div className="text-[11px] text-[#E8BDB3]/70 truncate">{currentTrack.artist || currentProject?.artist}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Up Next (Manual) */}
            {manualQueue.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-[#E8BDB3]/80 uppercase tracking-widest px-2 mb-1.5">Up Next</h4>
                <div className="space-y-0.5">
                  {manualQueue.map((track, i) => {
                    const isDragging = draggedItem?.index === i;
                    const isDropTarget = dragOverItem?.index === i;
                    return (
                      <motion.div
                        layout="position"
                        transition={{ duration: 0.16, ease: EASE_OUT_EXPO }}
                        key={`${track.id}-${i}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, i)}
                        onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, i)}
                        onDrop={(e) => handleDrop(e as unknown as React.DragEvent, i)}
                        onDragEnd={handleDragEnd}
                        className={clsx(
                          "flex items-center gap-2 p-1.5 rounded-[4px] group transition-colors hover:bg-[#2A2A2A]",
                          isDragging && "opacity-40",
                          isDropTarget && "border-t-2 border-t-[#FF3B00]"
                        )}
                      >
                        <div className="text-[#E8BDB3]/30 hover:text-white cursor-grab active:cursor-grabbing p-1 hidden sm:block">
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-[#E5E2E1] truncate">{track.title}</div>
                          <div className="text-[11px] text-[#E8BDB3]/60 truncate">{track.artist}</div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => toggleMenu(e, i)}
                          className="p-1.5 hover:bg-[#1C1B1B] rounded-[3px] text-[#E8BDB3]/60 hover:text-white transition-all cursor-pointer"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next in Project/Context */}
            {upcomingContextTracks.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-[#E8BDB3]/50 uppercase tracking-widest px-2 mb-1.5">
                  Next from: <span className="text-[#E8BDB3]/80">{currentProject?.title}</span> {isShuffle ? '(Shuffled)' : ''}
                </h4>
                <div className="space-y-0.5 opacity-80">
                  {upcomingContextTracks.map((track, i) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-2 p-1.5 rounded-[4px] transition-colors hover:bg-[#2A2A2A]"
                    >
                      <div className="w-6 text-center text-[10px] text-[#E8BDB3]/40 font-mono hidden sm:block">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-[#E8BDB3] truncate">{track.title}</div>
                        <div className="text-[11px] text-[#E8BDB3]/50 truncate">{track.artist}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {manualQueue.length === 0 && upcomingContextTracks.length === 0 && (
              <div className="py-8 text-center text-[12px] text-[#E8BDB3]/40 font-medium">
                No upcoming tracks in queue.
              </div>
            )}
          </div>

          <DropdownPortal
            isOpen={activeMenuIndex !== null}
            onClose={closeMenu}
            triggerRect={menuTriggerRect}
            className="w-36"
          >
            <button
              onClick={() => {
                if (activeMenuIndex !== null) {
                  removeFromQueue(activeMenuIndex);
                }
                closeMenu();
              }}
              className="w-full text-left px-3 py-2 text-[#FF3B00] hover:bg-[#1C1B1B] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </DropdownPortal>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
