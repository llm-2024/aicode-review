import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface ScanningProgressProps {
  progress: number;
}

export const ScanningProgress: React.FC<ScanningProgressProps> = ({ progress }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 flex-grow flex flex-col">
      <div className="flex items-center gap-3 p-3 bg-gray-800 border-b border-gray-700">
        <SparklesIcon className="h-5 w-5 text-purple-400" />
        <h3 className="text-md font-semibold text-white">AI Review</h3>
      </div>
      <div className="p-6 flex flex-col items-center justify-center flex-grow">
        <p className="text-gray-300 mb-4 animate-pulse">AI agent is scanning the code...</p>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-lg font-mono font-semibold mt-4 text-white">{Math.round(progress)}%</p>
      </div>
    </div>
  );
};