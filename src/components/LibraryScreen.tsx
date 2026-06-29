import { useState, useEffect } from 'react';
import { Meeting, Task, CustomPlanner } from '../types';

interface LibraryScreenProps {
  meetings: Meeting[];
  tasks: Task[];
  customPlanners: CustomPlanner[];
  onOpenItem: (screenId: string, itemId?: string) => void;
  onDeleteMeeting: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onDeletePlanner: (id: string) => void;
}

export default function LibraryScreen({
  meetings,
  tasks,
  customPlanners,
  onOpenItem,
  onDeleteMeeting,
  onDeleteTask,
  onDeletePlanner,
}: LibraryScreenProps) {
  // Two step confirmation states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Auto reset delete confirmation after 3s
  useEffect(() => {
    if (confirmDeleteId) {
      const timer = setTimeout(() => {
        setConfirmDeleteId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteId]);

  const handleConfirmDelete = (id: string, type: 'meeting' | 'task' | 'planner') => {
    if (confirmDeleteId === id) {
      // Execute delete
      if (type === 'meeting') onDeleteMeeting(id);
      else if (type === 'task') onDeleteTask(id);
      else if (type === 'planner') onDeletePlanner(id);
      setConfirmDeleteId(null);
    } else {
      // Step 1
      setConfirmDeleteId(id);
    }
  };

  // In-progress items: Uncompleted tasks & planners
  const inProgressTasks = tasks.filter(t => t.status !== 'completed');
  const inProgressPlanners = customPlanners; // Planners represent active structures

  // Completed items: Completed tasks
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="w-full min-h-screen relative z-10 px-4 py-8 md:p-8 select-none">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="h1-font text-silver text-3xl md:text-4xl">
            Library
          </h1>
          <p className="cormorant-font text-mist text-base md:text-lg mt-1">
            Everything you have created or left unfinished.
          </p>
        </div>

        {/* Collapsible Sections Container */}
        <div className="space-y-4">
          
          {/* 1. In Progress */}
          <details open className="group border border-orchid/15 bg-abyss/40 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-ghost select-none">
              <span className="fell-font text-xl text-silver group-open:text-orchid flex items-center gap-2">
                ✦ In Progress
              </span>
              <span className="text-mist group-open:rotate-180 transition-transform">
                ↓
              </span>
            </summary>
            
            <div className="p-4 pt-0 border-t border-orchid/5 space-y-2">
              {inProgressTasks.length === 0 && inProgressPlanners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-mist text-2xl mb-2">✦</span>
                  <p className="cormorant-font text-mist text-sm">
                    No tasks or planners in progress. Clear skies.
                  </p>
                </div>
              ) : (
                <>
                  {/* Tasks */}
                  {inProgressTasks.map(task => (
                    <div key={task.id} className="bg-void/40 border border-orchid/10 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 hover:border-orchid/20 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-orchid">✅</span>
                        <div>
                          <p className="text-sm font-medium text-silver">{task.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-violet/20 text-orchid">
                              Task
                            </span>
                            <span className="text-[10px] text-mist font-mono">
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onOpenItem('tasks', task.id)}
                          className="text-xs text-orchid hover:underline cursor-pointer font-medium"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => handleConfirmDelete(task.id, 'task')}
                          className={`text-xs font-medium cursor-pointer transition-colors ${
                            confirmDeleteId === task.id ? 'text-rose font-bold' : 'text-mist hover:text-rose'
                          }`}
                        >
                          {confirmDeleteId === task.id ? 'Confirm Delete' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Custom Planners */}
                  {inProgressPlanners.map(planner => (
                    <div key={planner.id} className="bg-void/40 border border-orchid/10 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 hover:border-orchid/20 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-orchid">📋</span>
                        <div>
                          <p className="text-sm font-medium text-silver">{planner.name || 'Untitled Planner'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-violet/20 text-orchid">
                              Planner
                            </span>
                            <span className="text-[10px] text-mist font-mono">
                              {planner.sections.length} Sections
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onOpenItem('planners')}
                          className="text-xs text-orchid hover:underline cursor-pointer font-medium"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => handleConfirmDelete(planner.id, 'planner')}
                          className={`text-xs font-medium cursor-pointer transition-colors ${
                            confirmDeleteId === planner.id ? 'text-rose font-bold' : 'text-mist hover:text-rose'
                          }`}
                        >
                          {confirmDeleteId === planner.id ? 'Confirm Delete' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </details>

          {/* 2. Completed */}
          <details open className="group border border-orchid/15 bg-abyss/40 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-ghost select-none">
              <span className="fell-font text-xl text-silver group-open:text-orchid flex items-center gap-2">
                ✦ Completed
              </span>
              <span className="text-mist group-open:rotate-180 transition-transform">
                ↓
              </span>
            </summary>
            
            <div className="p-4 pt-0 border-t border-orchid/5 space-y-2">
              {completedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-mist text-2xl mb-2">✦</span>
                  <p className="cormorant-font text-mist text-sm">
                    Nothing completed yet. The path is waiting.
                  </p>
                </div>
              ) : (
                completedTasks.map(task => (
                  <div key={task.id} className="bg-void/40 border border-orchid/10 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 hover:border-orchid/20 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-teal">✓</span>
                      <div>
                        <p className="text-sm font-medium text-silver line-through">{task.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-teal/10 text-teal">
                            Task Completed
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onOpenItem('tasks')}
                        className="text-xs text-orchid hover:underline cursor-pointer font-medium"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleConfirmDelete(task.id, 'task')}
                        className={`text-xs font-medium cursor-pointer transition-colors ${
                          confirmDeleteId === task.id ? 'text-rose font-bold' : 'text-mist hover:text-rose'
                        }`}
                      >
                        {confirmDeleteId === task.id ? 'Confirm Delete' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </details>

          {/* 3. Notebooks (Meetings) */}
          <details open className="group border border-orchid/15 bg-abyss/40 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-ghost select-none">
              <span className="fell-font text-xl text-silver group-open:text-orchid flex items-center gap-2">
                ✦ Notebooks
              </span>
              <span className="text-mist group-open:rotate-180 transition-transform">
                ↓
              </span>
            </summary>
            
            <div className="p-4 pt-0 border-t border-orchid/5 space-y-2">
              {meetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-mist text-2xl mb-2">✦</span>
                  <p className="cormorant-font text-mist text-sm">
                    Your notebook is empty. Create a meeting notes template to start.
                  </p>
                </div>
              ) : (
                meetings.map(meeting => (
                  <div key={meeting.id} className="bg-void/40 border border-orchid/10 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 hover:border-orchid/20 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-orchid">📓</span>
                      <div>
                        <p className="text-sm font-medium text-silver">{meeting.title}</p>
                        <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-mist">
                          <span>{meeting.date}</span>
                          <span>•</span>
                          <span>Style: {meeting.style}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onOpenItem('meetings', meeting.id)}
                        className="text-xs text-orchid hover:underline cursor-pointer font-medium"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleConfirmDelete(meeting.id, 'meeting')}
                        className={`text-xs font-medium cursor-pointer transition-colors ${
                          confirmDeleteId === meeting.id ? 'text-rose font-bold' : 'text-mist hover:text-rose'
                        }`}
                      >
                        {confirmDeleteId === meeting.id ? 'Confirm Delete' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </details>

        </div>

      </div>
    </div>
  );
}
