import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { modalBackdropVariants, modalContentVariants } from '../../constants/motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 1rem))',
            paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))',
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            variants={modalContentVariants}
            className="relative w-full max-w-lg bg-[#1C1B1B] border border-[#282828] rounded-[8px] p-6 shadow-2xl space-y-5 text-[#E5E2E1]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#282828] pb-4">
              <h3 className="text-lg font-bold text-[#E5E2E1] tracking-tight">{title}</h3>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                className="p-1 rounded-[4px] text-[#E8BDB3]/60 hover:text-white hover:bg-[#2A2A2A] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Modal Body */}
            <div>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

