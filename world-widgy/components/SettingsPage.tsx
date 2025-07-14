
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { SunIcon, MoonIcon, AnalogueClockIcon, DigitalClockIcon, GridIcon, ListIcon } from './Icons';
import { ExpressiveSegmentedControl } from './ExpressiveSegmentedControl';
import { TopAppBar } from './TopAppBar';
import { PresetColorPicker } from './PresetColorPicker';

interface Option<T extends string> {
  value: T;
  label: string;
  Icon?: React.FC<{ className?: string }>; 
}

interface Metadata {
    name: string;
    description: string;
    version: string;
}

interface SettingsPageProps {
  onOpenColorPicker: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenColorPicker }) => {
  const { theme, setTheme, clockType, setClockType, viewType, setViewType, sourceColor, setSourceColor } = useSettings();
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  useEffect(() => {
    fetch('./metadata.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => setMetadata(data))
        .catch(error => console.error('Error fetching metadata:', error));
  }, []);

  const themeOptions: Option<'light' | 'dark'>[] = [
    { value: 'light', label: 'Light', Icon: SunIcon },
    { value: 'dark', label: 'Dark', Icon: MoonIcon }
  ];

  const clockOptions: Option<'digital' | 'analogue'>[] = [
    { value: 'digital', label: 'Digital', Icon: DigitalClockIcon },
    { value: 'analogue', label: 'Analogue', Icon: AnalogueClockIcon }
  ];

  const layoutOptions: Option<'grid' | 'list'>[] = [
    { value: 'grid', label: 'Grid', Icon: GridIcon },
    { value: 'list', label: 'List', Icon: ListIcon }
  ];
  
  return (
    <div>
        <TopAppBar title="Settings" />

        <main className="max-w-xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
          
          {/* --- Theme Section --- */}
          <section>
            <h3 className="m3-title-large text-primary mb-4 px-2">Theme</h3>
            <div className="space-y-4">
              <div className="widget-surface rounded-[28px] p-4 sm:p-5">
                <span className="m3-label-large text-on-surface-variant mb-3 block">Appearance</span>
                <ExpressiveSegmentedControl
                  options={themeOptions}
                  selectedValue={theme}
                  onChange={setTheme}
                />
              </div>
              <div className="widget-surface rounded-[28px] p-4 sm:p-5">
                <span className="m3-label-large text-on-surface-variant mb-3 block">Accent Color</span>
                <PresetColorPicker
                    sourceColor={sourceColor}
                    onColorChange={setSourceColor}
                    onCustomClick={onOpenColorPicker}
                />
              </div>
            </div>
          </section>
          
          {/* --- Clock Display Section --- */}
          <section>
            <h3 className="m3-title-large text-primary mb-4 px-2">Clock Display</h3>
            <div className="space-y-4">
               <div className="widget-surface rounded-[28px] p-4 sm:p-5">
                <span className="m3-label-large text-on-surface-variant mb-3 block">Clock Type</span>
                <ExpressiveSegmentedControl
                  options={clockOptions}
                  selectedValue={clockType}
                  onChange={setClockType}
                />
              </div>
              <div className="widget-surface rounded-[28px] p-4 sm:p-5">
                <span className="m3-label-large text-on-surface-variant mb-3 block">Secondary Layout</span>
                <ExpressiveSegmentedControl
                  options={layoutOptions}
                  selectedValue={viewType}
                  onChange={setViewType}
                />
              </div>
            </div>
          </section>

          {/* About Section */}
          <section>
            <h3 className="m3-title-large text-primary mb-4 px-2">About</h3>
            <div className="widget-surface rounded-[28px] p-5">
              <h4 className="m3-title-large text-on-surface">{metadata?.name || 'World Widgy'}</h4>
              <p className="m3-body-medium text-on-surface-variant">Version {metadata?.version || '...'}</p>
              <p className="m3-body-medium text-on-surface-variant mt-2">
                {metadata ? metadata.description : 'Loading...'}
              </p>
            </div>
          </section>
        </main>
    </div>
  );
};
