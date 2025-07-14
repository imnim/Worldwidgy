import React, { useState, useMemo } from 'react';
import { CloseIcon, ChevronDownIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { timezoneCoordinates } from '../data/timezonesWithCoords';
import {
  M3_EASING_EMPHASIZED_ACCELERATE,
  bottomSheetVariants,
} from '../utils/motion';

interface TimezoneSelectorProps {
  onSelect: (timezone: string) => void;
  onClose: () => void;
  existingTimezones: string[];
}

const allTimezones = Object.keys(timezoneCoordinates);

const formatTimezoneName = (tz: string): string => {
    return timezoneCoordinates[tz]?.city || tz.split('/').pop()?.replace(/_/g, ' ') || tz;
};

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({ onSelect, onClose, existingTimezones }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedContinents, setExpandedContinents] = useState<Set<string>>(new Set());

  const timezoneGroups = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    const sortedTimezones = [...allTimezones].sort();
    
    for (const tz of sortedTimezones) {
      if (existingTimezones.includes(tz)) {
        continue;
      }
      const continent = tz.split('/')[0];
      if (!grouped[continent]) {
        grouped[continent] = [];
      }
      grouped[continent].push(tz);
    }
    Object.values(grouped).forEach(cities => cities.sort((a, b) => formatTimezoneName(a).localeCompare(formatTimezoneName(b))));
    return grouped;
  }, [existingTimezones]);

  const displayList = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return [];

    const list: ({ type: 'header'; value: string } | { type: 'city'; value: string })[] = [];
    const continents = Object.keys(timezoneGroups).sort();

    for (const continent of continents) {
        const cities = timezoneGroups[continent];
        const filteredCities = cities.filter(tz => formatTimezoneName(tz).toLowerCase().includes(searchLower));

        if (filteredCities.length > 0) {
            list.push({ type: 'header', value: continent });
            filteredCities.forEach(city => {
                list.push({ type: 'city', value: city });
            });
        }
    }
    return list;
  }, [searchTerm, timezoneGroups]);

  const toggleContinent = (continent: string) => {
    setExpandedContinents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(continent)) {
        newSet.delete(continent);
      } else {
        newSet.add(continent);
      }
      return newSet;
    });
  };

  const renderSearchResults = () => (
    <ul>
      {displayList.map((item) => {
        if (item.type === 'header') {
          return (
            <li key={item.value} className="sticky top-0 bg-surface-container z-10 py-1">
              <h3 className="m3-label-large text-primary font-medium px-4 pt-2 pb-1">
                {item.value.replace(/_/g, ' ')}
              </h3>
            </li>
          );
        }
        return (
          <li key={item.value}>
            <button
              onClick={() => onSelect(item.value)}
              className="relative w-full text-left px-4 py-2.5 hover:bg-surface-container-high transition-colors text-on-surface-variant rounded-lg m3-body-large isolate"
            >
              <div className="m3-state-layer text-on-surface"></div>
              {formatTimezoneName(item.value)}
            </button>
          </li>
        );
      })}
    </ul>
  );

  const renderGroupedList = () => {
    const continents = Object.keys(timezoneGroups).sort();
    return (
      <ul>
        {continents.map(continent => {
          const isExpanded = expandedContinents.has(continent);
          return (
            <li key={continent} className="py-1">
              <button
                onClick={() => toggleContinent(continent)}
                className="w-full flex justify-between items-center px-4 py-2.5 text-left m3-label-large text-primary font-medium hover:bg-surface-container-high rounded-lg transition-colors focus:outline-none"
                aria-expanded={isExpanded}
              >
                <span>{continent.replace(/_/g, ' ')}</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className="h-5 w-5" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.ul
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: 'auto', transition: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] } },
                      collapsed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] } }
                    }}
                    className="overflow-hidden pl-2"
                  >
                    {timezoneGroups[continent].map(city => (
                      <li key={city}>
                        <button
                          onClick={() => onSelect(city)}
                          className="relative w-full text-left px-4 py-2 hover:bg-surface-container-high transition-colors text-on-surface-variant rounded-lg m3-body-large isolate"
                        >
                          <div className="m3-state-layer text-on-surface"></div>
                          {formatTimezoneName(city)}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    );
  };
  
  const hasSearchTerm = searchTerm.trim().length > 0;

  return (
    <motion.div
      className="fixed inset-0 bg-scrim/60 flex justify-center items-end z-50 will-change-opacity"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: M3_EASING_EMPHASIZED_ACCELERATE }}
    >
      <motion.div
        className="picker-surface rounded-t-[28px] w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl shadow-black/30 will-change-[transform,opacity,filter]"
        onClick={e => e.stopPropagation()}
        variants={bottomSheetVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        aria-modal="true"
        role="dialog"
      >
        <div className="w-10 h-1.5 bg-outline-variant rounded-full mx-auto mt-3" />
        
        <header className="flex justify-between items-center p-4 pt-3 shrink-0">
            <div className="w-10 h-10" /> {/* Spacer */}
            <h2 className="m3-title-large text-on-surface text-center">
              Choose a City
            </h2>
            <button onClick={onClose} className="relative text-on-surface-variant w-10 h-10 flex items-center justify-center rounded-full isolate" aria-label="Close">
                <div className="m3-state-layer"></div>
                <CloseIcon />
            </button>
        </header>

        <div className="px-4 pb-4 shrink-0">
          <input
            type="text"
            placeholder="Search for a city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container-high text-on-surface placeholder-on-surface-variant rounded-xl px-4 py-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-primary m3-body-large"
            autoFocus
          />
        </div>

        <div className="overflow-y-auto px-2 pb-2 flex-grow">
          {hasSearchTerm ? (
            displayList.length > 0 ? (
                renderSearchResults()
            ) : (
                <p className="text-center py-8 text-on-surface-variant m3-body-large">
                  No results found.
                </p>
            )
          ) : (
            renderGroupedList()
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};