import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';
import { Project, Task, TimeEntry, PROJECT_COLORS } from '../types';

interface Props {
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  addProject: (name: string, color: string, description: string) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (projectId: string, name: string, description: string) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

function formatHours(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

// ── Project Form Modal ──────────────────────────────────────────────
function ProjectModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<Project>;
  onSave: (name: string, color: string, description: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? PROJECT_COLORS[0]);
  const [description, setDescription] = useState(initial?.description ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), color, description.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {initial?.id ? 'プロジェクトを編集' : '新規プロジェクト'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト名 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: Webサイトリニューアル"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カラー</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'border-gray-800 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="プロジェクトの概要..."
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Task Form Modal ──────────────────────────────────────────────────
function TaskModal({
  projectId,
  initial,
  onSave,
  onClose,
}: {
  projectId: string;
  initial?: Partial<Task>;
  onSave: (projectId: string, name: string, description: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(projectId, name.trim(), description.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {initial?.id ? 'タスクを編集' : '新規タスク'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タスク名 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: トップページのデ�vイン"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="タスクの詳細..."
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              キャンセル
            </button>
            <button type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function ProjectsPage({
  projects, tasks, timeEntries,
  addProject, updateProject, deleteProject,
  addTask, updateTask, deleteTask,
}: Props) {
  const [projectModal, setProjectModal] = useState<{ open: boolean; data?: Project }>({ open: false });
  const [taskModal, setTaskModal] = useState<{ open: boolean; projectId?: string; data?: Task }>({ open: false });
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getProjectHours = (projectId: string) =>
    timeEntries.filter(e => e.projectId === projectId).reduce((s, e) => s + e.duration, 0);

  const getTaskHours = (taskId: string) =>
    timeEntries.filter(e => e.taskId === taskId).reduce((s, e) => s + e.duration, 0);

  const handleDeleteProject = (p: Project) => {
    if (confirm(`「${p.name}」を削除しますか？関連タスクと時間記録も削除されます。`)) {
      deleteProject(p.id);
    }
  };

  const handleDeleteTask = (t: Task) => {
    if (confirm(`「${t.name}」を削除しますか？`)) {
      deleteTask(t.id);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">プロジェクト</h1>
        <button
          onClick={() => setProjectModal({ open: true })}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          新規作成
        </button>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">プロジェクトがありません</p>
          <p className="text-gray-400 text-sm mt-1">「新規作成」から始めましょう</p>
        </div>
      )}

      {/* Project list */}
      <div className="space-y-3">
        {projects.filter(p => !p.archived).map(project => {
          const projectTasks = tasks.filter(t => t.projectId === project.id && !t.archived);
          const isExpanded = expandedProjects.has(project.id);
          const totalSeconds = getProjectHours(project.id);

          return (
            <div key={project.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Project row */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <button onClick={() => toggleExpand(project.id)} className="flex-shrink-0">
                  {isExpanded
                    ? <ChevronDown size={18} className="text-gray-400" />
                    : <ChevronRight size={18} className="text-gray-400" />}
                </button>
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{project.name}</p>
                  {project.description && (
                    <p className="text-xs text-gray-400 truncate">{project.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-mono">{formatHours(totalSeconds)}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {projectTasks.length}タスク
                  </span>
                  <button
                    onClick={() => setProjectModal({ open: true, data: project })}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Tasks */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  {projectTasks.length === 0 && (
                    <p className="text-sm text-gray-400 px-10 py-3">タスクがありません</p>
                  )}
                  {projectTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0">
                      <div className="w-4" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{task.name}</p>
                        {task.description && (
                          <p className="text-xs text-gray-400 truncate">{task.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-mono">{formatHours(getTaskHours(task.id))}</span>
                      <button
                        onClick={() => setTaskModal({ open: true, projectId: project.id, data: task })}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <div className="px-10 py-2">
                    <button
                      onClick={() => setTaskModal({ open: true, projectId: project.id })}
                      className="flex items-center gap-1.5 text-blue-600 text-sm hover:underline"
                    >
                      <Plus size={14} />
                      タスクを追加
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Project Modal */}
      {projectModal.open && (
        <ProjectModal
          initial={projectModal.data}
          onSave={(name, color, description) => {
            if (projectModal.data?.id) {
              updateProject(projectModal.data.id, { name, color, description });
            } else {
              const p = addProject(name, color, description);
              setExpandedProjects(prev => new Set([...prev, p.id]));
            }
          }}
          onClose={() => setProjectModal({ open: false })}
        />
      )}

      {/* Task Modal */}
      {taskModal.open && taskModal.projectId && (
        <TaskModal
          projectId={taskModal.projectId}
          initial={taskModal.data}
          onSave={(projectId, name, description) => {
            if (taskModal.data?.id) {
              updateTask(taskModal.data.id, { name, description });
            } else {
              addTask(projectId, name, description);
            }
          }}
          onClose={() => setTaskModal({ open: false })}
        />
      )}
    </div>
  );
}
