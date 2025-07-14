
import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { generateSchemeFromColor, hexToRgb } from '../utils/theme';

type Theme = 'light' | 'dark';
type ClockType = 'digital' | 'analogue';
type ViewType = 'grid' | 'list';

interface SettingsContextType {
  theme: Theme;
  clockType: ClockType;
  viewType: ViewType;
  sourceColor: string;
  setTheme: (theme: Theme) => void;
  setClockType: (clockType: ClockType) => void;
  setViewType: (viewType: ViewType) => void;
  setSourceColor: (color: string) => void;
}

// A custom hook to manage state in localStorage, defined here for encapsulation.
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}


const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('clock-theme', 'light');
  const [clockType, setClockType] = useLocalStorage<ClockType>('clock-type', 'digital');
  const [viewType, setViewType] = useLocalStorage<ViewType>('clock-view-type', 'grid');
  const [sourceColor, setSourceColor] = useLocalStorage<string>('clock-source-color', '#4F378B');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  useEffect(() => {
    const scheme = generateSchemeFromColor(sourceColor);
    const activePalette = theme === 'dark' ? scheme.dark : scheme.light;
    const root = document.documentElement.style;

    Object.entries(activePalette).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.setProperty(cssVar, value);
    });

    const primaryRgb = hexToRgb(activePalette.primary)?.join(', ');
    const outlineRgb = hexToRgb(activePalette.outline)?.join(', ');
    const surfaceContainerRgb = hexToRgb(activePalette.surfaceContainer)?.join(', ');
    const schHighestRgb = hexToRgb(activePalette.surfaceContainerHighest)?.join(', ');
    const shadowRgb = hexToRgb(activePalette.shadow)?.join(', ');
    const onBackgroundRgb = hexToRgb(activePalette.onBackground)?.join(', ');
    
    // Set RGB versions for effects
    if (primaryRgb) root.setProperty('--primary-rgb', primaryRgb);
    if (outlineRgb) root.setProperty('--outline-rgb', outlineRgb);
    if (schHighestRgb) root.setProperty('--surface-container-highest-rgb', schHighestRgb);
    if (shadowRgb) root.setProperty('--shadow-rgb', shadowRgb);
    if (onBackgroundRgb) root.setProperty('--on-background-rgb', onBackgroundRgb);

    // Set full RGBA values for picker surface
    if (surfaceContainerRgb && outlineRgb) {
        root.setProperty('--picker-surface-bg', `rgba(${surfaceContainerRgb}, 0.92)`);
        root.setProperty('--picker-surface-border', `rgba(${outlineRgb}, 0.2)`);
    }

    // Update meta tags for PWA/mobile browser chrome
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', activePalette.surface);
    }
    const appleStatusBarStyleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleStatusBarStyleMeta) {
      appleStatusBarStyleMeta.setAttribute('content', theme === 'dark' ? 'black-translucent' : 'default');
    }

  }, [sourceColor, theme]);
  
  const value = useMemo(() => ({ theme, clockType, viewType, sourceColor, setTheme, setClockType, setViewType, setSourceColor }), [theme, clockType, viewType, sourceColor, setTheme, setClockType, setViewType, setSourceColor]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};