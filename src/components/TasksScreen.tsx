import { useState, FormEvent, DragEvent } from 'react';
import { Task, TaskPriorityType, TaskStatusType, CustomProperty } from '../types';

interface TasksScreenProps {
  tasks: Task[];
  initialNewTaskId?: string;
  onSaveTask: (task: Task) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatusType) => void;
  onTriggerAICoach?: (prompt: string) => void;
}

const COLUMNS: { id: TaskStatusType; label: string; color: string }[] = [
  { id: 'not_started', label: 'Not Started', color: 'border-t-mist' },
  { id: 'in_progress', label: 'In Progress', color: 'border-t-orchid' },
  { id: 'completed', label: 'Completed', color: 'border-t-teal' },
];

export default function TasksScreen({
  tasks,
  initialNewTaskId,
  onSaveTask,
  onUpdateTaskStatus,
  onTriggerAICoach,
}: TasksScreenProps) {
  // Collapsible drawers
  const [showAddForm, setShowAddForm] = useState(!!initialNewTaskId);
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({});

  // Task creation states
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState<TaskPriorityType>('medium');
  const [tagsInput, setTagsInput] = useState('');
  const [customProps, setCustomProps] = useState<CustomProperty[]>([]);

  // Drag and drop events
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const handleAddCustomProp = () => {
    if (customProps.length >= 5) return;
    setCustomProps([...customProps, { key: '', value: '' }]);
  };

  const handleUpdateCustomProp = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...customProps];
    updated[index][field] = val;
    setCustomProps(updated);
  };

  const handleRemoveCustomProp = (index: number) => {
    setCustomProps(customProps.filter((_, i) => i !== index));
  };

  const handleCreateTask = (e: FormEvent) => {
    e.preventDefault();
    if (!taskName) return;

    // Filter valid custom props
    const filteredProps = customProps.filter(p => p.key.trim() !== '');

    // Parse tags
    const tags = tagsInput
      ? tagsInput.split(',').map(t => t.trim()).filter(t => t !== '')
      : [];

    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 11),
      name: taskName,
      description: taskDesc,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      priority,
      tags,
      status: 'not_started',
      customProperties: filteredProps,
      createdAt: new Date().toISOString(),
    };

    onSaveTask(newTask);

    // Reset fields
    setTaskName('');
    setTaskDesc('');
    setStartDate('');
    setEndDate('');
    setPriority('medium');
    setTagsInput('');
    setCustomProps([]);
    setShowAddForm(false);
  };

  // Drag handlers
  const handleDragStart = (id: string) => {
    setDraggingTaskId(id);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatusType) => {
    if (draggingTaskId) {
      onUpdateTaskStatus(draggingTaskId, status);
      setDraggingTaskId(null);
    }
  };

  // Deadline calculator
  const getDeadlineInfo = (endDateStr?: string) => {
    if (!endDateStr) return { label: '', colorClass: 'text-mist' };
    const end = new Date(endDateStr).getTime();
    const now = Date.now();
    const diff = end - now;

    const diffHours = diff / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 0) {
      return { label: 'Overdue', colorClass: 'text-rose border border-rose/30 bg-rose/5 px-2 py-0.5 rounded text-[10px]' };
    }
    if (diffHours < 24) {
      return { label: 'Urgent: < 24h', colorClass: 'text-rose font-bold' };
    }
    if (diffDays <= 7) {
      return { label: `Due in ${Math.ceil(diffDays)}d`, colorClass: 'text-[#E8C86A]' }; // gold
    }
    return { label: `Due ${endDateStr}`, colorClass: 'text-mist' };
  };

  const toggleColumnCollapse = (colId: string) => {
    setCollapsedColumns(prev => ({
      ...prev,
      [colId]: !prev[colId],
    }));
  };

  return (
    <div className="w-full min-h-screen relative z-10 p-4 md:p-8 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header and Toggle panel button */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="h1-font text-silver text-3xl md:text-4xl">My Tasks</h1>
            <p className="cormorant-font text-mist text-sm md:text-base mt-1">
              Command your schedule. Do not let procrastinations accumulate.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="pill-btn-gradient py-2 px-5 text-xs shadow-orchid/15 shrink-0 self-start sm:self-auto"
          >
            {showAddForm ? '✕ Close Panel' : '＋ Add Task'}
          </button>
        </div>

        {/* Collapsible Add Task Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleCreateTask} className="bg-abyss/60 border border-orchid/20 rounded-xl p-6 space-y-4 animate-fade-in max-w-2xl">
            <h3 className="fell-font text-lg text-orchid flex items-center gap-2">
              ✦ Create Task Node
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-semibold tracking-wider text-mist">Task Name *</label>
                <input
                  type="text"
                  required
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full dark-input"
                  placeholder="Task subject..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-semibold tracking-wider text-mist">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full dark-input"
                  placeholder="writing, study, logic"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-semibold tracking-wider text-mist">Description</label>
              <textarea
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full min-h-[70px] dark-input"
                placeholder="Inscribe instructions/details..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-semibold tracking-wider text-mist">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full dark-input text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-semibold tracking-wider text-mist">Deadline (End Date)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full dark-input text-xs font-mono"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-semibold tracking-wider text-mist">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriorityType)}
                  className="w-full dark-input text-xs"
                >
                  <option value="low">Low (Sage)</option>
                  <option value="medium">Medium (Gold)</option>
                  <option value="high">High (Orchid)</option>
                  <option value="critical">Critical (Rose)</option>
                </select>
              </div>
            </div>

            {/* Custom Properties (Max 5) */}
            <div className="space-y-2 border-t border-orchid/5 pt-3">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] uppercase font-semibold tracking-wider text-mist">
                  Custom Properties ({customProps.length}/5)
                </label>
                <button
                  type="button"
                  onClick={handleAddCustomProp}
                  disabled={customProps.length >= 5}
                  className="text-[10px] text-orchid hover:underline disabled:opacity-50"
                >
                  + Add Row
                </button>
              </div>

              {customProps.map((prop, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="Key (e.g. Platform)"
                    value={prop.key}
                    onChange={(e) => handleUpdateCustomProp(idx, 'key', e.target.value)}
                    className="flex-1 dark-input text-xs py-1 px-2"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Value (e.g. Web)"
                    value={prop.value}
                    onChange={(e) => handleUpdateCustomProp(idx, 'value', e.target.value)}
                    className="flex-1 dark-input text-xs py-1 px-2"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomProp(idx)}
                    className="text-rose hover:text-rose-500 font-bold p-1 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" className="pill-btn-gradient text-xs py-2 px-6">
                Spawn Task Node
              </button>
            </div>
          </form>
        )}

        {/* Kanban Board Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(col => {
            const columnTasks = tasks.filter(t => t.status === col.id);
            const isCollapsed = collapsedColumns[col.id];

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(col.id)}
                className={`flex flex-col bg-abyss/40 border border-orchid/15 rounded-xl border-t-[3px] ${col.color} transition-all duration-300 ${
                  isCollapsed ? 'md:h-12 h-auto overflow-hidden' : 'min-h-[400px]'
                }`}
              >
                {/* Column Header */}
                <div
                  onClick={() => toggleColumnCollapse(col.id)}
                  className="p-3 bg-void/30 flex items-center justify-between cursor-pointer border-b border-orchid/5 hover:bg-ghost select-none"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="h1-font text-base text-silver">{col.label}</h3>
                    <span className="text-[10px] font-mono bg-violet/20 text-orchid px-2 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  {/* Collapsible chevron toggle */}
                  <span className="text-xs text-mist font-mono">
                    {isCollapsed ? '►' : '▼'}
                  </span>
                </div>

                {/* Task List */}
                {!isCollapsed && (
                  <div className="flex-1 p-3 overflow-y-auto space-y-3">
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-center text-[11px] text-mist cormorant-font border border-dashed border-orchid/5 rounded-lg">
                        <span>✦</span>
                        <p className="mt-1">Drag task nodes here</p>
                      </div>
                    ) : (
                      columnTasks.map(task => {
                        const { label: deadlineLabel, colorClass: deadlineColor } = getDeadlineInfo(task.endDate);

                        // Priority colors
                        const priorityDot =
                          task.priority === 'low'
                            ? 'bg-[#7EC8A0]' // sage
                            : task.priority === 'medium'
                            ? 'bg-[#E8C86A]' // gold
                            : task.priority === 'high'
                            ? 'bg-[#A78BFA]' // orchid
                            : 'bg-[#E07090]'; // rose

                        // Under-24h urgent highlight
                        const isUrgent = task.priority === 'critical' || deadlineLabel.includes('< 24h');

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={() => handleDragStart(task.id)}
                            className={`p-4 bg-abyss border rounded-xl cursor-grab active:cursor-grabbing transition-all hover:border-orchid/30 relative flex flex-col justify-between select-none ${
                              isUrgent ? 'border-rose/30 shadow-lg shadow-rose/5' : 'border-orchid/10'
                            }`}
                          >
                            <div className="space-y-2">
                              {/* Name and Priority Dot */}
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-sm font-semibold text-silver leading-snug break-words">
                                  {task.name}
                                </h4>
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${priorityDot}`} title={`${task.priority} priority`} />
                              </div>

                              {/* Description */}
                              {task.description && (
                                <p className="text-xs text-mist line-clamp-2 leading-relaxed cormorant-font">
                                  {task.description}
                                </p>
                              )}

                              {/* Custom properties key value display */}
                              {task.customProperties.length > 0 && (
                                <div className="space-y-1 pt-1 border-t border-orchid/5">
                                  {task.customProperties.map((prop, idx) => (
                                    <div key={idx} className="flex justify-between text-[10px] font-mono text-mist">
                                      <span className="truncate pr-2">{prop.key}:</span>
                                      <span className="text-silver text-right truncate max-w-[120px]">{prop.value}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Tags and Deadline badge */}
                            <div className="mt-4 pt-2 border-t border-orchid/5 flex flex-wrap justify-between items-center gap-2">
                              {/* Tags */}
                              <div className="flex flex-wrap gap-1 max-w-[140px]">
                                {task.tags.map((tag, idx) => (
                                  <span key={idx} className="text-[9px] font-medium bg-void px-1.5 py-0.5 rounded text-mist">
                                    #{tag}
                                  </span>
                                ))}
                              </div>

                              {/* Deadline */}
                              {deadlineLabel && (
                                <span className={`text-[10px] font-mono leading-none ${deadlineColor}`}>
                                  {deadlineLabel}
                                </span>
                              )}
                            </div>

                            {/* AI Orchestrator Actions */}
                            <div className="mt-3 pt-2 border-t border-orchid/5 flex items-center justify-between gap-2">
                              <span className="text-[8px] font-mono text-mist/40 uppercase tracking-widest">AI Core</span>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTriggerAICoach?.(`prioritize: Please analyze and prioritize the task "${task.name}" with description "${task.description || ''}"`);
                                  }}
                                  className="text-[9px] font-mono border border-orchid/20 hover:border-orchid rounded bg-void/50 px-1.5 py-0.5 text-orchid hover:bg-orchid/10 transition-all cursor-pointer"
                                  title="Let AI analyze task priority and suggest execution steps"
                                >
                                  ✦ Prioritize
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTriggerAICoach?.(`break down: Please break down the task "${task.name}" into estimated Pomodoro subtasks and plans`);
                                  }}
                                  className="text-[9px] font-mono border border-violet/20 hover:border-violet rounded bg-void/50 px-1.5 py-0.5 text-violet hover:bg-violet/10 transition-all cursor-pointer"
                                  title="Break this task down into manageable Pomodoro steps"
                                >
                                  ✦ Break Down
                                </button>
                              </div>
                            </div>

                            {/* Status colored bottom-line */}
                            <div className={`absolute bottom-0 left-0 h-1 rounded-b-xl w-full transition-all ${
                              task.status === 'completed'
                                ? 'bg-[#5CCFBE]'
                                : task.status === 'in_progress'
                                ? 'bg-orchid'
                                : 'bg-mist/30'
                            }`} />
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
