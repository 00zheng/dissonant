import React from 'react';
import { Track, Project } from '../../types';
import { Play, Pause, MoreHorizontal, Download } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { clsx } from 'clsx';

interface TrackListProps {
  tracks: Track[];
  project?: Project;
}

export const TrackList: React.FC<TrackListProps> = ({ tracks, project }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-[#282828] text-[#E8BDB3]/50 text-xs font-medium">
            <th className="py-3 px-4 w-12 text-center">#</th>
            <th className="py-3 px-4">Title</th>
            <th className="py-3 px-4 text-center">BPM / Key</th>
            <th className="py-3 px-4 text-right">Duration</th>
            <th className="py-3 px-4 w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#282828]/50">
          {tracks.map((track, index) => {
            const isSelected = currentTrack?.id === track.id;
            const isTrackPlaying = isSelected && isPlaying;

            return (
              <tr
                key={track.id}
                onClick={() => playTrack(track, project)}
                className={clsx(
                  'group hover:bg-[#1C1B1B] transition-colors cursor-pointer text-sm',
                  isSelected && 'bg-[#1C1B1B]'
                )}
              >
                {/* Index / Play Button Cell */}
                <td className="py-3 px-4 text-center text-xs text-[#E8BDB3]/50 group-hover:text-white">
                  <div className="relative flex items-center justify-center h-6 w-6 mx-auto">
                    {isTrackPlaying ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                        className="text-[#FF3B00] hover:scale-110 transition-transform"
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
                          className="hidden group-hover:block text-[#E5E2E1] hover:text-[#FF3B00] transition-colors"
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
                      <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className={clsx('font-medium text-[#E5E2E1] group-hover:text-white', isSelected && 'text-[#FF3B00]')}>
                        {track.title}
                      </p>
                      <p className="text-xs text-[#E8BDB3]/50 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Key / BPM */}
                <td className="py-3 px-4 text-center text-xs text-[#E8BDB3]/70 font-mono">
                  <span>{track.bpm} BPM</span>
                  <span className="text-[#E8BDB3]/40 mx-1.5">•</span>
                  <span>{track.key}</span>
                </td>

                {/* Duration */}
                <td className="py-3 px-4 text-right text-xs text-[#E8BDB3]/60 font-mono">
                  {track.durationFormatted}
                </td>

                {/* Row Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-[#E8BDB3]/60 hover:text-white hover:bg-[#2A2A2A] rounded transition-colors"
                      title="Download Track"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-[#E8BDB3]/60 hover:text-white hover:bg-[#2A2A2A] rounded transition-colors"
                      title="More Options"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

