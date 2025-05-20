
export interface Task {
  id: string;
  title: string;
  details?: string;
  completed: boolean;
  createdAt: number; // Using number for Date.now() timestamp
  reminderAt?: number | null; // Timestamp for the reminder
  priority?: 'high' | 'medium' | 'low' | 'none';
  category?: string;
}
