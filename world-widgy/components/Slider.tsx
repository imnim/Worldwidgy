
import React, { useRef, useState, useLayoutEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';

interface SliderProps {
    value: number; // 0 to 1
    onChange: (newValue: number) => void;
    children: React.ReactNode;
    ariaLabel: string;
}

export const Slider: React.FC<SliderProps> = ({ value, onChange, children, ariaLabel }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const [handleWidth, setHandleWidth] = useState(0);

    // Measure the handle's width once it's rendered. This is crucial for the calc() formula.
    useLayoutEffect(() => {
        if (handleRef.current) {
            setHandleWidth(handleRef.current.offsetWidth);
        }
    }, []);

    // A single handler for both tap and pan (drag) gestures on the slider track.
    const handleInteraction = (event: MouseEvent | TouchEvent | PointerEvent) => {
        if (!sliderRef.current) return;
        
        const rect = sliderRef.current.getBoundingClientRect();
        // Use the event's clientX, which works for mouse, touch, and pointer events.
        const pointer = 'touches' in event ? (event.touches[0] || event.changedTouches[0]) : event;
        
        // Calculate the raw position of the tap/drag within the slider track.
        const tapX = pointer.clientX - rect.left;
        
        // Convert the pixel position to a value between 0 and 1, clamping it to stay within bounds.
        const newValue = Math.max(0, Math.min(tapX / rect.width, 1));

        if (!isNaN(newValue)) {
            onChange(newValue);
        }
    };
    
    // Framer Motion's onPan calls this function continuously during a drag gesture.
    const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        handleInteraction(event);
    };

    return (
        <motion.div
            ref={sliderRef}
            className="relative w-full h-8 flex items-center cursor-pointer"
            // By placing handlers on the track, the whole component is interactive.
            onTap={(e) => handleInteraction(e as any)}
            onPan={handlePan}
            onPanStart={handlePan}
            whileTap={{ cursor: 'grabbing' }}
        >
            <div className="relative w-full h-6 rounded-full overflow-hidden pointer-events-none">
                <div className="absolute inset-0 w-full h-full">
                    {children}
                </div>
            </div>
            {/* 
              The handle is now a visual indicator. Its position is declaratively set via style.
              This removes the need for Framer Motion's `drag` prop and its constraints,
              using a more robust CSS-based approach inspired by the ColorField component.
            */}
            <motion.div
                ref={handleRef}
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white bg-transparent shadow-md z-10 pointer-events-none"
                style={{
                    // This is the core of the fix. It moves the handle based on the value (0-1).
                    // `calc(${value * 100}% - ${value * handleWidth}px)` ensures the handle's
                    // position is interpolated across the track, accounting for its own width.
                    // When value=0, left=0. When value=1, left=100% - handleWidth.
                    // This guarantees the handle never exceeds the track's boundaries.
                    left: handleWidth > 0 ? `calc(${value * 100}% - ${value * handleWidth}px)` : `${value * 100}%`,
                }}
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                aria-label={ariaLabel}
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={value}
            />
        </motion.div>
    );
};
