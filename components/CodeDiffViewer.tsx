
import React from 'react';
import type { CodeDiff } from '../types';
import { FileIcon } from './icons/FileIcon';

interface CodeDiffViewerProps {
  diff: CodeDiff | null;
}

const DiffLine: React.FC<{ line: string }> = ({ line }) => {
  const isAddition = line.startsWith('+');
  const isDeletion = line.startsWith('-');
  const isContext = line.startsWith('@@');
  
  let bgColor = 'bg-transparent';
  let prefix = ' ';
  let content = line;

  if (isAddition) {
    bgColor = 'bg-green-900/30';
    prefix = '+';
    content = line.substring(1);
  } else if (isDeletion) {
    bgColor = 'bg-red-900/30';
    prefix = '-';
    content = line.substring(1);
  } else if (isContext) {
    bgColor = 'bg-gray-700/50';
    content = line;
    prefix = '';
  } else {
    // Keep the space for context lines
    content = line.substring(1);
  }

  return (
    <div className={`flex font-mono ${bgColor} ${isContext ? 'text-cyan-400' : ''}`}>
      <span className={`w-8 text-center text-gray-500 select-none flex-shrink-0 ${isAddition ? 'text-green-400' : ''} ${isDeletion ? 'text-red-400' : ''}`}>{prefix}</span>
      <code className="whitespace-pre-wrap flex-grow">{content}</code>
    </div>
  );
};

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({ diff }) => {
  if (!diff) {
    return (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden h-full flex flex-col items-center justify-center">
            <p className="text-gray-500">Select a commit to see the changes.</p>
        </div>
    );
  }
  
  const diffLines = diff.patch ? diff.patch.trim().split('\n') : [];

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 p-3 bg-gray-800 border-b border-gray-700">
        <FileIcon className="h-5 w-5 text-gray-400" />
        <span className="font-mono text-sm text-gray-300">{diff.fileName}</span>
      </div>
      <div className="p-4 text-sm overflow-auto flex-grow">
        {diffLines.length > 0 ? diffLines.map((line, index) => (
          <DiffLine key={index} line={line} />
        )) : <p className="text-gray-500 px-4">No changes to display.</p>}
      </div>
    </div>
  );
};
