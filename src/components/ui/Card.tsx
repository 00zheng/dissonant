import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'low' | 'high';
  hoverEffect?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hoverEffect = false,
  className,
  children,
  ...props
}) => {
  const variants = {
    low: 'bg-[#1C1B1B] border-[#282828]',
    default: 'bg-[#201F1F] border-[#282828]',
    high: 'bg-[#2A2A2A] border-[#353534]'
  };

  return (
    <div
      className={clsx(
        'border rounded-[8px] transition-all duration-200 overflow-hidden',
        variants[variant],
        hoverEffect && 'hover:bg-[#2A2A2A] hover:border-[#E5E2E1] cursor-pointer group',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
