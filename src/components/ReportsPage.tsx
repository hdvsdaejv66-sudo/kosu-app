import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, BarChart2, Download } from 'lucide-react';
import { Project, Task, TimeEntry } from '../types';

interface Props {
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
}

type ViewMode = 'daily' | 'weekly' | 'monthly';

function formatHM(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function isoWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDayLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });
}

function getWeekLabel(start: Date) {
  const end = addDays(start, 6);
  return `${start.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })} 〜 ${end.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}`;
}

function getMonthLabel(year: number, month: number) {
  return `${year}年${month + 1}月`;
}

// Bar chart component
function BarChartRow({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-sm text-gray-600 w-24 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 w-16 text-right flex-shrink-0">{formatHM(value)}</span>
    </div>
  );
}

export default function ReportsPage({ projects, tasks, timeEntries }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [offset, setOffset] = useState(0); // 0 = current period

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Compute date range
  const { rangeLabel, startDate, endDate, days } = useMemo(() => {
    if (viewMode === 'daily') {
      const d = addDays(today, offset);
      const s = toDateStr(d);
      return { rangeLabel: getDayLabel(s), startDate: s, endDate: s, days: [s] };
    }
    if (viewMode === 'weekly') {
      const weekStart = isoWeekStart(addDays(today, offset * 7));
      const ds = Array.from({ length: 7 }, (_, i) => toDateStr(addDays(weekStart, i)));
      return { rangeLabel: getWeekLabel(weekStart), startDate: ds[0], endDate: ds[6], days: ds };
    }
    // monthly
    const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const year = base.getFullYear();
    const month = base.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const ds = Array.from({ length: daysInMonth }, (_, i) => toDateStr(new Date(year, month, i + 1)));
    return { rangeLabel: getMonthLabel(year, month), startDate: ds[0], endDate: ds[ds.length - 1], days: ds };
  }, [viewMode, offset]);

  const filteredEntries = useMemo(
    () => timeEntries.filter(e => e.date >= startDate && e.date <= endDate),
    [timeEntries, startDate, endDate]
  );

  const totalSeconds = filteredEntries.reduce((s, e) => s + e.duration, 0);

  const byProject = useMemo(() => {
    const map: Record<string, number> = {};
    filteredEntries.forEach(e => { map[e.projectId] = (map[e.projectId] ?? 0) + e.duration; });
    return Object.entries(map).map(([id, sec]) => ({ project: projects.find(p => p.id === id), sec })).filter(x => x.project).sort((a, b) => b.sec - a.sec);
  }, [filteredEntries, projects]);

  const byTask = useMemo(() => {
    const map: Record<string, number> = {};
    filteredEntries.forEach(e => { map[e.taskId] = (map[e.taskId] ?? 0) + e.duration; });
    return Object.entries(map).map(([id, sec]) => ({ task: tasks.find(t => t.id === id), sec })).filter(x => x.task).sort((a, b) => b.sec - a.sec).slice(0, 10);
  }, [filteredEntries, tasks]);

  const byDay = useMemo(() => {
    const map: Record<string, number> = {};
    days.forEach(d => { map[d] = 0; });
    filteredEntries.forEach(e => { map[e.date] = (map[e.date] ?? 0) + e.duration; });
    return days.map(d => ({ date: d, sec: map[d] }));
  }, [filteredEntries, days]);

  const maxDaySec = Math.max(...byDay.map(d => d.sec), 1);
  const maxProjectSec = Math.max(...byProject.map(p => p.sec), 1);

  const handleExport = () => {
    const header = 'date,project,task,start,end,duration_min,note\n';
    const rows = filteredEntries.map(e => {
      const project = projects.find(p => p.id === e.projectId)?.name ?? '';
      const task = tasks.find(t => t.id === e.taskId)?.name ?? '';
      const durationMin = Math.round(e.duration / 60);
      return `${e.date},"${project}","${task}",${e.startTime},${e.endTime ?? ''},${durationMin},"${e.note}"`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kosu_${startDate}_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">レポート</h1>
        <button onClick={handleExport} className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50"><Download size={14} />CSV</button>
      </div>
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        {(['daily', 'weekly', 'monthly'] as ViewMode[]).map(m => (
          <button key={m} onClick={() => { setViewMode(m); setOffset(0); }} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{m === 'daily' ? '日次' : m === 'weekly' ? '週次' : '月次'}</button>
        ))}
      </div>
      <div className="flex items-center justify-between mb-5 bg-white rounded-xl border border-gray-200 px-4 py-3">
        <button onClick={() => setOffset(o => o - 1)} className="p-1 rounded-lg hover:bg-gray-100"><ChevronLeft size={20} className="text-gray-600" /></button>
        <span className="text-sm font-semibold text-gray-800">{rangeLabel}</span>
        <button onClick={() => setOffset(o => Math.min(o + 1, 0))} className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30" disabled={offset >= 0}><ChevronRight size={20} className="text-gray-600" /></button>
      </div>
      <div className="bg-blue-600 rounded-xl p-5 mb-4 text-white">
        <p className="text-blue-100 text-sm mb-1">合計工数</p>
        <p className="text-4xl font-bold font-mono">{formatHM(totalSeconds)}</p>
        <p className="text-blue-200 text-sm mt-1">{filteredEntries.length} 件の記録</p>
      </div>
      {filteredEntries.length === 0 ? (<div className="text-center py-12"><BarChart2 size={40} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-400">この期間の記録がありません</p></div>) : (<>
        {viewMode !== 'daily' && (<div className="bg-white rounded-xl border border-gray-200 p-4 mb-4"><h2 className="text-sm font-semibold text-gray-700 mb-3">日別工数</h2><div className="space-y-0.5">{byDay.filter(d => d.sec > 0 || viewMode === 'weekly').map(d => (<BarChartRow key={d.date} label={new Date(d.date + 'T00:00:00').toLocaleDateString('ja-JP', { month: viewMode === 'monthly' ? 'numeric' : undefined, day: 'numeric', weekday: 'short' })} value={d.sec} maxValue={maxDaySec} color="#3b82f6" />))}</div></div>)}
        {byProject.length > 0 && (<div className="bg-white rounded-xl border border-gray-200 p-4 mb-4"><h2 className="text-sm font-semibold text-gray-700 mb-3">プロジェクト別</h2><div className="space-y-0.5">{byProject.map(({ project, sec }) => (<BarChartRow key={project!.id} label={project!.name} value={sec} maxValue={maxProjectSec} color={project!.color} />))}</div></div>)}
        {byTask.length > 0 && (<div className="bg-white rounded-xl border border-gray-200 p-4 mb-4"><h2 className="text-sm font-semibold text-gray-700 mb-3">タスク別（上位10件）</h2><div className="space-y-1">{byTask.map(({ task, sec }, i) => { const project = projects.find(p => p.id === task!.projectId); return (<div key={task!.id} className="flex items-center gap-3 py-1"><span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span><div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project?.color ?? '#9ca3af' }} /><div className="flex-1 min-w-0"><p className="text-sm text-gray-800 truncate">{task!.name}</p><p className="text-xs text-gray-400 truncate">{project?.name}</p></div><span className="text-sm font-medium text-gray-700">{formatHM(sec)}</span></div>); })}</div></div>)}
      </>}
    }
    </div>
  );
}
