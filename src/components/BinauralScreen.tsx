import { useState, useEffect, useRef } from 'react';

interface BeatItem {
  id: string;
  name: string;
  baseHz: number;
  beatHz: number;
  category: string;
  description: string;
}

const BEATS: BeatItem[] = [
  { id: 'focus', name: 'Deep Focus', baseHz: 200, beatHz: 40, category: 'Gamma', description: 'Sharpen cognition for complex tasks. Gamma waves enhance neural binding and information processing.' },
  { id: 'flow', name: 'Flow State', baseHz: 200, beatHz: 10, category: 'Alpha', description: 'Enter relaxed alertness. The zone where creativity and precision meet.' },
  { id: 'anxiety', name: 'Anxiety Relief', baseHz: 180, beatHz: 6, category: 'Theta', description: 'Slow the spiral. Theta activates the parasympathetic system, softening the grip of stress.' },
  { id: 'memory', name: 'Memory Boost', baseHz: 220, beatHz: 14, category: 'Beta', description: 'Enhance consolidation and recall. Use during revision or after learning something new.' },
  { id: 'sleep', name: 'Deep Sleep', baseHz: 160, beatHz: 2, category: 'Delta', description: 'Delta waves accompany the deepest restorative sleep. Wind down slowly. Not for driving.' },
  { id: 'nap', name: 'Power Nap', baseHz: 180, beatHz: 4, category: 'Theta', description: 'The theta border prevents full sleep cycles while delivering genuine cognitive rest.' },
  { id: 'study', name: 'Focused Study', baseHz: 200, beatHz: 18, category: 'Beta', description: 'Mid-beta supports structured thinking and retention. Pair with Pomodoro for best results.' },
  { id: 'creativity', name: 'Creativity Boost', baseHz: 200, beatHz: 8, category: 'Alpha-Theta', description: 'The alpha-theta border is where insight lives. Return here for open creative work.' },
  { id: 'white', name: 'White Noise', baseHz: 0, beatHz: 0, category: 'Broadband', description: 'Full-spectrum noise masks environmental distraction. Consistent acoustic environment.' },
  { id: 'brown', name: 'Brown Noise', baseHz: 0, beatHz: 0, category: 'Low-Freq', description: 'Warmer and deeper than white noise. Resembles rainfall. Profoundly calming for long sessions.' },
];

