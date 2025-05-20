export interface Task {
  id: string;
  title: string;
  details?: string;
  completed: boolean;
  createdAt: number; // Using number for Date.now() timestamp
}

export interface SuggestedTask {
  id: string; // Temporary ID for UI key
  title: string;
}
