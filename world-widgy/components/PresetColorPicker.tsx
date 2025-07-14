
import React from 'react';
import { motion } from 'framer-motion';
import { PaletteIcon } from './Icons';
import { EXPRESSIVE_SPRING } from '../utils/motion';

const PRESET_COLORS = ['#4F378B', '#ef4444', '#3b82f6', '#8b5cf6', '#ef57a5', '#eab308'];

interface PresetColorPickerProps {
  sourceColor: string;
  onColorChange: (color: string) => void;
  onCustomClick: () => void;
}

export const PresetColorPicker: React.FC<PresetColorPickerProps> = ({ sourceColor, onColorChange, onCustomClick }) => {
  const isPresetActive = PRESET_COLORS.map(c => c.toLowerCase()).includes(sourceColor.toLowerCase());
  const isCustomActive = !isPresetActive;

  const colorSwatches = [
    ...PRESET_COLORS.map(color => ({ type: 'preset' as const, value: color })),
    { type: 'custom' as const, value: 'custom' }
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {colorSwatches.map((swatch) => {
        const isActive = swatch.type === 'preset' ? sourceColor.toLowerCase() === swatch.value.toLowerCase() : isCustomActive;

        if (swatch.type === 'custom') {
          return (
            <button
              key="custom-color"
              onClick={onCustomClick}
              className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary ring-offset-2 ring-offset-surface-container"
              aria-label="Choose a custom color"
            >
              {isActive && (
                <motion.div
                  layoutId="color-picker-active-indicator"
                  className="absolute -inset-1 rounded-full border-2 border-primary ring-2 ring-primary"
                  transition={EXPRESSIVE_SPRING}
                />
              )}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: isCustomActive
                    ? sourceColor
                    : 'conic-gradient(from 180deg at 50% 50%, #ff0000, #ff00ff, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000)',
                }}
              />
              <PaletteIcon className="w-6 h-6 relative z-10" style={{ filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.5))', color: 'white' }} />
            </button>
          );
        }

        return (
          <button
            key={swatch.value}
            onClick={() => onColorChange(swatch.value)}
            className="relative w-12 h-12 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary ring-offset-2 ring-offset-surface-container"
            aria-label={`Select preset color ${swatch.value}`}
            style={{ backgroundColor: swatch.value }}
          >
            {isActive && (
              <motion.div
                layoutId="color-picker-active-indicator"
                className="absolute -inset-1 rounded-full border-2 border-primary ring-2 ring-primary"
                transition={EXPRESSIVE_SPRING}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
