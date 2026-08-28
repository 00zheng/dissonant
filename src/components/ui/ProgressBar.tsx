import React, { useRef } from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0 to 100
  onChange?: (value: number) => void;
  height?: number; // default 2px
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  onChange,
  height = 2,
  className
}) => {
  const barRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || !onChange) return;
    const rect = barRef.current.getBoundingClientRect();
    const clickPos = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickPos / rect.width) * 100));
    onChange(percentage);
  };

  return (
    <div
      ref={barRef}
      onClick={handleClick}
      className={clsx(
        'relative w-full cursor-pointer py-2 group flex items-center',
        className
      )}
    >
      {/* Background Track */}
      <div className="w-full bg-[#1A1A1A] rounded-full overflow-hidden" style={{ height: `${height}px` }}>
        {/* Filled Region */}
        <div
          className="bg-[#FF3B00] h-full transition-all duration-75"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>

      {/* Handle Knob (visible on hover) */}
      {onChange && (
        <div
          className="absolute w-3 h-3 bg-white rounded-full shadow border border-[#FF3B00] opacity-0 group-hover:opacity-100 transition-opacity duration-150 transform -translate-x-1/2"
          style={{ left: `${Math.min(100, Math.max(0, value))}%` }}
        />
      )}
    </div>
  );
};
