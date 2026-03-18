import { useState, useEffect } from 'react';
import { Play, Square, Plus, Trash2, Clock } from 'lucide-react';
import { Project, Task, TimeEntry, ActiveTimer } from '../types';

interface Props {
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  activeTimerEntry: ActiveTimer | null;
  startTimer: (projectId: string, taskId: string, note: string) => void;
  stopTimer: () => void;
  updateTimerNote: (note: string) => void;
  addTimeEntry: (projectId: string, taskId: string, date: string, startTime: string, endTime: string, note: string) => void;
  deleteTimeEntry: (id: string) => void;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('j�-JP', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
}

// ── Manual Entry Modal ──────────────────────────────────────────────
function ManualEntryModal({
  projects,
  tasks,
  onSave,
  onClose,
}: {
  projects: Project[];
  tasks: Task[];
  onSave: (projectId: string, taskId: string, date: string, start: string, end: string, note: string) => void;
  onClose: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '');
  const [taskId, setTaskId] = useState('');
  const [date, setDate] = useState(today);
  const [startStr, setStartStr] = useState('09:00');
  const [endStr, setEndStr] = useState('10:00');
  const [note, setNote] = useState('');

  const projectTasks = tasks.filter(t => t.projectId === projectId && !t.archived);

  useEffect(() => {
    setTaskId(projectTasks[0]?.id ?? '');
  }, [projectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !taskId) return;
    const startISO = `${date}T${startStr}:00`;
    const endISO = `${date}T${endStr}:00`;
    if (new Date(endISO) <= new Date(startISO)) {
      alert('終了時刻は開始時刻より後にしてください');
      return;
    }
    onSave(projectId, taskId, date, startISO, endISO, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">手動でぢタスク&��間を入力</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト *</label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.filter(p => !p.archived).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タスク *</label>
            <select
              value={taskId}
              onChange={e => setTaskId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- 選択 --</option>
              {projectTasks.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始</label>
              <input
                type="time"
                value={startStr}
                onChange={e => setStartStr(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終了</label>
              <input
                type="time"
                value={endStr}
                onChange={e => setEndStr(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="作業内容のメモ..."
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              キャンセル
            </button>
            <button type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function TimerPage({
  projects, tasks, timeEntries,
  activeTimerEntry,
  startTimer, stopTimer, updateTimerNote,
  addTimeEntry, deleteTimeEntry,
}: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [note, setNote] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [showManual, setShowManual] = useState(false);

  // Tick
  useEffect(() => {
    if (!activeTimerEntry) { setElapsed(0); return; }
    const tick = () => {
      const diff = Math.floor((Date.now() - new Date(activeTimerEntry.startTime).getTime()) / 1000);
      setElapsed(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeTimerEntry]);

  // Sync selected project/task when timer is running
  useEffect(() => {
    if (activeTimerEntry) {
      setSelectedProjectId(activeTimerEntry.projectId);
      setSelectedTaskId(activeTimerEntry.taskId);
    }
  }, [activeTimerEntry]);

  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId && !t.archived);
  const activeProjects = projects.filter(p => !p.archived);

  const handleStart = () => {
    if (!selectedProjectId || !selectedTaskId) {
      alert('プロジェクトとタスクを選択してください');
      return;
    }
    startTimer(selectedProjectId, selectedTaskId, note);
  };

  const handleStop = () => {
    stopTimer();
    setNote('');
  };

  // Group entries by date
  const recentEntries = [...timeEntries]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 50);

  const entriesByDate = recentEntries.reduce<Record<string, TimeEntry[]>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  const getProject = (id: string) => projects.find(p => p.id === id);
  const getTask = (id: string) => tasks.find(t => t.id === id);

  const isRunning = !!activeTimerEntry;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Timer card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h1 className="text-lg font-bold text-gray-900 mb-4">タイマー</h1>

        {/* Time display */}
        <div className={`text-center py-4 rounded-xl mb-4 ${isRunning ? 'bg-green-50' : 'bg-gray-50'}`}>
          <div className={`text-5xl font-mono font-bold tracking-wider ${isRunning ? 'text-green-700' : 'text-gray-400'}`}>
            {formatDuration(elapsed)}
          </div>
          {isRunning && (
            <p className="text-sm text-green-600 mt-1 animate-pulse">計測中...</p>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">プロジェクト</label>
              <select
                value={selectedProjectId}
                onChange={e => {
                  setSelectedProjectId(e.target.value);
                  setSelectedTaskId('');
                }}
                disabled={isRunning}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">-- 選択 --</option>
                {activeProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">タスク</label>
              <select
                value={selectedTaskId}
                onChange={e => setSelectedTaskId(e.target.value)}
                disabled={isRunning || !selectedProjectId}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">-- 選択 --</option>
                {projectTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <input
            type="text"
            value={isRunning ? activeTimerEntry!.note : note}
            onChange={e => isRunning ? updateTimerNote(e.target.value) : setNote(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="作業メモ（任意）"
          />

          <div className="flex gap-2">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <Play size={18} fill="white" />
                開始
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                <Square size={18} fill="white" />
                停止して保存
              </button>
            )}
            <button
              onClick={() => setShowManual(true)}
              disabled={isRunning}
              className="px-4 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              title="手動入力"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent entries */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">最近の記録</h2>

        {Object.keys(entriesByDate).length === 0 && (
          <div className="text-center py-10">
            <Clock size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-400 text-sm">まだ記録がありません</p>
          </div>
        )}

        {Object.entries(entriesByDate).map(([date, entries]) => {
          const dayTotal = entries.reduce((s, e) => s + e.duration, 0);
          return (
            <div key={date} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{formatDate(date)}</span>
                <span className="text-sm text-gray-500 font-mono">{formatDuration(dayTotal)}</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {entries.map(entry => {
                  const project = getProject(entry.projectId);
                  const task = getTask(entry.taskId);
                  return (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project?.color ?? '#9ca3af' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {project?.name ?? '削除済み'} / {task?.name ?? '削除済み'}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-gray-400 truncate">{entry.note}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {formatTime(entry.startTime)} – {entry.endTime ? formatTime(entry.endTime) : '...'}
                        </p>
                      </div>
                      <span className="text-sm font-mono text-gray-600 flex-shrink-0">
                        {formatDuration(entry.duration)}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('この記録を削除しますか？')) deleteTimeEntry(entry.id);
                        }}
                        className="p-1.5 text-gray-300 hover:text-red-400 rounded hover:bg-red-50 flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual entry modal */}
      {showManual && (
        <ManualEntryModal
          projects={activeProjects}
          tasks={tasks}
          onSave={addTimeEntry}
          onClose={() => setShowManual(false)}
        />
      )}
    </div>
  );
}
