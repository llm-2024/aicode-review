
import React from 'react';
import type { Commit } from '../types';
import { CommitIcon } from './icons/CommitIcon';

interface CommitListProps {
  commits: Commit[];
  selectedCommitId: string | null;
  onSelectCommit: (commit: Commit) => void;
}

export const CommitList: React.FC<CommitListProps> = ({
  commits,
  selectedCommitId,
  onSelectCommit,
}) => {
  return (
    <nav>
      <ul>
        {commits.map((commit) => (
          <li key={commit.id} className="mb-1">
            <button
              onClick={() => onSelectCommit(commit)}
              className={`w-full text-left p-2.5 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                selectedCommitId === commit.id
                  ? 'bg-blue-600/30 text-white'
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <CommitIcon className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
                <div className="flex-grow">
                    <p className="font-medium text-sm leading-tight">{commit.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {commit.author} - {commit.date}
                    </p>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
