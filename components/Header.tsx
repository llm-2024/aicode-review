import React from 'react';
import { YunxiaoLogo } from './icons/YunxiaoLogo';
import { PlusIcon } from './icons/PlusIcon';

interface HeaderProps {
  onImportClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onImportClick }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <YunxiaoLogo className="h-8 w-8 text-white" />
        <div>
            <h1 className="text-xl font-bold text-white">AI Code Review Assistant</h1>
            <p className="text-xs text-gray-400">Powered by Gemini</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onImportClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Import Project
        </button>
        <div className="h-6 w-px bg-gray-600"></div>
        <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="text-sm text-green-400">System Operational</span>
      </div>
    </header>
  );
};
