import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { X, GripVertical } from 'lucide-react';
import { clsx } from 'clsx';
import { Track } from '../../types';

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
  } = usePlayer();

  if (!isOpen) return null;

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

  return (
    <div className="absolute bottom-full right-0 md:right-4 w-full md:w-[360px] h-[65vh] md:max-h-[480px] bg-[#1C1B1B] border-t md:border border-[#282828] rounded-t-[12px] md:rounded-[8px] shadow-2xl flex flex-col z-40 overflow-hidden md:mb-2 md:bottom-[100%]">
      <div className="flex items-center justify-between p-3 border-b border-[#282828] bg-[#201F1F] sticky top-0 shrink-0">
        <h3 className="text-[12px] font-bold text-[#E5E2E1] uppercase tracking-[0.1em]">Play Queue</h3>
        <button onClick={onClose} className="text-[#E8BDB3]/60 hover:text-white transition-colors cursor-pointer p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Now Playing */}
        {currentTrack && (
          <div>
            <h4 className="text-[10px] font-bold text-[#FF3B00] uppercase tracking-widest px-2 mb-1.5">Now Playing</h4>
            <div className="flex items-center gap-3 p-2 bg-[#2A2A2A] rounded-[4px] border border-[#FF3B00]/30 shadow-inner">
              <img src={currentTrack.coverUrl || currentProject?.coverUrl} alt="Cover" className="w-10 h-10 rounded-[2px] object-cover bg-black" />
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
              {manualQueue.map((track, i) => (
                <div key={`${track.id}-${i}`} className="flex items-center gap-2 p-1.5 hover:bg-[#2A2A2A] rounded-[4px] group transition-colors">
                  <div className="text-[#E8BDB3]/30 hover:text-white cursor-grab active:cursor-grabbing p-1 hidden sm:block">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2.5">
                    <img src={track.coverUrl || currentProject?.coverUrl} alt="Cover" className="w-8 h-8 rounded-[2px] object-cover bg-black" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[#E5E2E1] truncate">{track.title}</div>
                      <div className="text-[11px] text-[#E8BDB3]/60 truncate">{track.artist}</div>
                    </div>
                  </div>
                  <button onClick={() => removeFromQueue(i)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#FF3B00] rounded-[3px] text-[#E8BDB3]/60 hover:text-white transition-all cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
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
                <div key={track.id} className="flex items-center gap-2 p-1.5 hover:bg-[#2A2A2A] rounded-[4px] transition-colors">
                  <div className="w-6 text-center text-[10px] text-[#E8BDB3]/40 font-mono hidden sm:block">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2.5">
                    <img src={track.coverUrl || currentProject?.coverUrl} alt="Cover" className="w-8 h-8 rounded-[2px] object-cover bg-black" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[#E8BDB3] truncate">{track.title}</div>
                      <div className="text-[11px] text-[#E8BDB3]/50 truncate">{track.artist}</div>
                    </div>
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
    </div>
  );
};
