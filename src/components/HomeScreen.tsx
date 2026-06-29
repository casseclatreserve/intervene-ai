import { useEffect, useRef, useState, MouseEvent, TouchEvent } from 'react';

interface FeatureItem {
  id: string;
  name: string;
  emoji: string;
  index: string;
  description: string;
  colorHex: string;
  colorRgb: { r: number; g: number; b: number };
}

const FEATURES: FeatureItem[] = [
  {
    id: 'library',
    name: 'Library Archive',
    emoji: '📚',
    index: 'MODULE 01',
    description: 'Vault of registered logs, custom planners, and workspace assets.',
    colorHex: '#C084FC', // Amethyst
    colorRgb: { r: 192, g: 132, b: 252 },
  },
  {
    id: 'meetings',
    name: 'Notebook Ledger',
    emoji: '🗓',
    index: 'MODULE 02',
    description: 'Distraction-free meeting journals, Cornell logs, and structural ledgers.',
    colorHex: '#7B5EA7', // Violet
    colorRgb: { r: 123, g: 94, b: 167 },
  },
  {
    id: 'tasks',
    name: 'Command Board',
    emoji: '✅',
    index: 'MODULE 03',
    description: 'High-status kanban board with customizable property schemas.',
    colorHex: '#5CCFBE', // Cyan
    colorRgb: { r: 92, g: 207, b: 190 },
  },
  {
    id: 'kaizen',
    name: 'Kaizen Flow',
    emoji: '改',
    index: 'MODULE 04',
    description: 'Daily habit climber with automatic consecutive checkmark streaks.',
    colorHex: '#E07090', // Rose
    colorRgb: { r: 224, g: 112, b: 144 },
  },
  {
    id: 'pomodoro',
    name: 'Focus Ring',
    emoji: '🍅',
    index: 'MODULE 05',
    description: 'Dual-phase concentration sprint cycles guided by acoustic resonance.',
    colorHex: '#7EC8A0', // Emerald/Sage
    colorRgb: { r: 126, g: 200, b: 160 },
  },
  {
    id: 'eisenhower',
    name: 'Eisenhower Matrix',
    emoji: '⚡',
    index: 'MODULE 06',
    description: 'Prioritize urgent crises from high-leverage strategic ascents.',
    colorHex: '#E8C86A', // Gold
    colorRgb: { r: 232, g: 200, b: 106 },
  },
  {
    id: 'fivesec',
    name: '5-Second Rule',
    emoji: '⏱',
    index: 'MODULE 07',
    description: 'Committal alerts counting down to immediate tactical action.',
    colorHex: '#C8CCDE', // Silver
    colorRgb: { r: 200, g: 204, b: 222 },
  },
  {
    id: 'binaural',
    name: 'Acoustic Beats',
    emoji: '〰',
    index: 'MODULE 08',
    description: 'Dual-frequency neural oscillations to trigger deep flow states.',
    colorHex: '#A78BFA', // Orchid
    colorRgb: { r: 167, g: 139, b: 250 },
  },
  {
    id: 'planners',
    name: 'Bespoke Planners',
    emoji: '📋',
    index: 'MODULE 09',
    description: 'Modular spreadsheets, expense matrices, and customized forms.',
    colorHex: '#C8CCDE', // Silver
    colorRgb: { r: 200, g: 204, b: 222 },
  },
  {
    id: 'tracker',
    name: 'Precision Tracker',
    emoji: '⏲',
    index: 'MODULE 10',
    description: 'Split-millisecond stopwatch lap records and interval count-downs.',
    colorHex: '#7A7F9A', // Mist
    colorRgb: { r: 122, g: 127, b: 154 },
  },
];

interface HomeScreenProps {
  onNavigate: (screenId: string) => void;
  tasks?: any[];
  habits?: any[];
  matrixTasks?: any[];
  onTriggerAICoach?: (prompt: string) => void;
}

