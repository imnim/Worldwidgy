import React from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { TrashIcon } from './Icons';

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
}

const SWIPE_THRESHOLD = -80;

export const SwipeToDelete: React.FC<SwipeToDeleteProps> = ({ children, onDelete }) => {
  const x = useMotionValue(0);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < SWIPE_THRESHOLD) {
      onDelete();
    }
  };

  const backgroundOpacity = useTransform(x, [-100, 0], [1, 0]);
  const iconScale = useTransform(x, [-80, -40], [1, 0.5]);

  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 bg-error rounded-[28px] flex items-center justify-end px-8"
        style={{ opacity: backgroundOpacity }}
        aria-hidden="true"
      >
        <motion.div style={{ scale: iconScale }}>
          <TrashIcon className="h-6 w-6 text-on-error" />
        </motion.div>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.25, right: 0 }}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
};