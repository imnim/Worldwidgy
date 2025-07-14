import React from 'react';
import { motion } from 'framer-motion';
import { HomeIcon, HomeFilledIcon, SettingsIcon, SettingsFilledIcon } from './Icons';
import { ActiveView } from '../types';
import { EXPRESSIVE_SPRING, GENTLE_SPRING } from '../utils/motion';

interface NavItem {
  view: ActiveView;
  label: string;
  Icon: React.FC;
  ActiveIcon: React.FC;
}

const navItems: NavItem[] = [
  { view: 'home', label: 'Home', Icon: HomeIcon, ActiveIcon: HomeFilledIcon },
  { view: 'settings', label: 'Settings', Icon: SettingsIcon, ActiveIcon: SettingsFilledIcon },
];


export const NavigationBar: React.FC<{ activeView: ActiveView; setActiveView: (view: ActiveView) => void; }> = ({ activeView, setActiveView }) => {
    return (
        <motion.div
            className="fixed inset-x-0 bottom-5 z-50 flex justify-center"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={GENTLE_SPRING}
        >
            <nav 
                className="liquid-glass relative p-1.5 rounded-full shadow-lg"
                style={{
                  boxShadow: '0 8px 24px rgba(var(--shadow-rgb), 0.25)'
                }}
            >
                <ul className="flex items-center gap-1 relative">
                    {navItems.map(({ view, label, Icon, ActiveIcon }) => {
                        const isActive = activeView === view;
                        return (
                            <li key={view} className="relative">
                                <button
                                    onClick={() => setActiveView(view)}
                                    className={`relative z-10 px-10 py-1 flex flex-col items-center justify-center gap-1 focus:outline-none rounded-full transition-colors duration-200
                                      ${isActive 
                                        ? 'text-on-primary-container' 
                                        : 'text-on-surface-variant'
                                      }`
                                    }
                                    aria-label={label}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {isActive ? <ActiveIcon /> : <Icon />}
                                    <span className="m3-label-medium font-medium">
                                        {label}
                                    </span>
                                </button>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill-bg"
                                        className="absolute inset-0 bg-primary-container rounded-full"
                                        style={{ zIndex: 5 }}
                                        transition={EXPRESSIVE_SPRING}
                                    />
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </motion.div>
    );
};