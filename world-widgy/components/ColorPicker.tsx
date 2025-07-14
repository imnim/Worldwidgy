

import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, Variants } from 'framer-motion';
import { hslaToHex, hexToHsla } from '../utils/theme';
import { Slider } from './Slider';

type HSLA = { h: number; s: number; l: number; a: number };

interface ColorPickerProps {
    sourceColor: string;
    onChange: (color: string) => void;
    onClose: () => void;
}

const modalVariants: Variants = {
    initial: { opacity: 0, scale: 0.95, y: 15 },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 600, damping: 50 },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 15,
        transition: { duration: 0.15, ease: 'easeOut' },
    },
};

const ColorField = React.memo(({ hsla, setHsla }: { hsla: HSLA; setHsla: (newHsla: HSLA) => void }) => {
    const fieldRef = React.useRef<HTMLDivElement>(null);

    const handleInteraction = (event: MouseEvent | TouchEvent | PointerEvent) => {
        if (!fieldRef.current) return;
        const rect = fieldRef.current.getBoundingClientRect();
        
        const pointerEvent = 'touches' in event ? (event.touches[0] || event.changedTouches[0]) : event;
        const x = Math.max(0, Math.min(pointerEvent.clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(pointerEvent.clientY - rect.top, rect.height));

        const s = x / rect.width;
        const l = 1 - y / rect.height;

        setHsla({ ...hsla, s, l });
    };

    const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
       handleInteraction(event);
    };

    const xPercent = hsla.s * 100;
    const yPercent = (1 - hsla.l) * 100;
    const handleSize = 24; // w-6, h-6 -> 1.5rem -> 24px

    return (
        <motion.div 
          ref={fieldRef} 
          onPan={handlePan} 
          onPanStart={handlePan} 
          onTap={(e) => handleInteraction(e as any)}
          className="relative w-full aspect-square rounded-2xl cursor-crosshair" style={{ backgroundColor: `hsl(${hsla.h * 360}, 100%, 50%)` }}>
            <div className="absolute inset-0 w-full h-full rounded-2xl" style={{ background: 'linear-gradient(to right, white, transparent)' }} />
            <div className="absolute inset-0 w-full h-full rounded-2xl" style={{ background: 'linear-gradient(to top, black, transparent)' }} />
            <motion.div
                className="absolute w-6 h-6 rounded-full border-4 border-white shadow-md pointer-events-none"
                style={{
                    left: `calc(${xPercent}% - ${xPercent / 100 * handleSize}px)`,
                    top: `calc(${yPercent}% - ${yPercent / 100 * handleSize}px)`,
                    backgroundColor: hslaToHex(hsla),
                }}
                initial={false}
                animate={{ scale: 1 }}
            />
        </motion.div>
    );
});


export const ColorPicker: React.FC<ColorPickerProps> = ({ sourceColor, onChange, onClose }) => {
    const [hsla, setHsla] = useState<HSLA>(() => {
        const initialHsla = hexToHsla(sourceColor);
        initialHsla.a = 1; // Always work with full opacity
        return initialHsla;
    });

    useEffect(() => {
        const newHsla = hexToHsla(sourceColor);
        newHsla.a = 1; // Ensure alpha is always 1
        if(hslaToHex(newHsla) !== hslaToHex(hsla)) {
             setHsla(newHsla);
        }
    }, [sourceColor]);

    const handleConfirm = () => {
        const finalHex = hslaToHex(hsla);
        onChange(finalHex);
        onClose();
    };
    
    return (
        <motion.div
            className="fixed inset-0 bg-scrim/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="picker-surface rounded-[28px] w-full max-w-xs flex flex-col shadow-2xl shadow-black/30 text-on-surface"
                onClick={e => e.stopPropagation()}
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                aria-modal="true"
            >
                <div className="p-4 space-y-4">
                    <ColorField hsla={hsla} setHsla={setHsla} />
                    <div className="space-y-3 pt-2">
                        <Slider
                            value={hsla.h}
                            onChange={(h) => setHsla({ ...hsla, h })}
                            ariaLabel="Hue slider"
                        >
                            <div className="w-full h-full rounded-full" style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }} />
                        </Slider>
                    </div>
                </div>
                <footer className="flex justify-end items-center px-4 py-3 gap-2 border-t border-outline-variant/30">
                    <button
                        onClick={onClose}
                        aria-label="Cancel color selection"
                        className="relative h-10 px-6 flex items-center justify-center rounded-full m3-label-large text-primary isolate"
                    >
                        <div className="m3-state-layer"></div>
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        aria-label="Confirm color selection"
                        className="relative h-10 px-6 flex items-center justify-center rounded-full m3-label-large bg-primary text-on-primary shadow-sm isolate"
                    >
                        <div className="m3-state-layer"></div>
                        Apply
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};