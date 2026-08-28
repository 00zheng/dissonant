import React from 'react';
import { clsx } from 'clsx';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  label: string;
  count?: number;
}

export const Chip: React.FC<ChipProps> = ({
  active = false,
  label,
  count,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer flex items-center gap-2 border',
        active
          ? 'bg-[#E5E2E1] text-[#000000] border-[#E5E2E1]'
          : 'bg-transparent text-[#E5E2E1] border-[#282828] hover:border-[#5E3F38] hover:bg-[#1C1B1B]',
        className
      )}
      {...props}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={clsx(
            'px-1.5 py-0.5 rounded-full font-mono-label text-[10px]',
            active ? 'bg-[#000000] text-white' : 'bg-[#2A2A2A] text-[#E8BDB3]'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};
