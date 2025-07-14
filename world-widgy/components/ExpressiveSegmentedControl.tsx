
import React from 'react';
import { motion } from 'framer-motion';
import { EXPRESSIVE_SPRING } from '../utils/motion';

interface Option<T extends string> {
  value: T;
  label: string;
  Icon?: React.FC<{ className?: string }>;
}

interface ExpressiveSegmentedControlProps<T extends string> {
  options: Option<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
}

export function ExpressiveSegmentedControl<T extends string>({
  options,
  selectedValue,
  onChange,
}: ExpressiveSegmentedControlProps<T>) {

  return (
    <div className="flex w-full p-1 rounded-full bg-surface-container">
      {options.map(({ value, label, Icon }) => {
        const isSelected = selectedValue === value;

        return (
          <motion.button
            key={value}
            onClick={() => onChange(value)}
            className={`flex-auto relative py-2.5 px-4 flex items-center justify-center gap-2 focus:outline-none m3-label-large rounded-full isolate transition-colors duration-200 ${
                isSelected ? 'text-on-primary' : 'text-on-surface-variant'
            }`}
            aria-pressed={isSelected}
            aria-label={label}
          >
            {isSelected && (
                <motion.div
                    layoutId={`ssc-indicator-${options.map(o=>o.value).join('-')}`}
                    className="absolute inset-0 bg-primary rounded-full -z-10"
                    transition={EXPRESSIVE_SPRING}
                />
            )}
            {Icon && <Icon className="h-5 w-5" />}
            <span>{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
