import { useState } from 'react';
import { useStore } from './store/useStore';
import { Page } from './types';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import ProjectsPage from './components/ProjectsPage';
import TimerPage from './components/TimerPage';
import ReportsPage from './components/ReportsPage';

export default function App() {
  const [page, setPage] = useState<Page>('timer');
  const store = useStore();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <Sidebar currentPage={page} onNavigate={setPage} activeTimer={store.activeTimerEntry} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-56">
        <main className="flex-1 pb-20 md:pb-0">
          {page === 'projects' && (
            <ProjectsPage
              projects={store.projects}
              tasks={store.tasks}
              timeEntries={store.timeEntries}
              addProject={store.addProject}
              updateProject={store.updateProject}
              deleteProject={store.deleteProject}
              addTask={store.addTask}
              updateTask={store.updateTask}
              deleteTask={store.deleteTask}
            />
          )}
          {page === 'timer' && (
            <TimerPage
              projects={store.projects}
              tasks={store.tasks}
              timeEntries={store.timeEntries}
              activeTimerEntry={store.activeTimerEntry}
              startTimer={store.startTimer}
              stopTimer={store.stopTimer}
              updateTimerNote={store.updateTimerNote}
              addTimeEntry={store.addTimeEntry}
              deleteTimeEntry={store.deleteTimeEntry}
            />
          )}
          {page === 'reports' && (
            <ReportsPage
              projects={store.projects}
              tasks={store.tasks}
              timeEntries={store.timeEntries}
            />
          )}
        </main>

        {/* Mobile bottom nav */}
        <BottomNav currentPage={page} onNavigate={setPage} activeTimer={store.activeTimerEntry} />
      </div>
    </div>
  );
}
