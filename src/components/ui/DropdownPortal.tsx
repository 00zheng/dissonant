import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface DropdownPortalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRect: DOMRect | null;
  children: React.ReactNode;
  className?: string;
}

export const DropdownPortal: React.FC<DropdownPortalProps> = ({
  isOpen,
  onClose,
  triggerRect,
  children,
  className = '',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!isOpen || !triggerRect) return;

    const updatePosition = () => {
      const menuEl = menuRef.current;
      const menuWidth = menuEl ? menuEl.offsetWidth : 144;
      const menuHeight = menuEl ? menuEl.offsetHeight : 120;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Vertical auto-flipping
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      let top: number;
      if (spaceBelow < menuHeight + 8 && spaceAbove > spaceBelow) {
        // Flip above
        top = Math.max(8, triggerRect.top - menuHeight - 4);
      } else {
        // Render below
        top = Math.min(viewportHeight - menuHeight - 8, triggerRect.bottom + 4);
      }

      // Horizontal alignment (align right to trigger edge, stay in viewport)
      let left = triggerRect.right - menuWidth;
      left = Math.max(8, Math.min(left, viewportWidth - menuWidth - 8));

      setPosition({ top, left });
    };

    updatePosition();
    // Re-calculate after render if menu dimensions changed
    const timer = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(timer);
  }, [isOpen, triggerRect]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleScrollOrResize = () => {
      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !triggerRect) return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className={`z-50 bg-[#2A2A2A] border border-[#282828] rounded-[6px] shadow-2xl py-1 text-xs text-left select-none animate-in fade-in zoom-in-95 duration-100 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
};
