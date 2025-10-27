
export interface CodeDiff {
  fileName: string;
  patch: string;
}

export interface Commit {
  id: string; // This will be the SHA
  message: string;
  author: string;
  date: string;
}
