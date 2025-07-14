import React from 'react';
import { motion } from 'framer-motion';
import { AddIcon } from './Icons';
import { EXPRESSIVE_SPRING } from '../utils/motion';

interface FloatingActionButtonProps {
  onClick: () => void;
  ariaLabel: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, ariaLabel }) => {
  return (
    <motion.button
      onClick={onClick}
      aria-label={ariaLabel}
      className="fixed bottom-28 right-6 w-16 h-16 flex items-center justify-center isolate z-40 liquid-glass rounded-full shadow-lg"
      style={{
        boxShadow: '0 8px 24px rgba(var(--shadow-rgb), 0.25)'
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={EXPRESSIVE_SPRING}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
    >
      <div className="m3-state-layer text-primary rounded-full" />
      <div className="relative z-10 text-primary">
        <AddIcon />
      </div>
    </motion.button>
  );
};