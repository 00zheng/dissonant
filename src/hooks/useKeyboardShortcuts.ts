import { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

export const useKeyboardShortcuts = (
  isQueuePanelOpen: boolean,
  setIsQueuePanelOpen: (val: boolean) => void
) => {
  const {
    togglePlay,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    playNext,
    playPrevious,
    seek,
    currentTime,
    duration
  } = usePlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Filter out editable targets and range sliders
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable
      ) {
        return;
      }

      // Space needs extra check for buttons so they can be activated natively
      if (e.key === ' ' && target instanceof HTMLButtonElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 's':
        case 'S':
          if (e.altKey) {
            e.preventDefault();
            toggleShuffle();
          }
          break;
        case 'r':
        case 'R':
          if (e.altKey) {
            e.preventDefault();
            toggleRepeat();
          }
          break;
        case 'Q':
        case 'q':
          if (e.altKey && e.shiftKey) {
            e.preventDefault();
            setIsQueuePanelOpen(!isQueuePanelOpen);
          }
          break;
        case 'ArrowRight':
          if (e.shiftKey) {
            e.preventDefault();
            playNext();
          } else {
            e.preventDefault();
            seek(Math.min(currentTime + 5, duration));
          }
          break;
        case 'ArrowLeft':
          if (e.shiftKey) {
            e.preventDefault();
            playPrevious();
          } else {
            e.preventDefault();
            seek(Math.max(currentTime - 5, 0));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    playNext,
    playPrevious,
    seek,
    currentTime,
    duration,
    isQueuePanelOpen,
    setIsQueuePanelOpen,
  ]);
};
