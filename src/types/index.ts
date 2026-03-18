export interface Project {
  id: string;
  name: string;
  color: string;
  description: string;
  createdAt: string;
  archived: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  createdAt: string;
  archived: boolean;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  taskId: string;
  date: string;          // YYYY-MM-DD
  startTime: string;     // ISO 8601
  endTime: string | null; // ISO 8601 or null if running
  duration: number;      // seconds
  note: string;
}

export type Page = 'projects' | 'timer' | 'reports';

export interface AppState {
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  activeTimerEntry: ActiveTimer | null;
}

export interface ActiveTimer {
  projectId: string;
  taskId: string;
  startTime: string; // ISO 8601
  note: string;
}

export const PROJECT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
];
