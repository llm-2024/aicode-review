import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CommitList } from './components/CommitList';
import { CodeDiffViewer } from './components/CodeDiffViewer';
import { AiReview } from './components/AiReview';
import { Header } from './components/Header';
import { ImportModal } from './components/ImportModal';
import { reviewCode } from './services/geminiService';
import { fetchCommits, fetchCommitDetail, parseRepoUrl } from './services/githubService';
import type { Commit, CodeDiff } from './types';
import { LoadingSpinner } from './components/icons/LoadingSpinner';
import { ScanningProgress } from './components/ScanningProgress';
import { YunxiaoLogo } from './components/icons/YunxiaoLogo';
import { PlusIcon } from './components/icons/PlusIcon';

const App: React.FC = () => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [codeDiff, setCodeDiff] = useState<CodeDiff | null>(null);
  const [diffCache, setDiffCache] = useState<Record<string, CodeDiff>>({});
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isDiffLoading, setIsDiffLoading] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [currentRepo, setCurrentRepo] = useState<{ owner: string; repo: string } | null>(null);
  const [scanningProgress, setScanningProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!currentRepo && commits.length === 0) {
      setIsImportModalOpen(true);
    }
  }, []); 

  const cleanupProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleSelectCommit = useCallback(async (commit: Commit) => {
    setSelectedCommit(commit);
    setAiReview(null);
    setReviewError(null);
    setCodeDiff(null); 

    if (diffCache[commit.id]) {
      setCodeDiff(diffCache[commit.id]);
      return;
    }

    if (!currentRepo) {
      setReviewError("Cannot fetch commit details: no repository is loaded.");
      return;
    }
    
    setIsDiffLoading(true);

    try {
      const newDiff = await fetchCommitDetail(currentRepo.owner, currentRepo.repo, commit.id);
      
      if (newDiff) {
        setDiffCache(prev => ({ ...prev, [commit.id]: newDiff }));
        setCodeDiff(newDiff);
      } else {
        const noChangeDiff = { fileName: 'No file changes', patch: 'This commit might be a merge commit or have no direct code changes to display.' };
        setDiffCache(prev => ({ ...prev, [commit.id]: noChangeDiff }));
        setCodeDiff(noChangeDiff);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setReviewError(`Failed to fetch commit details: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsDiffLoading(false);
    }
  }, [currentRepo, diffCache]);

  const triggerReview = useCallback(async () => {
    if (!codeDiff || !codeDiff.patch || codeDiff.fileName === 'No file changes') return;

    setIsLoading(true);
    setAiReview(null);
    setReviewError(null);
    setScanningProgress(0);
    cleanupProgressInterval();
    
    progressIntervalRef.current = window.setInterval(() => {
        setScanningProgress(prev => {
            if (prev >= 95) {
                cleanupProgressInterval();
                return 95;
            }
            return prev + Math.floor(Math.random() * 5) + 5;
        });
    }, 200);

    try {
      const diffText = `File: ${codeDiff.fileName}\n${codeDiff.patch}`;
      const review = await reviewCode(diffText);
      cleanupProgressInterval();
      setScanningProgress(100);
      setTimeout(() => {
          setAiReview(review);
          setIsLoading(false);
      }, 300);
    } catch (err) {
      setReviewError('Failed to get AI review. Please check your API key and try again.');
      console.error(err);
      cleanupProgressInterval();
      setIsLoading(false);
    }
  }, [codeDiff]);

  useEffect(() => {
    if (codeDiff) {
      triggerReview();
    }
  }, [codeDiff, triggerReview]);
  
  useEffect(() => {
    return cleanupProgressInterval;
  }, []);

  useEffect(() => {
    if (commits.length > 0 && !selectedCommit) {
      handleSelectCommit(commits[0]);
    } else if (commits.length === 0) {
      setSelectedCommit(null);
      setCodeDiff(null);
    }
  }, [commits, selectedCommit, handleSelectCommit]);

  const handleImportRepo = async (url: string) => {
    setIsImporting(true);
    setCommits([]);
    setSelectedCommit(null);
    setCodeDiff(null);
    setDiffCache({});
    setAiReview(null);
    setImportError(null);
    setReviewError(null);
    setCurrentRepo(null);

    const repoInfo = parseRepoUrl(url);
    if (!repoInfo) {
      setImportError("Invalid GitHub repository URL. Please use a format like 'https://github.com/owner/repo'.");
      setIsImporting(false);
      return;
    }
    
    setCurrentRepo(repoInfo);

    try {
      const data = await fetchCommits(repoInfo.owner, repoInfo.repo);
      setCommits(data);
      setIsImportModalOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setImportError(`Failed to import repository: ${errorMessage}`);
    } finally {
      setIsImporting(false);
    }
  };

  const renderMainContent = () => {
    if (isImporting && commits.length === 0) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400 animate-pulse">Importing from GitHub...</p>
        </div>
      );
    }

    if (importError) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Import Failed</h2>
            <p className="text-gray-400 mb-6 max-w-md">{importError}</p>
            <button
              onClick={() => {
                setImportError(null);
                setIsImportModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Try Again
            </button>
        </div>
      );
    }

    if (selectedCommit) {
      return (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">{selectedCommit.message}</h1>
            <p className="text-sm text-gray-400">
              Authored by <span className="font-medium text-blue-400">{selectedCommit.author}</span> on {selectedCommit.date}
            </p>
          </div>
          <div className="flex flex-col xl:flex-row gap-8 flex-grow">
            <div className="xl:w-2/3 flex-shrink-0">
              {isDiffLoading ? (
                <div className="flex-grow flex flex-col items-center justify-center h-full bg-gray-800/50 rounded-lg border border-gray-700">
                  <LoadingSpinner />
                  <p className="mt-4 text-gray-400">Loading diff...</p>
                </div>
              ) : (
                <CodeDiffViewer diff={codeDiff} />
              )}
            </div>
            <div className="xl:w-1/3 flex flex-col">
              {isLoading ? (
                <ScanningProgress progress={scanningProgress} />
              ) : reviewError ? (
                <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
                  <p className="font-semibold">Error</p>
                  <p>{reviewError}</p>
                </div>
              ) : aiReview ? (
                <AiReview review={aiReview} />
              ) : null}
            </div>
          </div>
        </>
      );
    }

    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
            <YunxiaoLogo className="h-16 w-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Welcome to the AI Code Review Assistant</h2>
            <p className="text-gray-400 mb-6 max-w-md">
            Get started by importing a public GitHub repository. The assistant will analyze commits and provide expert feedback powered by Gemini.
            </p>
            <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
                <PlusIcon className="h-5 w-5" />
                Import Project
            </button>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <Header onImportClick={() => setIsImportModalOpen(true)} />
      <ImportModal
        isOpen={isImportModalOpen}
        isImporting={isImporting}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportRepo}
      />
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        <aside className="w-full md:w-1/3 lg:w-1/4 h-64 md:h-auto border-r border-gray-700 overflow-y-auto p-4 bg-gray-800/50">
          <h2 className="text-lg font-semibold mb-3 px-2 text-gray-300">Commits</h2>
          <CommitList
            commits={commits}
            selectedCommitId={selectedCommit?.id}
            onSelectCommit={handleSelectCommit}
          />
        </aside>
        <main className="flex-grow flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
