import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-150 rounded-[4px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF3B00]';

  const variants = {
    primary: 'bg-[#E5E2E1] text-[#000000] hover:bg-white hover:scale-[1.01] active:scale-[0.99]',
    accent: 'bg-[#FF3B00] text-white hover:bg-[#FF562D] hover:scale-[1.01] active:scale-[0.99]',
    secondary: 'bg-[#1C1B1B] text-[#E5E2E1] border border-[#282828] hover:bg-[#2A2A2A] hover:border-[#5E3F38]',
    ghost: 'text-[#E5E2E1] hover:bg-[#1C1B1B] hover:text-white',
    outline: 'border border-[#282828] text-[#E5E2E1] hover:border-[#E5E2E1] hover:bg-[#131313]'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-6 py-3 gap-2.5 h-12'
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
