import { useState, useEffect, useRef } from 'react';

interface LapItem {
  lapNum: number;
  timeMs: number;
  formatted: string;
}

export default function TrackerScreen() {
  const [activeTab, setActiveTab] = useState<'timer' | 'stopwatch'>('timer');

  // ==========================================
  // 1. TIMER STATE
  // ==========================================
  const [hoursInput, setHoursInput] = useState('0');
  const [minsInput, setMinsInput] = useState('5');
  const [secsInput, setSecsInput] = useState('0');

  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTimeLeft, setTimerTimeLeft] = useState(0); // seconds
  const [timerTotalDuration, setTimerTotalDuration] = useState(0);

  const timerIntervalRef = useRef<number | null>(null);
  const timerExpectedTimeRef = useRef<number | null>(null);

  // Audio Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playBuzzer = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error(e);
    }
  };

  // Timer Tick delta correction
  const timerTick = () => {
    setTimerTimeLeft((prev) => {
      if (prev <= 1) {
        setTimerRunning(false);
        playBuzzer();
        return 0;
      }
      return prev - 1;
    });
  };

  useEffect(() => {
    if (timerRunning) {
      timerExpectedTimeRef.current = Date.now() + 1000;
      
      const runTimer = () => {
        const delta = Date.now() - (timerExpectedTimeRef.current || 0);
        timerTick();
        
        timerExpectedTimeRef.current = (timerExpectedTimeRef.current || 0) + 1000;
        const nextInterval = Math.max(0, 1000 - delta);
        timerIntervalRef.current = window.setTimeout(runTimer, nextInterval);
      };

      timerIntervalRef.current = window.setTimeout(runTimer, 1000);
    } else {
      if (timerIntervalRef.current) clearTimeout(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearTimeout(timerIntervalRef.current);
    };
  }, [timerRunning]);

  const handleStartTimer = () => {
    initAudio();
    if (timerRunning) {
      setTimerRunning(false);
    } else {
      let secs = parseInt(hoursInput || '0') * 3600 + parseInt(minsInput || '0') * 60 + parseInt(secsInput || '0');
      if (secs <= 0) return;

      setTimerTimeLeft(secs);
      setTimerTotalDuration(secs);
      setTimerRunning(true);
    }
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerTimeLeft(0);
    setTimerTotalDuration(0);
  };

  const applyPreset = (mins: number) => {
    setHoursInput('0');
    setMinsInput(mins.toString());
    setSecsInput('0');
    
    setTimerTimeLeft(mins * 60);
    setTimerTotalDuration(mins * 60);
    setTimerRunning(false);
  };

  // Format HH:MM:SS
  const formatTimerSeconds = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // 2. STOPWATCH STATE
  // ==========================================
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0); // Ms
  const [laps, setLaps] = useState<LapItem[]>([]);

  const stopwatchIntervalRef = useRef<number | null>(null);
  const stopwatchStartTimeRef = useRef<number>(0);

  const formatStopwatchTime = (totalMs: number) => {
    const hours = Math.floor(totalMs / 3600000);
    const mins = Math.floor((totalMs % 3600000) / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const centis = Math.floor((totalMs % 1000) / 10);

    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (stopwatchRunning) {
      stopwatchStartTimeRef.current = Date.now() - stopwatchTime;
      
      const updateStopwatch = () => {
        setStopwatchTime(Date.now() - stopwatchStartTimeRef.current);
        stopwatchIntervalRef.current = requestAnimationFrame(updateStopwatch);
      };

      stopwatchIntervalRef.current = requestAnimationFrame(updateStopwatch);
    } else {
      if (stopwatchIntervalRef.current) cancelAnimationFrame(stopwatchIntervalRef.current);
    }

    return () => {
      if (stopwatchIntervalRef.current) cancelAnimationFrame(stopwatchIntervalRef.current);
    };
  }, [stopwatchRunning]);

  const handleStartStopwatch = () => {
    initAudio();
    setStopwatchRunning(!stopwatchRunning);
  };

  const handleResetStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (stopwatchTime <= 0) return;
    const newLap: LapItem = {
      lapNum: laps.length + 1,
      timeMs: stopwatchTime,
      formatted: formatStopwatchTime(stopwatchTime),
    };
    setLaps([newLap, ...laps]);
  };

  // Analyze laps to highlight best & worst split compared to adjacent
  const getLapHighlightClass = (index: number) => {
    if (laps.length < 2) return '';
    
    // Find absolute best/worst times
    const times = laps.map(l => l.timeMs);
    const maxVal = Math.max(...times);
    const minVal = Math.min(...times);
    
    const currentMs = laps[index].timeMs;
    if (currentMs === minVal) return 'text-[#5CCFBE] font-bold'; // Teal / best split
    if (currentMs === maxVal) return 'text-rose font-bold'; // Rose / worst split
    return '';
  };

  return (
    <div className="w-full min-h-screen relative z-10 px-4 py-8 md:p-8 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Headings */}
        <div>
          <h1 className="h1-font text-silver text-3xl md:text-4xl">
            Timer & Stopwatch
          </h1>
          <p className="cormorant-font text-mist text-sm md:text-base mt-1">
            Track actions with precision. Command every interval down to the split millisecond.
          </p>
        </div>

        {/* Local switcher pills */}
        <div className="flex bg-void p-1 rounded-full border border-orchid/15 max-w-sm">
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'timer'
                ? 'bg-violet text-white shadow shadow-violet/30'
                : 'text-mist hover:text-silver'
            }`}
          >
            Count-Down Timer
          </button>
          <button
            onClick={() => setActiveTab('stopwatch')}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'stopwatch'
                ? 'bg-violet text-white shadow shadow-violet/30'
                : 'text-mist hover:text-silver'
            }`}
          >
            Stopwatch
          </button>
        </div>

        {/* 1. COUNTDOWN TIMER */}
        {activeTab === 'timer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
            
            {/* Timer visual Core panel */}
            <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-8 flex flex-col items-center justify-center space-y-6 min-h-[300px]">
              <span className="mono-font text-4xl md:text-5xl lg:text-6xl font-bold text-silver">
                {formatTimerSeconds(timerTimeLeft)}
              </span>
              
              <div className="flex gap-4">
                <button
                  onClick={handleStartTimer}
                  className="pill-btn-gradient text-xs py-2 px-6"
                >
                  {timerRunning ? 'Pause Timer' : 'Start Timer'}
                </button>
                <button
                  onClick={handleResetTimer}
                  className="p-2 border border-orchid/10 text-mist hover:text-silver rounded-full text-xs cursor-pointer px-4 font-semibold"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Input presets & customization panel */}
            <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-6 space-y-4">
              <span className="eyebrow-label block">Custom Timer Configurations</span>
              
              {/* Inputs HH:MM:SS */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-semibold text-mist">Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={hoursInput}
                    onChange={(e) => setHoursInput(e.target.value)}
                    className="w-full dark-input text-sm text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-semibold text-mist">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    value={minsInput}
                    onChange={(e) => setMinsInput(e.target.value)}
                    className="w-full dark-input text-sm text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-semibold text-mist">Seconds</label>
                  <input
                    type="number"
                    min="0"
                    value={secsInput}
                    onChange={(e) => setSecsInput(e.target.value)}
                    className="w-full dark-input text-sm text-center"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="pt-2 space-y-2">
                <label className="block text-[10px] uppercase font-semibold text-mist">Quick Presets</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[1, 5, 10, 25, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => applyPreset(mins)}
                      className="py-1.5 px-2 bg-void/50 border border-orchid/5 hover:border-orchid/20 text-xs text-silver font-medium rounded-lg cursor-pointer"
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 2. PRECISION STOPWATCH */}
        {activeTab === 'stopwatch' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
            
            {/* Stopwatch Core screen */}
            <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-8 flex flex-col items-center justify-center space-y-6">
              <span className="mono-font text-3xl md:text-4xl lg:text-5xl font-bold text-silver">
                {formatStopwatchTime(stopwatchTime)}
              </span>

              <div className="flex gap-4">
                <button
                  onClick={handleStartStopwatch}
                  className="pill-btn-gradient text-xs py-2 px-6"
                >
                  {stopwatchRunning ? 'Pause' : 'Start'}
                </button>
                
                {stopwatchRunning && (
                  <button
                    onClick={handleLap}
                    className="p-2 border border-orchid/10 text-mist hover:text-silver rounded-full text-xs cursor-pointer px-4 font-semibold"
                  >
                    Lap
                  </button>
                )}

                <button
                  onClick={handleResetStopwatch}
                  className="p-2 border border-orchid/10 text-mist hover:text-silver rounded-full text-xs cursor-pointer px-4 font-semibold"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Laps List */}
            <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-5 flex flex-col h-[320px]">
              <span className="eyebrow-label block mb-3">Laps & Split Analysis</span>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {laps.length === 0 ? (
                  <p className="cormorant-font text-xs text-mist text-center py-16">
                    ✦ No lap splits recorded yet. Track splits during running state. ✦
                  </p>
                ) : (
                  laps.map((lap, idx) => (
                    <div key={lap.lapNum} className="flex justify-between items-center text-xs py-2 border-b border-orchid/5 font-mono">
                      <span className="text-mist">Lap {lap.lapNum}</span>
                      <span className={getLapHighlightClass(idx)}>
                        {lap.formatted}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
