import { Variants, Transition } from 'framer-motion';

// Easing curves based on Material 3's expressive motion spec
// https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
export const M3_EASING_EMPHASIZED_DECELERATE: [number, number, number, number] = [0.05, 0.7, 0.1, 1.0];
export const M3_EASING_EMPHASIZED_ACCELERATE: [number, number, number, number] = [0.3, 0.0, 0.8, 0.15];
export const M3_EASING_STANDARD_DECELERATE: [number, number, number, number] = [0, 0, 0, 1];
export const M3_EASING_STANDARD_ACCELERATE: [number, number, number, number] = [0.3, 0, 1, 1];


// A more expressive spring, great for UI elements that should feel responsive and physical.
export const EXPRESSIVE_SPRING: Transition = {
  type: 'spring',
  stiffness: 500, // Increased stiffness for a quicker response
  damping: 40,    // Increased damping to reduce oscillation
};

// A slightly softer spring for larger elements.
export const GENTLE_SPRING: Transition = {
  type: 'spring',
  stiffness: 250,
  damping: 30,
};


// Variants for main page transitions (e.g., Home <-> Settings)
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: M3_EASING_EMPHASIZED_DECELERATE } }, // Faster
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: M3_EASING_EMPHASIZED_ACCELERATE } }, // Faster
};

// Variants for list/grid containers to stagger children
export const listContainerVariants = (stagger: number = 0.05): Variants => ({ // Faster stagger
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
    },
  },
});

// Variants for items within a staggered list/grid
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.4, ease: M3_EASING_EMPHASIZED_DECELERATE } // Faster
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    transition: { duration: 0.2, ease: M3_EASING_EMPHASIZED_ACCELERATE } 
  },
};


// Variants for elements that fade through (e.g., switching clock type)
export const fadeThroughVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 }, // Reduced scale effect
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: M3_EASING_STANDARD_DECELERATE }}, // Faster
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: M3_EASING_STANDARD_ACCELERATE }}, // Faster
};

// Variants for bottom sheet modals that slide up and fade in/out
export const bottomSheetVariants: Variants = {
  initial: { y: '100%', filter: 'blur(0px)' },
  animate: {
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4, // Faster
      ease: M3_EASING_EMPHASIZED_DECELERATE,
    },
  },
  exit: {
    y: '100%',
    filter: 'blur(8px)',
    transition: {
      duration: 0.25, // Faster
      ease: M3_EASING_EMPHASIZED_ACCELERATE,
    },
  },
};