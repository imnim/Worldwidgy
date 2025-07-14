import React from 'react';

interface TopAppBarProps {
  title: string;
  actions?: React.ReactNode;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title, actions }) => {
  return (
    <header className="flex justify-between items-center h-16 px-4 bg-background transition-colors duration-300">
      <h1 className="m3-title-large text-on-background">{title}</h1>
      {actions && (
        <div className="flex items-center gap-1">
          {actions}
        </div>
      )}
    </header>
  );
};