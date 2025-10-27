import type { Commit, CodeDiff } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Parses a GitHub URL to extract the owner and repository name.
 * @param url The full GitHub URL
 * @returns An object with owner and repo, or null if invalid.
 */
export const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
  const match = url.match(/github\.com\/([^/]+)\/([^/.]+)/);
  if (match && match[1] && match[2]) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
};

/**
 * Handles API errors by checking the response status and throwing a readable error.
 * @param response The fetch API Response object.
 */
const handleApiError = async (response: Response) => {
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Repository not found. Please check the URL.');
        }
        if (response.status === 403) {
            const data = await response.json();
            throw new Error(`API rate limit exceeded. Please wait and try again. Message: ${data.message}`);
        }
        throw new Error(`GitHub API returned status ${response.status}`);
    }
};

/**
 * Fetches the latest commits from a GitHub repository.
 * @param owner The repository owner.
 * @param repo The repository name.
 * @returns A promise that resolves to an array of commits.
 */
export const fetchCommits = async (owner: string, repo: string): Promise<Commit[]> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits`);
  await handleApiError(response);
  const data = await response.json();

  return data.slice(0, 15).map((commit: any) => ({
    id: commit.sha,
    message: commit.commit.message.split('\n')[0], // Use only the first line of the message
    author: commit.commit.author.name,
    date: new Date(commit.commit.author.date).toLocaleDateString(),
  }));
};

/**
 * Fetches the detailed diff for a single commit from GitHub.
 * @param owner The repository owner.
 * @param repo The repository name.
 * @param sha The SHA of the commit.
 * @returns A promise that resolves to the detailed diff data.
 */
export const fetchCommitDetail = async (owner: string, repo: string, sha: string): Promise<CodeDiff | null> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`);
  await handleApiError(response);
  const data = await response.json();
  
  if (!data.files || data.files.length === 0) {
    return null; // No files changed in this commit
  }

  // For simplicity, we'll focus on the first file with a patch.
  // A more robust implementation might show all files or let the user choose.
  const firstFileWithPatch = data.files.find((file: any) => file.patch);

  if (!firstFileWithPatch) {
    return {
        fileName: data.files[0].filename,
        patch: 'No applicable code changes to display for this file (e.g., binary file or mode change).'
    };
  }
  
  return {
    fileName: firstFileWithPatch.filename,
    patch: firstFileWithPatch.patch,
  };
};
