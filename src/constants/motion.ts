import { Transition, Variants } from 'motion/react';

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

export const TRANSITION_FAST: Transition = {
  duration: 0.12,
  ease: EASE_OUT_EXPO,
};

export const TRANSITION_DEFAULT: Transition = {
  duration: 0.18,
  ease: EASE_OUT_EXPO,
};

export const TRANSITION_PANEL: Transition = {
  duration: 0.2,
  ease: EASE_OUT_EXPO,
};

export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.14, ease: 'easeIn' } },
};

export const modalContentVariants: Variants = {
  initial: { opacity: 0, y: 6, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.985,
    transition: { duration: 0.14, ease: 'easeIn' },
  },
};

export const queuePanelVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
};

export const expandedPlayerBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.16, ease: 'easeIn' } },
};

export const expandedPlayerContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

export const loopEditorBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
};

export const loopEditorContentVariants: Variants = {
  initial: { opacity: 0, y: 8, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.985,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

export const pageViewVariants: Variants = {
  initial: { opacity: 0, y: 5 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease: EASE_OUT_EXPO },
  },
};

export const iconCrossfadeVariants: Variants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.12, ease: EASE_OUT_EXPO } },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.08, ease: 'easeIn' } },
};