export default function BinauralScreen() {
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);
  const [volume, setVolume] = useState(50); // 0 to 100

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscLeftRef = useRef<OscillatorNode | null>(null);
  const oscRightRef = useRef<OscillatorNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize Audio Context lazily
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
      
      // Setup master gain node
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
      masterGainRef.current.gain.setValueAtTime(volume / 100, audioCtxRef.current.currentTime);
    }
    
    // Resume context if suspended (browser security check)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Adjust volume dynamically
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume / 100, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // White noise generator
  const createWhiteNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  // Brown noise generator
  const createBrownNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // boost slightly
    }
    return buffer;
  };

  const stopAllAudio = () => {
    if (oscLeftRef.current) {
      try { oscLeftRef.current.stop(); } catch(e){}
      oscLeftRef.current.disconnect();
      oscLeftRef.current = null;
    }
    if (oscRightRef.current) {
      try { oscRightRef.current.stop(); } catch(e){}
      oscRightRef.current.disconnect();
      oscRightRef.current = null;
    }
    if (noiseSourceRef.current) {
      try { noiseSourceRef.current.stop(); } catch(e){}
      noiseSourceRef.current.disconnect();
      noiseSourceRef.current = null;
    }
    setActiveBeatId(null);
  };

  const startBinauralBeats = (beat: BeatItem) => {
    stopAllAudio();
    initAudio();

    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    if (beat.id === 'white' || beat.id === 'brown') {
      // Noise buffers
      const buffer = beat.id === 'white' 
        ? createWhiteNoiseBuffer(ctx) 
        : createBrownNoiseBuffer(ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(masterGain);
      source.start(0);
      noiseSourceRef.current = source;
    } else {
      // Binaural Oscillators (using Stereo Panners for left and right separation)
      const leftPan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const rightPan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      if (leftPan && rightPan) {
        leftPan.pan.setValueAtTime(-1, ctx.currentTime);
        rightPan.pan.setValueAtTime(1, ctx.currentTime);

        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(beat.baseHz, ctx.currentTime);

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(beat.baseHz + beat.beatHz, ctx.currentTime);

        oscL.connect(leftPan);
        leftPan.connect(masterGain);

        oscR.connect(rightPan);
        rightPan.connect(masterGain);

        oscL.start(0);
        oscR.start(0);

        oscLeftRef.current = oscL;
        oscRightRef.current = oscR;
      } else {
        // Fallback without stereo panners
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(beat.baseHz, ctx.currentTime);

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(beat.baseHz + beat.beatHz, ctx.currentTime);

        oscL.connect(masterGain);
        oscR.connect(masterGain);

        oscL.start(0);
        oscR.start(0);

        oscLeftRef.current = oscL;
        oscRightRef.current = oscR;
      }
    }

    setActiveBeatId(beat.id);
  };

  const handleTogglePlay = (beat: BeatItem) => {
    if (activeBeatId === beat.id) {
      stopAllAudio();
    } else {
      startBinauralBeats(beat);
    }
  };

  // Stop sound on screen unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const activeBeat = BEATS.find(b => b.id === activeBeatId);

  return (
    <div id="screen-binaural" className="w-full min-h-screen relative z-10 px-4 py-8 md:p-8 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Headings */}
        <div>
          <h1 className="h1-font text-silver text-3xl md:text-4xl">
            Binaural Beats
          </h1>
          <p className="italic-cormorant text-mist text-sm md:text-base mt-1">
            Tune your mind. Select an acoustic frequency to lock in your desired cognitive state.
          </p>
        </div>

        {/* Headphones Warning banner */}
        <p className="text-[11px] text-mist font-inter font-normal tracking-wide block pb-2">
          ✦ Best experienced with stereo headphones. Binaural integration feeds separate frequencies to each ear. ✦
        </p>

        {/* Now Playing Banner */}
        {activeBeatId && activeBeat && (
          <div className="bg-gradient-to-r from-orchid/10 to-teal/5 border border-orchid/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 animate-fade-in shadow-xl shadow-orchid/5">
            <div className="flex items-center gap-4">
              {/* 5-bar Wave Visualizer */}
              <div className="flex items-end gap-1 h-5 w-8 shrink-0 pb-1">
                <span className="w-1 bg-orchid rounded wave-bar" style={{ animationDelay: '0.1s' }} />
                <span className="w-1 bg-orchid rounded wave-bar" style={{ animationDelay: '0.4s' }} />
                <span className="w-1 bg-orchid rounded wave-bar" style={{ animationDelay: '0.2s' }} />
                <span className="w-1 bg-orchid rounded wave-bar" style={{ animationDelay: '0.5s' }} />
                <span className="w-1 bg-orchid rounded wave-bar" style={{ animationDelay: '0.3s' }} />
              </div>

              <div>
                <h4 className="italic-fell text-lg text-orchid leading-none">
                  Playing: {activeBeat.name}
                </h4>
                <span className="text-[10px] font-mono text-mist uppercase tracking-wider block mt-1">
                  Category: {activeBeat.category} {activeBeat.baseHz > 0 && `· ${activeBeat.baseHz}Hz + ${activeBeat.beatHz}Hz`}
                </span>
              </div>
            </div>

            {/* Volume & Stop */}
            <div className="flex items-center gap-5 w-full sm:w-auto">
              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                <span className="text-xs text-mist">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24 md:w-32 accent-orchid h-1 bg-void/50 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button
                onClick={stopAllAudio}
                className="pill-btn-rose py-1.5 px-4 text-xs shrink-0 cursor-pointer"
              >
                Stop Beat
              </button>
            </div>
          </div>
        )}

        {/* Beats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BEATS.map((beat) => {
            const isPlaying = activeBeatId === beat.id;

            return (
              <div
                key={beat.id}
                onClick={() => handleTogglePlay(beat)}
                className={`glass-card p-5 cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-4 ${
                  isPlaying ? 'border-orchid/45 shadow-lg shadow-orchid/10' : 'border-orchid/15'
                }`}
              >
                {/* Active shimmer edge */}
                {isPlaying && (
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orchid to-transparent animate-shimmer" style={{ animationDuration: '2s' }} />
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`italic-fell text-lg transition-colors ${
                      isPlaying ? 'text-orchid' : 'text-silver'
                    }`}>
                      {beat.name}
                    </h3>
                    <span className="font-mono text-[10px] text-orchid bg-orchid/10 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      {beat.category}
                    </span>
                  </div>

                  <p className="italic-cormorant text-xs text-mist leading-relaxed">
                    {beat.description}
                  </p>
                </div>

                {/* Card footer control */}
                <div className="flex justify-between items-center pt-2 border-t border-orchid/5">
                  <span className="font-mono text-[10px] text-mist">
                    {beat.baseHz > 0 ? `${beat.beatHz} Hz Beat` : 'Constant Noise'}
                  </span>
                  
                  <span className="text-xs text-orchid font-medium hover:underline">
                    {isPlaying ? '✕ Stop' : '▶ Listen'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
