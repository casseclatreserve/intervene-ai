import { useState, useEffect, useRef } from 'react';
import { Alarm } from '../types';

interface FiveSecOverlayProps {
  alarm: Alarm;
  onClose: () => void;
}

type ActType = 'act1_prep' | 'act2_ready' | 'act3_countdown';

export default function FiveSecOverlay({ alarm, onClose }: FiveSecOverlayProps) {
  const [act, setAct] = useState<ActType>('act1_prep');
  
  // Act 1: Preparation Timer
  const [prepTimeLeft, setPrepTimeLeft] = useState(alarm.prepDuration * 60);
  
  // Act 3: Countdown Number
  const [countdownNum, setCountdownNum] = useState<string | number>(5);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context lazily
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  // Play audio tick at specified frequency
  const playTick = (freq: number, duration: number, gainVal: number) => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gainNode.gain.setValueAtTime(gainVal, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error('Audio failed:', e);
    }
  };

  // Act 1: Prep count down
  useEffect(() => {
    if (act !== 'act1_prep') return;

    const timer = setInterval(() => {
      setPrepTimeLeft(prev => {
        if (prev <= 1) {
          // Time expired, advance to Act 2
          setAct('act2_ready');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [act]);

  // Act 3: Immersive 5-second countdown sequencing
  useEffect(() => {
    if (act !== 'act3_countdown') return;

    let currentCount = 5;
    setCountdownNum(5);
    playTick(600, 0.15, 0.25); // initial tick

    const interval = setInterval(() => {
      currentCount--;
      if (currentCount > 0) {
        setCountdownNum(currentCount);
        playTick(600, 0.15, 0.25); // tick sound
      } else if (currentCount === 0) {
        setCountdownNum('GO!');
        playTick(1200, 0.4, 0.35); // blast sound
      } else {
        clearInterval(interval);
        
        // After GO! has shown for 1400ms, trigger fade-out and close
        setTimeout(() => {
          onClose();
        }, 1400);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [act, onClose]);

  // Helper to format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-[#000000] z-[9999] flex flex-col items-center justify-center text-center p-6 select-none font-sans overflow-hidden">
      
      {/* ACT 1: PREPARATION TIMER */}
      {act === 'act1_prep' && (
        <div className="max-w-xl space-y-8 animate-fade-in">
          {/* Ringing Bell Emoji (Rotating animation is handled via CSS in index.css) */}
          <div className="text-8xl select-none animate-bell-ring origin-top inline-block" role="img" aria-label="Ringing bell">
            🔔
          </div>

          <div className="space-y-2">
            <h1 className="logo-font text-rose text-4xl md:text-5xl lg:text-6xl tracking-widest glow-text-rose uppercase">
              TIME TO BEGIN
            </h1>
            <p className="text-sm md:text-base text-silver uppercase tracking-widest max-w-sm mx-auto font-semibold">
              {alarm.label}
            </p>
          </div>

          <div className="space-y-2 py-4 bg-void/50 border border-orchid/5 rounded-2xl p-6">
            <span className="eyebrow-label block">Preparation Window Counting Down</span>
            <span className="mono-font text-5xl md:text-6xl font-bold text-silver block">
              {formatTime(prepTimeLeft)}
            </span>
            <p className="cormorant-font text-mist text-xs md:text-sm">
              Arrange your environment. Position your focus. Zero distractions.
            </p>
          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
            <button
              onClick={() => { initAudio(); setAct('act2_ready'); }}
              className="pill-btn-rose text-sm py-3 px-8 w-64 shadow-lg shadow-rose/25"
            >
              I Am Ready →
            </button>
            <p className="cormorant-font text-mist text-xs">
              ✦ Clicking ready skips the remaining preparation window ✦
            </p>
          </div>
        </div>
      )}

      {/* ACT 2: READY PROMPT */}
      {act === 'act2_ready' && (
        <div className="max-w-xl space-y-8 animate-fade-in">
          <div className="space-y-3">
            <h1 className="logo-font text-silver text-4xl md:text-5xl lg:text-6xl tracking-widest uppercase">
              Are you ready?
            </h1>
            <p className="cormorant-font text-mist text-base md:text-lg max-w-sm mx-auto leading-relaxed">
              The moment you tap below, there is no going back. The timeline locks in.
            </p>
          </div>

          {/* Large ready button with bounce animation */}
          <div className="py-12">
            <button
              onClick={() => { initAudio(); setAct('act3_countdown'); }}
              className="pill-btn-gradient text-lg font-bold py-4 px-12 w-72 rounded-full shadow-2xl shadow-orchid/30 animate-bounce cursor-pointer active:scale-95"
            >
              BEGIN ↑
            </button>
          </div>

          <p className="cormorant-font text-mist text-xs uppercase tracking-widest">
            ✦ NO HESITATION. ✦
          </p>
        </div>
      )}

      {/* ACT 3: COUNTDOWN EXECUTION */}
      {act === 'act3_countdown' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
          {/* Animated Purple background rising sheet */}
          <div className="absolute bottom-0 left-0 w-full bg-[#1b0a33]/85 transition-all duration-[5000ms] ease-out z-0 h-full" />

          {/* Massive Countdown Number */}
          <div className="relative z-10 select-none animate-pulse-slow">
            <span
              key={countdownNum}
              className={`mono-font text-[140px] md:text-[180px] lg:text-[240px] font-bold block leading-none transition-all scale-100 ${
                countdownNum === 'GO!'
                  ? 'text-rose glow-text-rose'
                  : 'text-silver'
              }`}
            >
              {countdownNum}
            </span>
          </div>

          {countdownNum === 'GO!' && (
            <p className="relative z-10 cormorant-font text-orchid text-lg uppercase tracking-widest mt-6 animate-pulse select-none">
              ✦ Commence active focus immediately ✦
            </p>
          )}
        </div>
      )}

    </div>
  );
}
