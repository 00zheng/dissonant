import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { X, GripVertical, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '../../types';
import { DropdownPortal } from '../ui/DropdownPortal';
import { queuePanelVariants, EASE_OUT_EXPO } from '../../constants/motion';
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

interface SortableQueueRowProps {
  id: string;
  track: Track;
  index: number;
  isManual: boolean;
  onToggleMenu?: (e: React.MouseEvent<HTMLButtonElement>, index: number) => void;
}

const SortableQueueRow = ({ id, track, index, isManual, onToggleMenu }: SortableQueueRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "flex items-center gap-2 p-1.5 rounded-[4px] group transition-colors hover:bg-[#2A2A2A] bg-[#1C1B1B]",
        isDragging && "opacity-40",
        "relative"
      )}
    >
      <div {...attributes} {...listeners} className="text-[#E8BDB3]/30 hover:text-white cursor-grab active:cursor-grabbing p-1 touch-none">
        <GripVertical className="w-3.5 h-3.5" />
      </div>
      
      {!isManual && (
        <div className="w-6 text-center text-[10px] text-[#E8BDB3]/40 font-mono hidden sm:block">
          {index + 1}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-[#E5E2E1] truncate">{track.title}</div>
        <div className="text-[11px] text-[#E8BDB3]/60 truncate">{track.artist}</div>
      </div>
      
      {isManual && onToggleMenu && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={(e) => onToggleMenu(e, index)}
          className="p-1.5 hover:bg-[#1C1B1B] rounded-[3px] text-[#E8BDB3]/60 hover:text-white transition-all cursor-pointer"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </div>
  );
};


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
    sessionContext,
    removeFromQueue,
    reorderQueue,
    reorderShuffledContext,
    reorderSessionContext,
  } = usePlayer();

  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [menuTriggerRect, setMenuTriggerRect] = useState<DOMRect | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

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

  let upcomingContextTracks: Track[] = [];
  if (isShuffle) {
    upcomingContextTracks = shuffledContext;
  } else if (sessionContext) {
    upcomingContextTracks = sessionContext;
  }

  const manualIds = manualQueue.map((t, i) => `manual-${t.id}-${i}`);
  const upcomingIds = upcomingContextTracks.map((t, i) => `upcoming-${t.id}-${i}`);

  const handleManualDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = manualIds.indexOf(active.id as string);
      const newIndex = manualIds.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQueue(oldIndex, newIndex);
      }
    }
  };

  const handleUpcomingDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = upcomingIds.indexOf(active.id as string);
      const newIndex = upcomingIds.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        if (isShuffle) {
          reorderShuffledContext(oldIndex, newIndex);
        } else {
          reorderSessionContext(oldIndex, newIndex);
        }
      }
    }
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
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleManualDragEnd}>
                  <SortableContext items={manualIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0.5">
                      {manualQueue.map((track, i) => (
                        <SortableQueueRow
                          key={manualIds[i]}
                          id={manualIds[i]}
                          track={track}
                          index={i}
                          isManual={true}
                          onToggleMenu={toggleMenu}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Next in Project/Context */}
            {upcomingContextTracks.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-[#E8BDB3]/50 uppercase tracking-widest px-2 mb-1.5">
                  Next from: <span className="text-[#E8BDB3]/80">{currentProject?.title}</span> {isShuffle ? '(Shuffled)' : ''}
                </h4>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleUpcomingDragEnd}>
                  <SortableContext items={upcomingIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0.5 opacity-80">
                      {upcomingContextTracks.map((track, i) => (
                        <SortableQueueRow
                          key={upcomingIds[i]}
                          id={upcomingIds[i]}
                          track={track}
                          index={i}
                          isManual={false}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
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
