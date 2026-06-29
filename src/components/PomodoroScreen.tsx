import { useState, useEffect, useRef } from 'react';

interface SessionHistory {
  taskName: string;
  duration: number; // minutes
  timestamp: string;
}

export default function PomodoroScreen() {
  // Modes
  const MODES = [
    { label: 'Classic Focus', work: 25, break: 5 },
    { label: 'Deep Work', work: 50, break: 10 },
    { label: 'Ultradian Rhythm', work: 90, break: 20 },
  ];

  const [selectedModeIdx, setSelectedModeIdx] = useState(0);
  const currentMode = MODES[selectedModeIdx];

  // Timer states
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(currentMode.work * 60);
  const [totalWorkMinutes, setTotalWorkMinutes] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [history, setHistory] = useState<SessionHistory[]>([]);

  // Task integration
  const [activeTaskName, setActiveTaskName] = useState('');
  const [taskNotes, setTaskNotes] = useState('');

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Time delta refs for precision
  const expectedTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Synchronize time when mode changes
  useEffect(() => {
    setIsRunning(false);
    setIsWorkPhase(true);
    setTimeLeft(currentMode.work * 60);
  }, [selectedModeIdx, currentMode]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (isAscending: boolean) => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      const f1 = isAscending ? 660 : 880;
      const f2 = isAscending ? 880 : 660;

      osc.frequency.setValueAtTime(f1, ctx.currentTime);
      osc.frequency.setValueAtTime(f2, ctx.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.error('Web Audio failed:', e);
    }
  };

  const tick = () => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        // Phase switches
        if (isWorkPhase) {
          // Finished a focus block
          playSound(true); // ascending
          setTotalWorkMinutes(m => m + currentMode.work);
          setSessionCount(s => s + 1);
          setIsWorkPhase(false);
          
          // Save history
          setHistory(prevHist => [
            {
              taskName: activeTaskName || 'Unspecified focus task',
              duration: currentMode.work,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...prevHist.slice(0, 4),
          ]);

          return currentMode.break * 60;
        } else {
          // Finished a break block
          playSound(false); // descending
          setIsWorkPhase(true);
          return currentMode.work * 60;
        }
      }
      return prev - 1;
    });
  };

  // Setup interval with Date.now() correction
  useEffect(() => {
    if (isRunning) {
      expectedTimeRef.current = Date.now() + 1000;
      
      const runTimer = () => {
        const delta = Date.now() - (expectedTimeRef.current || 0);
        tick();
        
        expectedTimeRef.current = (expectedTimeRef.current || 0) + 1000;
        const nextInterval = Math.max(0, 1000 - delta);
        timerIntervalRef.current = window.setTimeout(runTimer, nextInterval);
      };

      timerIntervalRef.current = window.setTimeout(runTimer, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearTimeout(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearTimeout(timerIntervalRef.current);
    };
  }, [isRunning, isWorkPhase, currentMode, activeTaskName]);

  const handlePlayPause = () => {
    initAudio();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsWorkPhase(true);
    setTimeLeft(currentMode.work * 60);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (isWorkPhase) {
      setIsWorkPhase(false);
      setTimeLeft(currentMode.break * 60);
    } else {
      setIsWorkPhase(true);
      setTimeLeft(currentMode.work * 60);
    }
  };

  // Progress calculations for ring SVG
  const totalDuration = (isWorkPhase ? currentMode.work : currentMode.break) * 60;
  const progressPercent = (totalDuration - timeLeft) / totalDuration;
  const strokeDashoffset = 427 - progressPercent * 427;

  // Format time display
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full min-h-screen relative z-10 px-4 py-8 md:p-8 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Mode Selector Tabs */}
        <div className="flex bg-void p-1 rounded-full border border-orchid/15 max-w-lg mx-auto">
          {MODES.map((mode, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedModeIdx(idx)}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedModeIdx === idx
                  ? 'bg-violet text-white shadow shadow-violet/30'
                  : 'text-mist hover:text-silver'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
          
          {/* Left Side: Timer Ring */}
          <div className="flex flex-col items-center justify-center space-y-6">
            
            {/* SVG Progress Ring */}
            <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
              
              <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  className="stroke-[rgba(167,139,250,0.06)] fill-none"
                  strokeWidth="8"
                />
                
                {/* Progress Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  className={`fill-none transition-all duration-300 stroke-linecap-round ${
                    isWorkPhase ? 'stroke-orchid' : 'stroke-teal-500'
                  }`}
                  strokeWidth="8"
                  strokeDasharray="427"
                  strokeDashoffset={strokeDashoffset}
                  style={{ stroke: isWorkPhase ? 'var(--orchid)' : 'var(--teal)' }}
                />
              </svg>

              {/* Time display at center */}
              <div className="text-center z-10 space-y-1">
                <span className="mono-font text-5xl md:text-6xl font-bold text-silver">
                  {formatTime(timeLeft)}
                </span>
                <p className="fell-font text-sm text-mist uppercase tracking-widest block pt-1">
                  {isWorkPhase ? 'Focus Phase' : 'Break Phase'}
                </p>
              </div>

            </div>

            {/* Session Dots (4 session indicators) */}
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, idx) => {
                const isCompleted = idx < (sessionCount % 4);
                const isActive = isRunning && idx === (sessionCount % 4);

                return (
                  <span
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all ${
                      isCompleted
                        ? 'bg-orchid shadow shadow-orchid/30'
                        : isActive
                        ? 'bg-[#E8C86A] animate-pulse'
                        : 'border border-orchid/30'
                    }`}
                  />
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
              <button
                onClick={handleReset}
                className="p-3 bg-void/50 border border-orchid/10 text-mist hover:text-silver rounded-full cursor-pointer transition-colors"
                title="Reset Session"
              >
                ↺
              </button>
              
              <button
                onClick={handlePlayPause}
                className="p-5 bg-gradient-to-br from-violet to-amethyst text-white rounded-full cursor-pointer shadow-lg shadow-violet/30 hover:scale-105 active:scale-95 transition-all text-xl"
                title={isRunning ? 'Pause' : 'Play'}
              >
                {isRunning ? '⏸' : '▶'}
              </button>

              <button
                onClick={handleSkip}
                className="p-3 bg-void/50 border border-orchid/10 text-mist hover:text-silver rounded-full cursor-pointer transition-colors"
                title="Skip Phase"
              >
                ⏭
              </button>
            </div>

          </div>

          {/* Right Side: Task detail panel & session history */}
          <div className="space-y-6">
            
            {/* Task Card */}
            <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-5 space-y-4">
              <span className="eyebrow-label block">Active Node Engagement</span>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-semibold text-mist">Working On</label>
                  <input
                    type="text"
                    value={activeTaskName}
                    onChange={(e) => setActiveTaskName(e.target.value)}
                    className="w-full dark-input text-sm"
                    placeholder="Inscribe active task subject..."
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-semibold text-mist">Focus Notes</label>
                  <textarea
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    className="w-full dark-input text-xs min-h-[60px]"
                    placeholder="Short insights or sub-tasks..."
                  />
                </div>
              </div>

              {/* Dynamic counters */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-orchid/5 text-center">
                <div className="p-2 bg-void/30 rounded border border-orchid/5">
                  <span className="mono-font text-lg font-bold text-orchid block">{sessionCount}</span>
                  <span className="text-[10px] text-mist font-medium uppercase">Sessions Done</span>
                </div>
                <div className="p-2 bg-void/30 rounded border border-orchid/5">
                  <span className="mono-font text-lg font-bold text-mist block">{totalWorkMinutes} min</span>
                  <span className="text-[10px] text-mist font-medium uppercase">Total Focus</span>
                </div>
              </div>
            </div>

            {/* Session History panel */}
            <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-5 space-y-3">
              <span className="eyebrow-label block">Focus History</span>
              
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className="cormorant-font text-xs text-mist text-center py-6">
                    ✦ No focus blocks logged yet in this session. Maintain momentum. ✦
                  </p>
                ) : (
                  history.map((hist, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-orchid/5 last:border-b-0">
                      <span className="text-silver font-medium truncate max-w-[180px]">{hist.taskName}</span>
                      <div className="flex items-center gap-3 font-mono text-[11px] text-mist shrink-0">
                        <span>{hist.duration}m</span>
                        <span>{hist.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
