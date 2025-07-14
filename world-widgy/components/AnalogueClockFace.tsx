
import React from 'react';
import { motion } from 'framer-motion';

interface AnalogueClockFaceProps {
  hoursDeg: number;
  minutesDeg: number;
  secondsDeg: number;
}

const Hand: React.FC<{ rotation: number; className: string; length: string; width: string; }> = ({ rotation, className, length, width }) => (
  <motion.div
    className={`absolute bottom-1/2 left-1/2 ${width} ${length}`}
    style={{ transformOrigin: 'bottom', x: '-50%' }}
    initial={false}
    animate={{ rotate: rotation }}
    transition={{
        type: "spring",
        stiffness: 180, // Softer spring
        damping: 26,    // Adjusted damping
        restDelta: 0.001,
    }}
  >
    <div className={`w-full h-full rounded-full ${className}`} />
  </motion.div>
);

const ClockNumber: React.FC<{ hour: number }> = ({ hour }) => {
  // Angle for each hour in radians. 0 radians is at 3 o'clock.
  // We subtract PI/2 to make 12 o'clock (which is 0 or 2PI) be at the top.
  const angle = (hour / 12) * 2 * Math.PI - Math.PI / 2;

  // The distance from the center of the clock, as a percentage of the container's radius.
  // 42% leaves some padding from the edge.
  const radius = 42;

  // Calculate the x and y coordinates. 50% is the center.
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);

  return (
    <div
      className={`absolute w-6 h-6 flex items-center justify-center m3-body-small ${hour % 3 === 0 ? 'text-on-surface font-semibold' : 'text-on-surface-variant'}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)', // Center the div on the calculated point
      }}
    >
      {hour}
    </div>
  );
};


export const AnalogueClockFace: React.FC<AnalogueClockFaceProps> = ({ hoursDeg, minutesDeg, secondsDeg }) => {
  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full rounded-full bg-surface-bright shadow-md shadow-inner"></div>

      {[...Array(12)].map((_, i) => <ClockNumber key={i} hour={i + 1} />)}

      <Hand rotation={hoursDeg} className="bg-primary" length="h-[28%]" width="w-[6%]" />
      <Hand rotation={minutesDeg} className="bg-secondary" length="h-[40%]" width="w-[4%]" />
      <Hand rotation={secondsDeg} className="bg-tertiary" length="h-[42%]" width="w-[2%]" />

      <div className="absolute top-1/2 left-1/2 w-[8%] h-[8%] -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full border-2 border-[var(--surface-bright)]" />
    </div>
  );
};