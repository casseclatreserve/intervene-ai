import { useState, FormEvent, DragEvent } from 'react';

interface MatrixTask {
  id: string;
  name: string;
  quadrant: 'q1' | 'q2' | 'q3' | 'q4';
}

interface EisenhowerScreenProps {
  matrixTasks: MatrixTask[];
  onAddMatrixTask: (name: string, quadrant: 'q1' | 'q2' | 'q3' | 'q4') => void;
  onUpdateMatrixTaskQuadrant: (id: string, quadrant: 'q1' | 'q2' | 'q3' | 'q4') => void;
  onDeleteMatrixTask: (id: string) => void;
  onTriggerAICoach?: (prompt: string) => void;
}

export default function EisenhowerScreen({
  matrixTasks,
  onAddMatrixTask,
  onUpdateMatrixTaskQuadrant,
  onDeleteMatrixTask,
  onTriggerAICoach,
}: EisenhowerScreenProps) {
  const [taskName, setTaskName] = useState('');
  const [selectedQuad, setSelectedQuad] = useState<'q1' | 'q2' | 'q3' | 'q4'>('q1');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const handleAISuggest = () => {
    if (!taskName.trim()) {
      onTriggerAICoach?.('How do I choose the correct quadrant for my task?');
      return;
    }
    const name = taskName.toLowerCase();
    let suggested: 'q1' | 'q2' | 'q3' | 'q4' = 'q2';
    
    if (name.match(/(asap|now|urgent|today|fix|broken|crisis|fail|deadline|critical|immediately)/)) {
      suggested = 'q1';
    } else if (name.match(/(learn|study|plan|strategy|review|exercise|read|future|build|design|write|practice|meditate)/)) {
      suggested = 'q2';
    } else if (name.match(/(meeting|call|sync|report|respond|email|print|request|task|chore|buy|invoice)/)) {
      suggested = 'q3';
    } else if (name.match(/(scroll|watch|play|game|browse|shop|mindless|netflix|social|tv|fluff|lazy)/)) {
      suggested = 'q4';
    }
    
    setSelectedQuad(suggested);
    onTriggerAICoach?.(`suggest placement: Where does "${taskName.trim()}" fit in the matrix?`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    onAddMatrixTask(taskName.trim(), selectedQuad);
    setTaskName('');
  };

  const handleDragStart = (id: string) => {
    setDraggingTaskId(id);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (quad: 'q1' | 'q2' | 'q3' | 'q4') => {
    if (draggingTaskId) {
      onUpdateMatrixTaskQuadrant(draggingTaskId, quad);
      setDraggingTaskId(null);
    }
  };

  // Filter tasks per quadrant
  const q1Tasks = matrixTasks.filter(t => t.quadrant === 'q1');
  const q2Tasks = matrixTasks.filter(t => t.quadrant === 'q2');
  const q3Tasks = matrixTasks.filter(t => t.quadrant === 'q3');
  const q4Tasks = matrixTasks.filter(t => t.quadrant === 'q4');

  return (
    <div className="w-full min-h-screen relative z-10 px-4 py-8 md:p-8 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Headings */}
        <div>
          <h1 className="h1-font text-silver text-3xl md:text-4xl">
            Eisenhower Matrix
          </h1>
          <p className="cormorant-font text-mist text-sm md:text-base mt-1">
            Every task belongs in exactly one quadrant. Where you spend your time is who you become.
          </p>
        </div>

        {/* Outer Grid Wrapper (Axis labels outside the 2x2 matrix) */}
        <div className="space-y-4">
          
          {/* Column labels (Important vs Not Important) */}
          <div className="hidden sm:grid grid-cols-2 text-center text-[11px] font-medium tracking-[0.1em] uppercase text-mist">
            <span>Important</span>
            <span>Not Important</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            
            {/* Left Vertical labels (Urgent vs Not Urgent) - Hidden on mobile, reformat there */}
            <div className="hidden sm:flex flex-col justify-around text-center text-[11px] font-medium tracking-[0.1em] uppercase text-mist w-8 select-none relative">
              <div className="rotate-[-90deg] whitespace-nowrap py-1">Urgent</div>
              <div className="rotate-[-90deg] whitespace-nowrap py-1">Not Urgent</div>
            </div>

            {/* Matrix 2x2 Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-orchid/10 border border-orchid/15 rounded-xl overflow-hidden min-h-[400px]">
              
              {/* Q1: Urgent + Important (Do Now) */}
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop('q1')}
                className="bg-abyss p-5 border-t-[3px] border-t-[#E07090] flex flex-col gap-3 min-h-[180px]"
              >
                <div className="flex justify-between items-center">
                  <h3 className="fell-font text-base text-[#E07090]">
                    Do Now
                  </h3>
                  <span className="sm:hidden text-[9px] font-semibold text-mist uppercase">Q1 · Urgent & Important</span>
                </div>
                
                {/* Task chips */}
                <div className="flex flex-wrap gap-2 flex-1 items-start content-start">
                  {q1Tasks.length === 0 ? (
                    <span className="text-[10px] text-mist/60 cormorant-font block py-4">✦ Quadrant empty</span>
                  ) : (
                    q1Tasks.map(task => (
                      <span
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className="bg-orchid/10 border border-orchid/5 rounded-full py-1 px-3 text-xs text-silver inline-flex items-center gap-2 cursor-grab active:cursor-grabbing hover:border-orchid/25"
                      >
                        {task.name}
                        <button
                          type="button"
                          onClick={() => onDeleteMatrixTask(task.id)}
                          className="text-mist hover:text-rose-500 font-bold shrink-0 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Q2: Not Urgent + Important (Schedule) */}
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop('q2')}
                className="bg-abyss p-5 border-t-[3px] border-t-orchid flex flex-col gap-3 min-h-[180px]"
              >
                <div className="flex justify-between items-center">
                  <h3 className="fell-font text-base text-orchid">
                    Schedule
                  </h3>
                  <span className="sm:hidden text-[9px] font-semibold text-mist uppercase">Q2 · Not Urgent & Important</span>
                </div>
                
                {/* Task chips */}
                <div className="flex flex-wrap gap-2 flex-1 items-start content-start">
                  {q2Tasks.length === 0 ? (
                    <span className="text-[10px] text-mist/60 cormorant-font block py-4">✦ Quadrant empty</span>
                  ) : (
                    q2Tasks.map(task => (
                      <span
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className="bg-orchid/10 border border-orchid/5 rounded-full py-1 px-3 text-xs text-silver inline-flex items-center gap-2 cursor-grab active:cursor-grabbing hover:border-orchid/25"
                      >
                        {task.name}
                        <button
                          type="button"
                          onClick={() => onDeleteMatrixTask(task.id)}
                          className="text-mist hover:text-rose-500 font-bold shrink-0 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Q3: Urgent + Not Important (Delegate) */}
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop('q3')}
                className="bg-abyss p-5 border-t-[3px] border-t-[#E8C86A] flex flex-col gap-3 min-h-[180px]"
              >
                <div className="flex justify-between items-center">
                  <h3 className="fell-font text-base text-[#E8C86A]">
                    Delegate
                  </h3>
                  <span className="sm:hidden text-[9px] font-semibold text-mist uppercase">Q3 · Urgent & Not Important</span>
                </div>
                
                {/* Task chips */}
                <div className="flex flex-wrap gap-2 flex-1 items-start content-start">
                  {q3Tasks.length === 0 ? (
                    <span className="text-[10px] text-mist/60 cormorant-font block py-4">✦ Quadrant empty</span>
                  ) : (
                    q3Tasks.map(task => (
                      <span
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className="bg-orchid/10 border border-orchid/5 rounded-full py-1 px-3 text-xs text-silver inline-flex items-center gap-2 cursor-grab active:cursor-grabbing hover:border-orchid/25"
                      >
                        {task.name}
                        <button
                          type="button"
                          onClick={() => onDeleteMatrixTask(task.id)}
                          className="text-mist hover:text-rose-500 font-bold shrink-0 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Q4: Neither (Eliminate) */}
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop('q4')}
                className="bg-abyss p-5 border-t-[3px] border-t-mist/50 flex flex-col gap-3 min-h-[180px]"
              >
                <div className="flex justify-between items-center">
                  <h3 className="fell-font text-base text-mist">
                    Eliminate
                  </h3>
                  <span className="sm:hidden text-[9px] font-semibold text-mist uppercase">Q4 · Neither</span>
                </div>
                
                {/* Task chips */}
                <div className="flex flex-wrap gap-2 flex-1 items-start content-start">
                  {q4Tasks.length === 0 ? (
                    <span className="text-[10px] text-mist/60 cormorant-font block py-4">✦ Quadrant empty</span>
                  ) : (
                    q4Tasks.map(task => (
                      <span
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className="bg-orchid/10 border border-orchid/5 rounded-full py-1 px-3 text-xs text-silver inline-flex items-center gap-2 cursor-grab active:cursor-grabbing hover:border-orchid/25"
                      >
                        {task.name}
                        <button
                          type="button"
                          onClick={() => onDeleteMatrixTask(task.id)}
                          className="text-mist hover:text-rose-500 font-bold shrink-0 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Below the Matrix Guidance rows (Outside grid) */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-orchid/10">
          <div className="space-y-1.5 text-xs cormorant-font text-mist">
            <p><strong>Q1 — Do Now:</strong> <span className="text-silver">Crisis.</span> Execute before anything else.</p>
            <p><strong>Q2 — Schedule:</strong> <span className="text-silver">Your future is built here.</span> Block time for deep strategy.</p>
          </div>
          <div className="space-y-1.5 text-xs cormorant-font text-mist">
            <p><strong>Q3 — Delegate:</strong> Urgent but <span className="text-silver">not yours.</span> Pass it on or automate.</p>
            <p><strong>Q4 — Eliminate:</strong> Question whether this should <span className="text-silver">exist at all.</span> Erase the fluff.</p>
          </div>
        </div>

        {/* Quick Add Bar */}
        <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-5 max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Inscribe a task subject..."
              className="w-full sm:flex-1 dark-input py-2"
            />
            
            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleAISuggest}
                className="bg-void/50 border border-orchid/30 hover:border-orchid text-orchid text-xs px-3 py-2 rounded-lg font-mono flex items-center gap-1 cursor-pointer transition-all hover:bg-orchid/10 shrink-0"
                title="AI Suggest Placement based on task name"
              >
                ✦ AI Suggest
              </button>
              <select
                value={selectedQuad}
                onChange={(e) => setSelectedQuad(e.target.value as any)}
                className="dark-input py-2 text-xs flex-1 sm:flex-none"
              >
                <option value="q1">Q1 (Do Now)</option>
                <option value="q2">Q2 (Schedule)</option>
                <option value="q3">Q3 (Delegate)</option>
                <option value="q4">Q4 (Eliminate)</option>
              </select>
              <button type="submit" className="pill-btn-gradient py-2 px-5 text-xs font-semibold shrink-0">
                Inscribe
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