export default function HomeScreen({
  onNavigate,
  tasks = [],
  habits = [],
  matrixTasks = [],
  onTriggerAICoach,
}: HomeScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Layout Dimensions and Sizing
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Continuous rotational angle around vertical axis (cylinder Y-rotation)
  const [rotationAngle, setRotationAngle] = useState(0);
  const targetAngleRef = useRef(0);
  const currentAngleRef = useRef(0);

  // Drag Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartAngle = useRef(0);
  const isHoveredRef = useRef(false);

  const [activeInsightIndex, setActiveInsightIndex] = useState(0);

  // Auto refresh rotating cards every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveInsightIndex(prev => (prev + 1) % 3);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const getAIInsights = () => {
    // Stat 1: Pending Tasks
    const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
    const criticalTasks = tasks.filter(t => t.priority === 'critical' || t.priority === 'high');
    const q1Count = matrixTasks.filter(m => m.quadrant === 'q1').length;
    
    // Stat 2: Habits Completion
    const totalHabits = habits.length;

    const insights = [
      {
        title: "✦ FOCUS MATRIX REALITY",
        content: q1Count > 0 
          ? `System isolated ${q1Count} tasks in the Urgent/Important quadrant (Q1). The prefrontal containment engine suggests tackling "${matrixTasks.find(m => m.quadrant === 'q1')?.name || 'Do Now items'}" immediately before energy depletion occurs.`
          : pendingTasksCount > 0 
          ? `System records ${pendingTasksCount} pending task units on the Command Board. We advise invoking the 5-Second Rule on "${tasks.find(t => t.status !== 'completed')?.name || 'your primary task'}" to break friction.`
          : "Focus Matrix is empty of immediate crisis. Use this luxury of time to schedule Q2 Strategic Planning units — this is where future ascents compound.",
        actionLabel: "✦ Force Prioritize",
        prompt: "analyze priority for current tasks"
      },
      {
        title: "✦ KAIZEN STEADY RISE",
        content: totalHabits > 0 
          ? `Currently tracking ${totalHabits} daily repetitional habits. Continuous 1% progress compounds quietly. Remember: 1.01³⁶⁵ = 37.78. Do not break the repetition cycle today.`
          : "Zero habit structures registered in the manifest. Continuous ascent requires small, unyielding repetitional loops. Register a 1% micro-habit to begin.",
        actionLabel: "✦ Suggest Habit",
        prompt: "suggest next 1% habit"
      },
      {
        title: "✦ STRATEGIC LOAD ISOLATION",
        content: criticalTasks.length > 0 
          ? `CHRONOS ALERT: You have ${criticalTasks.length} critical / high-priority task nodes active. System advises immediate delegation (Q3) of administrative tasks to protect focal reserve.`
          : "System detects optimal cognitive bandwidth. Your operational structure is clean. Engage deep focal sessions now.",
        actionLabel: "✦ Mobilize Focus",
        prompt: "how to maximize focus right now"
      }
    ];

    return insights;
  };

  // Sync window size
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Geometry dimensions of the vertical helical cylinder
  const radiusX = isMobile ? 120 : 340;
  const radiusZ = isMobile ? 100 : 280;
  const spacingY = isMobile ? 65 : 120; // Height step per radian of helix

  // Find which card is currently closest to the front (theta closest to 0 mod 2PI)
  let closestIndex = 0;
  let maxZ = -Infinity;

  FEATURES.forEach((_, i) => {
    const angleStep = (2 * Math.PI) / 10;
    const theta = (i * angleStep) + rotationAngle;
    
    // Wrap theta to [-PI, PI] to calculate relative positions
    let relativeAngle = ((theta + Math.PI) % (Math.PI * 2));
    if (relativeAngle < 0) relativeAngle += Math.PI * 2;
    relativeAngle -= Math.PI;

    const z = Math.cos(relativeAngle) * radiusZ;
    if (z > maxZ) {
      maxZ = z;
      closestIndex = i;
    }
  });

  const activeFeature = FEATURES[closestIndex];

  // Drag and touch controls - vertical drag spins the helix
  const handleStart = (clientY: number) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    dragStartAngle.current = targetAngleRef.current;
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    const deltaY = clientY - dragStartY.current;
    const height = containerRef.current?.getBoundingClientRect().height || 600;
    // Dragging down rotates the helix forward/upward, dragging up rotates it backward/downward
    const angleDelta = (deltaY / height) * Math.PI * 2;
    targetAngleRef.current = dragStartAngle.current + angleDelta;
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel scroll controls - scrolls spin the helix up/down
  const handleWheel = (e: any) => {
    // Spin the cylinder
    targetAngleRef.current += e.deltaY * 0.0018;
  };

  const handlePrev = () => {
    targetAngleRef.current += (2 * Math.PI) / 10;
  };

  const handleNext = () => {
    targetAngleRef.current -= (2 * Math.PI) / 10;
  };

  const handleCardClick = (index: number, id: string) => {
    if (index === closestIndex) {
      // If it is already focused in front, click to engage/navigate
      onNavigate(id);
    } else {
      // Shortest rotation to bring selected card to front
      const currentTarget = targetAngleRef.current;
      const desiredAngle = -index * (2 * Math.PI) / 10;
      const diff = ((desiredAngle - currentTarget + Math.PI) % (Math.PI * 2)) - Math.PI;
      targetAngleRef.current = currentTarget + (diff < -Math.PI ? diff + Math.PI * 2 : diff);
    }
  };

  // Continuous physics interpolation (Lerp) for ultra-smooth scrolling
  useEffect(() => {
    let animId: number;
    const updateAngles = () => {
      // Passive drift if user is not active
      if (!isDragging && !isHoveredRef.current) {
        targetAngleRef.current -= 0.0012;
      }
      currentAngleRef.current += (targetAngleRef.current - currentAngleRef.current) * 0.12;
      setRotationAngle(currentAngleRef.current);
      animId = requestAnimationFrame(updateAngles);
    };
    animId = requestAnimationFrame(updateAngles);
    return () => cancelAnimationFrame(animId);
  }, [isDragging]);

  // Canvas Core Vortex Spiral logic (vertical swirling loop as in Claude video)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: {
      y: number;
      baseAngle: number;
      speed: number;
      radius: number;
      phase: number;
      size: number;
    }[] = [];

    const initParticles = () => {
      particles = [];
      const particleCount = 300;
      for (let i = 0; i < particleCount; i++) {
        // Vertical dispersion stack
        const y = -180 + (i / particleCount) * 360;
        const baseAngle = (i * 0.16) % (Math.PI * 2);
        const speed = 0.005 + Math.random() * 0.005;
        // Hourglass shape for central magnetic core look
        const radius = 35 + Math.pow(Math.abs(y) / 150, 2) * 35;
        const phase = Math.random() * Math.PI * 2;
        const size = 0.7 + Math.random() * 1.3;

        particles.push({ y, baseAngle, speed, radius, phase, size });
      }
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initParticles();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Constant tilts for extreme 3D effect
    const tiltX = 0.22;
    const tiltY = -0.05;

    const draw = (time: number) => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Color from the currently active foreground feature card
      const activeColor = activeFeature ? activeFeature.colorRgb : { r: 167, g: 139, b: 250 };

      // 1. Swirling portal light central deep glow aura
      const radialGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 110
      );
      radialGlow.addColorStop(0, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.15)`);
      radialGlow.addColorStop(0.5, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.05)`);
      radialGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw 3D Ring Guides around the vortex core
      const ringHeights = [-80, 0, 80];
      ringHeights.forEach((ringY, ringIdx) => {
        const ringRadius = 60 + Math.sin(time * 0.0008 + ringIdx * 1.5) * 4;
        ctx.strokeStyle = `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, ${0.16 - Math.abs(ringY) * 0.0005})`;
        ctx.lineWidth = 1.0;
        ctx.setLineDash([4, 6]);

        ctx.beginPath();
        const points = 50;
        for (let j = 0; j <= points; j++) {
          const angle = (j / points) * Math.PI * 2 + (time * 0.00015 * (ringIdx % 2 === 0 ? 1 : -1));
          
          let px = Math.cos(angle) * ringRadius;
          let pz = Math.sin(angle) * ringRadius;
          let py = ringY;

          // Rotate X
          const cosX = Math.cos(tiltX);
          const sinX = Math.sin(tiltX);
          const y1 = py * cosX - pz * sinX;
          const z1 = pz * cosX + py * sinX;

          // Rotate Y
          const cosY = Math.cos(tiltY);
          const sinY = Math.sin(tiltY);
          const x2 = px * cosY - z1 * sinY;
          const z2 = z1 * cosY + px * sinY;

          // Projection
          const fov = 350;
          const scale = fov / (fov + z2);
          const projX = centerX + x2 * scale;
          const projY = centerY + y1 * scale;

          if (j === 0) {
            ctx.moveTo(projX, projY);
          } else {
            ctx.lineTo(projX, projY);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 3. Render Helix Core Particles
      particles.forEach((p) => {
        const currentAngle = p.baseAngle + time * p.speed;
        
        const wave = Math.sin(time * 0.0016 + p.y * 0.02) * 8;
        let px = Math.cos(currentAngle) * p.radius + wave;
        let pz = Math.sin(currentAngle) * p.radius;
        let py = p.y + Math.cos(time * 0.001 + currentAngle) * 5;

        // Rotate X
        const cosX = Math.cos(tiltX);
        const sinX = Math.sin(tiltX);
        const y1 = py * cosX - pz * sinX;
        const z1 = pz * cosX + py * sinX;

        // Rotate Y
        const cosY = Math.cos(tiltY);
        const sinY = Math.sin(tiltY);
        const x2 = px * cosY - z1 * sinY;
        const z2 = z1 * cosY + px * sinY;

        // Project
        const fov = 350;
        const scale = fov / (fov + Math.max(-120, z2));
        const projX = centerX + x2 * scale;
        const projY = centerY + y1 * scale;

        const zFactor = (z2 + 120) / 240; 
        const intensity = Math.max(0.1, 1 - zFactor);
        
        const r = Math.round(activeColor.r * intensity + 20 * zFactor);
        const g = Math.round(activeColor.g * intensity + 12 * zFactor);
        const b = Math.round(activeColor.b * intensity + 55 * zFactor);
        const alpha = (0.22 + intensity * 0.78) * Math.min(1, scale);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.75})`;
        ctx.beginPath();
        const drawSize = p.size * scale * (intensity > 0.65 ? 1.2 : 0.85);
        ctx.arc(projX, projY, Math.max(0.3, drawSize), 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Center intense fusion core glow
      const beamGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 20
      );
      beamGlow.addColorStop(0, '#ffffff');
      beamGlow.addColorStop(0.35, `rgba(${activeColor.r}, ${activeColor.g}, ${activeColor.b}, 0.95)`);
      beamGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = beamGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [activeFeature]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen relative z-10 px-4 py-8 md:py-12 select-none flex flex-col justify-between items-center"
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        handleEnd();
      }}
      onWheel={handleWheel}
      onTouchStart={(e) => handleStart(e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientY)}
      onMouseMove={(e) => handleMove(e.clientY)}
      onMouseUp={handleEnd}
    >
      {/* Operating system header text */}
      <div className="text-center space-y-2.5 max-w-2xl mb-4 md:mb-6 animate-fade-in pointer-events-none">
        <span className="mono-font text-[9px] uppercase tracking-[0.25em] text-orchid bg-violet/15 border border-orchid/20 px-3 py-1 rounded-full glow-text-orchid">
          ✦ Spiral Constellation Core ✦
        </span>
        <h1 className="logo-elegant-font text-white text-3xl md:text-5xl lg:text-6xl tracking-widest leading-none">
          Intervene OS
        </h1>
        <p className="cormorant-font text-mist text-xs md:text-sm italic-cormorant leading-relaxed max-w-md mx-auto">
          "Drag vertically, scroll, or hover to rotate the 3D helical cylinder around the central portal loop. Click any module card to focus or launch."
        </p>
      </div>

      {/* 3D Helix Cylindrical Orbit Stage */}
      <div className="w-full relative flex items-center justify-center min-h-[440px] md:min-h-[580px] overflow-visible my-auto">
        
        {/* Central Core Spiral Canvas (At depth z=0, sitting exactly between background and foreground cards) */}
        <div className="absolute w-[240px] h-[240px] md:w-[360px] md:h-[360px] pointer-events-none z-[300] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full block"
          />
          {/* Subtle revolving background concentric ring geometries */}
          <div className="absolute w-[180px] h-[180px] rounded-full border border-orchid/5 bg-void/5 animate-spin-slow-reverse" />
          <div className="absolute w-[110px] h-[110px] rounded-full border border-orchid/10 animate-spin-slow" />
        </div>

        {/* Orbiting Feature Cards arranged mathematically in a Helix Spiral */}
        {FEATURES.map((f, i) => {
          const angleStep = (2 * Math.PI) / 10;
          const theta = (i * angleStep) + rotationAngle;
          
          // Wrap theta to [-PI, PI] for perfect infinite scrolling and centering
          let relativeAngle = ((theta + Math.PI) % (Math.PI * 2));
          if (relativeAngle < 0) relativeAngle += Math.PI * 2;
          relativeAngle -= Math.PI;

          // Coordinates on the 3D Cylinder
          const x = Math.sin(relativeAngle) * radiusX;
          const z = Math.cos(relativeAngle) * radiusZ;
          
          // Helical vertical displacement (helical staircase):
          // As relativeAngle climbs from -PI to PI, the Y coordinate ranges smoothly.
          // This keeps the currently active card (relativeAngle ≈ 0) perfectly centered at Y = 0!
          const y = relativeAngle * spacingY;

          // Depth-based calculations
          const normalizedZ = (z + radiusZ) / (2 * radiusZ); // Range 0 (furthest back) to 1 (closest front)
          const scale = isMobile ? (0.45 + normalizedZ * 0.35) : (0.6 + normalizedZ * 0.4);
          const opacity = 0.12 + normalizedZ * 0.88;
          
          // Map depth to appropriate zIndex layers relative to the central canvas at z=300
          // Background cards (z < 0) range from zIndex 100 to 290
          // Foreground cards (z >= 0) range from zIndex 310 to 500
          const zIndex = z >= 0 
            ? Math.round(310 + normalizedZ * 190)
            : Math.round(100 + normalizedZ * 190);

          const isActive = i === closestIndex;

          // Card Y-tilt rotation to face the viewer beautifully
          const rotateY = relativeAngle * 40; // In degrees

          return (
            <div
              key={f.id}
              onClick={() => handleCardClick(i, f.id)}
              className="absolute cursor-pointer transition-all duration-150 select-none"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex,
                opacity,
              }}
            >
              <div
                className={`rounded-xl p-4 md:p-5 w-[150px] md:w-[220px] transition-all duration-300 ${
                  isActive
                    ? 'bg-[#090b1c]/95 border-2 border-orchid shadow-lg shadow-orchid/25 shadow-[-4px_6px_30px_rgba(0,0,0,0.9)]'
                    : 'bg-[#03050d]/80 hover:bg-[#060813]/90 border border-orchid/15 hover:border-orchid/40 shadow-md shadow-black/60'
                }`}
              >
                {/* Module index & small status indicator */}
                <div className="flex justify-between items-center mb-2">
                  <span className="mono-font text-[8px] text-mist tracking-wider">
                    {f.index}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orchid animate-pulse" />
                    )}
                    <span className="text-xs md:text-sm">{f.emoji}</span>
                  </div>
                </div>

                {/* Module Title */}
                <h3
                  className="logo-font text-white text-[11px] md:text-sm tracking-wider uppercase mb-1"
                  style={{
                    textShadow: isActive ? `0 0 10px rgba(${f.colorRgb.r}, ${f.colorRgb.g}, ${f.colorRgb.b}, 0.6)` : 'none'
                  }}
                >
                  {f.name}
                </h3>

                <p className="cormorant-font text-mist text-[9px] md:text-[11px] leading-relaxed line-clamp-2 md:line-clamp-3">
                  {f.description}
                </p>

                {isActive && (
                  <div className="mt-2.5 flex justify-between items-center text-[8px] md:text-[9px] mono-font uppercase text-orchid tracking-widest font-semibold border-t border-orchid/20 pt-2">
                    <span>ENTER MODE</span>
                    <span>✦ SEQUENCE ✦</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Navigation arrow margins left/right */}
        <button
          onClick={handlePrev}
          className="absolute left-2 md:left-8 z-[800] bg-void/85 hover:bg-void border border-orchid/35 hover:border-orchid text-orchid text-sm md:text-lg w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-xl shadow-black/55 cursor-pointer transition-all active:scale-95"
          title="Helix Scroll Up"
        >
          ▲
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 md:right-8 z-[800] bg-void/85 hover:bg-void border border-orchid/35 hover:border-orchid text-orchid text-sm md:text-lg w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-xl shadow-black/55 cursor-pointer transition-all active:scale-95"
          title="Helix Scroll Down"
        >
          ▼
        </button>
      </div>

      {/* Standard status display cockpit HUD */}
      <div className="w-full max-w-xl bg-abyss/85 backdrop-blur-md border border-orchid/20 rounded-xl p-5 md:p-6 text-center shadow-2xl relative z-[1000] animate-fade-in">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <span className="text-lg md:text-xl">{activeFeature.emoji}</span>
          <h2 className="logo-font text-white text-sm md:text-lg uppercase tracking-widest">
            {activeFeature.name}
          </h2>
          <span className="mono-font text-[9px] px-2 py-0.5 rounded bg-violet/20 border border-orchid/15 text-orchid">
            {activeFeature.index}
          </span>
        </div>

        <p className="cormorant-font text-mist text-xs md:text-sm italic-cormorant max-w-md mx-auto mb-4 leading-relaxed">
          {activeFeature.description}
        </p>

        <button
          onClick={() => onNavigate(activeFeature.id)}
          className="w-full sm:w-auto px-8 py-2.5 text-xs font-semibold mono-font uppercase tracking-widest rounded-lg bg-gradient-to-r from-violet to-orchid hover:from-orchid hover:to-violet text-white border border-orchid/40 shadow-lg shadow-orchid/20 cursor-pointer hover:scale-102 transition-all active:scale-98"
          style={{
            boxShadow: `0 8px 24px -6px rgba(${activeFeature.colorRgb.r}, ${activeFeature.colorRgb.g}, ${activeFeature.colorRgb.b}, 0.4)`
          }}
        >
          ✦ ENGAGE SEQUENCE ✦
        </button>

        <div className="mt-4 flex justify-between items-center text-[8px] mono-font text-mist uppercase tracking-widest border-t border-orchid/10 pt-3">
          <span>SYSTEM DIAGNOSTIC: READY</span>
          <span>SPIN FORCE: ACTIVE HELIX</span>
        </div>
      </div>

      {/* AI Operations Insights rotating cards */}
      <div className="w-full max-w-xl mt-6 space-y-3 animate-fade-in relative z-[1000]">
        <div className="flex justify-between items-center px-1">
          <span className="logo-font text-[10px] text-silver uppercase tracking-wider">
            ✦ AI Operations Insights
          </span>
          <span className="text-[9px] text-orchid font-mono animate-pulse">
            ● INTERVENE CORE SYNCHRONIZED
          </span>
        </div>

        <div className="grid grid-cols-1">
          {getAIInsights().map((insight, idx) => {
            const isCurrent = idx === activeInsightIndex;
            if (!isCurrent) return null;

            return (
              <div
                key={idx}
                className="bg-[#090b1c]/80 backdrop-blur border border-orchid/30 rounded-xl p-5 shadow-2xl relative overflow-hidden transition-all duration-500"
              >
                {/* Visual accent line */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-violet via-orchid to-transparent" />
                
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-mono font-bold text-orchid tracking-widest uppercase block mb-1">
                      {insight.title}
                    </span>
                    <p className="cormorant-font text-xs md:text-sm text-silver leading-relaxed">
                      {insight.content}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-orchid/10 flex justify-between items-center">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        onClick={() => setActiveInsightIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${
                          i === activeInsightIndex ? 'bg-orchid w-4' : 'bg-orchid/20 hover:bg-orchid/40'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => onTriggerAICoach?.(insight.prompt)}
                    className="text-[9px] font-mono text-orchid hover:text-white border border-orchid/20 hover:border-orchid px-2.5 py-1 rounded-md bg-void/50 hover:bg-orchid/10 transition-all cursor-pointer"
                  >
                    {insight.actionLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
