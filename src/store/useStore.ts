import { useState, useEffect, useCallback } from 'react';
import { Project, Task, TimeEntry, ActiveTimer, AppState } from '../types';

const STORAGE_KEY = 'kosu-app-data';

const defaultState: AppState = {
  projects: [],
  tasks: [],
  timeEntries: [],
  activeTimerEntry: null,
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useStore() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // ── Projects ────────────────────────────────────────
  const addProject = useCallback((name: string, color: string, description: string) => {
    const project: Project = {
      id: generateId(),
      name,
      color,
      description,
      createdAt: new Date().toISOString(),
      archived: false,
    };
    setState(s => ({ ...s, projects: [...s.projects, project] }));
    return project;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setState(s => ({
      ...s,
      projects: s.projects.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setState(s => ({
      ...s,
      projects: s.projects.filter(p => p.id !== id),
      tasks: s.tasks.filter(t => t.projectId !== id),
      timeEntries: s.timeEntries.filter(e => e.projectId !== id),
    }));
  }, []);

  // ── Tasks ────────────────────────────────────────────
  const addTask = useCallback((projectId: string, name: string, description: string) => {
    const task: Task = {
      id: generateId(),
      projectId,
      name,
      description,
      createdAt: new Date().toISOString(),
      archived: false,
    };
    setState(s => ({ ...s, tasks: [...s.tasks, task] }));
    return task;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState(s => ({
      ...s,
      tasks: s.tasks.filter(t => t.id !== id),
      timeEntries: s.timeEntries.filter(e => e.taskId !== id),
    }));
  }, []);

  // ── Timer ─────────────────────────────────────────────
  const startTimer = useCallback((projectId: string, taskId: string, note: string) => {
    const timer: ActiveTimer = {
      projectId,
      taskId,
      startTime: new Date().toISOString(),
      note,
    };
    setState(s => ({ ...s, activeTimerEntry: timer }));
  }, []);

  const stopTimer = useCallback(() => {
    setState(s => {
      if (!s.activeTimerEntry) return s;
      const now = new Date();
      const start = new Date(s.activeTimerEntry.startTime);
      const duration = Math.floor((now.getTime() - start.getTime()) / 1000);
      const entry: TimeEntry = {
        id: generateId(),
        projectId: s.activeTimerEntry.projectId,
        taskId: s.activeTimerEntry.taskId,
        date: now.toISOString().slice(0, 10),
        startTime: s.activeTimerEntry.startTime,
        endTime: now.toISOString(),
        duration,
        note: s.activeTimerEntry.note,
      };
      return {
        ...s,
        timeEntries: [...s.timeEntries, entry],
        activeTimerEntry: null,
      };
    });
  }, []);

  const updateTimerNote = useCallback((note: string) => {
    setState(s => s.activeTimerEntry
      ? { ...s, activeTimerEntry: { ...s.activeTimerEntry, note } }
      : s
    );
  }, []);

  // ── Manual Time Entry ────────────────────────────────
  const addTimeEntry = useCallback((
    projectId: string,
    taskId: string,
    date: string,
    startTime: string,
    endTime: string,
    note: string
  ) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
    const entry: TimeEntry = {
      id: generateId(),
      projectId,
      taskId,
      date,
      startTime,
      endTime,
      duration,
      note,
    };
    setState(s => ({ ...s, timeEntries: [...s.timeEntries, entry] }));
  }, []);

  const deleteTimeEntry = useCallback((id: string) => {
    setState(s => ({
      ...s,
      timeEntries: s.timeEntries.filter(e => e.id !== id),
    }));
  }, []);

  return {
    ...state,
    addProject, updateProject, deleteProject,
    addTask, updateTask, deleteTask,
    startTimer, stopTimer, updateTimerNote,
    addTimeEntry, deleteTimeEntry,
  };
}
