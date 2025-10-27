import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface ImportModalProps {
  isOpen: boolean;
  isImporting: boolean;
  onClose: () => void;
  onImport: (url: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, isImporting, onClose, onImport }) => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/facebook/react');

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const handleImportClick = () => {
    if (repoUrl.trim()) {
      onImport(repoUrl.trim());
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-gray-700 p-6 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Import GitHub Repository</h2>
        <p className="text-sm text-gray-400 mb-5">
          Enter the URL of a public GitHub repository to begin.
        </p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="repo-url" className="block text-sm font-medium text-gray-300 mb-2">
              Repository URL
            </label>
            <input
              type="text"
              id="repo-url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isImporting}
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="https://github.com/owner/repo"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isImporting}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImportClick}
            disabled={!repoUrl.trim() || isImporting}
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-blue-600/50 disabled:cursor-not-allowed w-28 flex items-center justify-center"
          >
            {isImporting ? (
              <>
                <LoadingSpinner className="h-5 w-5 mr-2" />
                Importing...
              </>
            ) : (
              'Import'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
