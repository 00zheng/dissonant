import React from 'react';
import { clsx } from 'clsx';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  icon,
  className,
  ...props
}) => {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <div className="absolute left-3.5 text-[#E8BDB3] opacity-60 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        className={clsx(
          'w-full bg-[#1C1B1B] text-[#E5E2E1] placeholder-[#E8BDB3]/50 border border-[#282828] rounded-[4px] py-2.5 px-4 text-sm transition-all focus:outline-none focus:border-[#FF3B00] focus:bg-[#201F1F]',
          icon ? 'pl-10' : 'pl-4',
          className
        )}
        {...props}
      />
    </div>
  );
};
