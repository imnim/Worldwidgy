
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from './components/Clock';
import { TimezoneSelector } from './components/TimezoneSelector';
import { SettingsPage } from './components/SettingsPage';
import { NavigationBar } from './components/NavigationBar';
import { TopAppBar } from './components/TopAppBar';
import { FloatingActionButton } from './components/FloatingActionButton';
import { pageVariants, listContainerVariants, listItemVariants } from './utils/motion';
import { useSettings } from './contexts/SettingsContext';
import { ActiveView } from './types';
import { ColorPicker } from './components/ColorPicker';

const correctLegacyTimezones = (tzs: string[]): string[] => {
  const corrected = tzs.map(tz => tz.toLowerCase() === 'asia/katmandu' ? 'Asia/Kathmandu' : tz);
  return [...new Set(corrected)];
};

const getInitialTimezones = (): string[] => {
    let initialTimezones: string[];
    try {
      const storedTimezones = localStorage.getItem('timezones');
      if (storedTimezones) {
        const parsed = JSON.parse(storedTimezones);
        initialTimezones = parsed.length > 0 ? parsed : [Intl.DateTimeFormat().resolvedOptions().timeZone];
      } else {
        initialTimezones = [Intl.DateTimeFormat().resolvedOptions().timeZone, 'Europe/London', 'Asia/Tokyo'];
      }
    } catch (error) {
      console.error("Failed to parse timezones from localStorage", error);
      initialTimezones = [Intl.DateTimeFormat().resolvedOptions().timeZone, 'Europe/London', 'Asia/Tokyo'];
    }
    return correctLegacyTimezones(initialTimezones);
};

const App: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [timezones, setTimezones] = useState<string[]>(getInitialTimezones);
  const { viewType, sourceColor, setSourceColor } = useSettings();
  const [isFabVisible, setIsFabVisible] = useState(true);
  const fabHideTimer = useRef<number | null>(null);

  const resetFabVisibilityTimer = useCallback(() => {
    if (activeView === 'home') {
      if (fabHideTimer.current) {
        clearTimeout(fabHideTimer.current);
      }
      setIsFabVisible(true);
      fabHideTimer.current = window.setTimeout(() => {
        setIsFabVisible(false);
      }, 4000); // Shortened delay
    }
  }, [activeView]);

  useEffect(() => {
    if (activeView === 'home') {
      resetFabVisibilityTimer();

      const eventTypes: ('mousemove' | 'mousedown' | 'scroll' | 'keydown' | 'touchstart')[] = ['mousemove', 'mousedown', 'scroll', 'keydown', 'touchstart'];
      eventTypes.forEach(type => window.addEventListener(type, resetFabVisibilityTimer, { passive: true }));

      return () => {
        eventTypes.forEach(type => window.removeEventListener(type, resetFabVisibilityTimer));
        if (fabHideTimer.current) {
          clearTimeout(fabHideTimer.current);
        }
      };
    } else {
      if (fabHideTimer.current) {
        clearTimeout(fabHideTimer.current);
      }
    }
  }, [activeView, resetFabVisibilityTimer]);

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('timezones', JSON.stringify(timezones));
    } catch (error) {
        console.error("Failed to save timezones to localStorage", error);
    }
  }, [timezones]);

  const addTimezone = useCallback((timezone: string) => {
    if (!timezones.includes(timezone)) {
      setTimezones(prev => [...prev, timezone]);
    }
    setShowTimezoneSelector(false);
  }, [timezones]);

  const removeTimezone = useCallback((timezone: string) => {
    setTimezones(prev => prev.filter(tz => tz !== timezone));
  }, []);

  const primaryTimezone = timezones[0] || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const listContainerClass = viewType === 'list'
    ? "w-full p-4 pt-0 sm:p-6 sm:pt-0 lg:w-2/3 lg:p-8 flex flex-col items-center gap-4 sm:gap-6"
    : "w-full p-4 pt-0 sm:p-6 sm:pt-0 lg:w-2/3 lg:p-8 grid grid-cols-2 lg:grid-cols-3 items-start gap-4 sm:gap-6";

  return (
    <div className="min-h-screen text-on-background bg-background transition-colors duration-300 pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="will-change-[transform,opacity]"
        >
          {activeView === 'home' ? (
            <div>
              <TopAppBar 
                title="World Widgy"
              />
              <main className="flex flex-col lg:flex-row-reverse lg:items-start">
                <div className="w-full lg:w-1/3 lg:shrink-0">
                  <div className="p-4 sm:p-6 lg:p-8 lg:sticky lg:top-8">
                      <Clock timezone={primaryTimezone} date={now} isPrimary={true} />
                  </div>
                </div>

                {timezones.length > 1 && (
                  <motion.div 
                    layout 
                    className={listContainerClass}
                    variants={listContainerVariants()}
                    initial="hidden"
                    animate="visible"
                  >
                    <AnimatePresence>
                      {timezones.slice(1).map(tz => (
                        <motion.div
                          key={tz}
                          layout
                          variants={listItemVariants}
                          className={`will-change-[transform,opacity] ${viewType === 'list' ? 'w-full max-w-lg' : ''}`}
                        >
                          <Clock timezone={tz} date={now} isPrimary={false} onRemove={(timezone) => removeTimezone(timezone)} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </main>
            </div>
          ) : (
            <SettingsPage onOpenColorPicker={() => setIsColorPickerOpen(true)} />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {activeView === 'home' && isFabVisible && (
           <FloatingActionButton
              onClick={() => setShowTimezoneSelector(true)}
              ariaLabel="Add a new city"
           />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTimezoneSelector && (
          <TimezoneSelector
            onSelect={addTimezone}
            onClose={() => setShowTimezoneSelector(false)}
            existingTimezones={timezones}
          />
        )}
      </AnimatePresence>
      
       <AnimatePresence>
            {isColorPickerOpen && (
                <ColorPicker
                    sourceColor={sourceColor}
                    onChange={setSourceColor}
                    onClose={() => setIsColorPickerOpen(false)}
                />
            )}
        </AnimatePresence>

      <AnimatePresence>
        {!showTimezoneSelector && !isColorPickerOpen && (
          <NavigationBar activeView={activeView} setActiveView={setActiveView} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;