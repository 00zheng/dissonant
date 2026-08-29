import React, { useRef, useState } from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0 to 100
  onChange?: (value: number) => void;
  onScrubStart?: () => void;
  onScrub?: (value: number) => void;
  onScrubEnd?: (value: number) => void;
  height?: number; // default 2px
  className?: string;
  loopAStartPct?: number; // 0 to 100
  loopBEndPct?: number; // 0 to 100
  isLoopActive?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  onChange,
  onScrubStart,
  onScrub,
  onScrubEnd,
  height = 2,
  className,
  loopAStartPct,
  loopBEndPct,
  isLoopActive,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalValue, setInternalValue] = useState<number | null>(null);

  const calculatePercentage = (clientX: number) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const pos = clientX - rect.left;
    return Math.max(0, Math.min(100, (pos / rect.width) * 100));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onChange && !onScrubStart) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    
    const pct = calculatePercentage(e.clientX);
    setInternalValue(pct);
    onScrubStart?.();
    onScrub?.(pct);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const pct = calculatePercentage(e.clientX);
    setInternalValue(pct);
    onScrub?.(pct);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    setInternalValue(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    const pct = calculatePercentage(e.clientX);
    onScrubEnd?.(pct);
    onChange?.(pct);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    setInternalValue(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    // On cancel, we might want to revert or just end where it was.
    // Usually ending where it was is safer.
    const pct = calculatePercentage(e.clientX);
    onScrubEnd?.(pct);
  };

  const hasLoopRegion =
    loopAStartPct !== undefined &&
    loopBEndPct !== undefined &&
    loopAStartPct < loopBEndPct;

  const displayValue = isDragging && internalValue !== null ? internalValue : value;

  return (
    <div
      ref={barRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={clsx(
        'relative w-full cursor-pointer h-4 flex items-center group select-none',
        className
      )}
    >
      {/* Background Track */}
      <div className="w-full bg-[#1A1A1A] rounded-full overflow-hidden relative" style={{ height: `${height}px` }}>
        {/* A-B Loop Region Highlight */}
        {isLoopActive && hasLoopRegion && (
          <div
            className="absolute top-0 bottom-0 bg-[#FACC15]/20 transition-all pointer-events-none"
            style={{
              left: `${Math.max(0, loopAStartPct)}%`,
              width: `${Math.min(100 - loopAStartPct, loopBEndPct - loopAStartPct)}%`,
            }}
          />
        )}

        {/* Playhead Progress Fill */}
        <div
          className={clsx("bg-[#FF3B00] h-full transition-all", isDragging ? 'duration-0' : 'duration-75')}
          style={{ width: `${Math.min(100, Math.max(0, displayValue))}%` }}
        />
      </div>

      {/* A & B Pin Markers */}
      {isLoopActive && hasLoopRegion && (
        <>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-[2px] h-3 bg-[#FACC15] pointer-events-none z-10 -translate-x-[1px]"
            style={{ left: `${Math.max(0, loopAStartPct)}%` }}
          >
            <div className="absolute bottom-full mb-0.5 text-[9px] sm:text-[10px] font-bold text-[#FACC15] -translate-x-1/2 left-[1px]">
              A
            </div>
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-[2px] h-3 bg-[#FACC15] pointer-events-none z-10 -translate-x-[1px]"
            style={{ left: `${Math.min(100, loopBEndPct)}%` }}
          >
            <div className="absolute bottom-full mb-0.5 text-[9px] sm:text-[10px] font-bold text-[#FACC15] -translate-x-1/2 left-[1px]">
              B
            </div>
          </div>
        </>
      )}

      {/* Handle Knob (visible on hover or dragging) */}
      {(onChange || onScrubStart) && (
        <div
          className={clsx(
            "absolute w-3 h-3 bg-white rounded-full shadow border border-[#FF3B00] transition-opacity duration-150 transform -translate-x-1/2",
            isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          style={{ left: `${Math.min(100, Math.max(0, displayValue))}%` }}
        />
      )}
    </div>
  );
};
