import { useState, useEffect, useRef, FormEvent } from 'react';
import { User, Meeting, Task, CustomPlanner, Habit, Alarm, MatrixTask } from './types';

// Component imports
import CosmosBg from './components/CosmosBg';
import AuthScreen from './components/AuthScreen';
import HomeScreen from './components/HomeScreen';
import LibraryScreen from './components/LibraryScreen';
import MeetingsScreen from './components/MeetingsScreen';
import TasksScreen from './components/TasksScreen';
import KaizenScreen from './components/KaizenScreen';
import PomodoroScreen from './components/PomodoroScreen';
import EisenhowerScreen from './components/EisenhowerScreen';
import FiveSecScreen from './components/FiveSecScreen';
import FiveSecOverlay from './components/FiveSecOverlay';
import BinauralScreen from './components/BinauralScreen';
import PlannersScreen from './components/PlannersScreen';
import TrackerScreen from './components/TrackerScreen';
import SettingsDrawer from './components/SettingsDrawer';

// Default initial mock states if local storage is empty
const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'm1',
    title: 'Architecture Strategy Alignment',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    location: 'Synthetics Sanctum',
    importance: 'high',
    style: 'template',
    notes: `Agenda\n──────────────\nReview core OS latency loops and lock down orbit constellation rendering assets.\n\nAction Items\n──────────────\n• Optimize starfield parallax delta loops\n• Deploy 5-Second countdown web-audio ticks\n\nDecisions\n──────────────\n• Hard-cap frame rate of orbital constellations at 60fps`,
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    name: 'Polish Goth-Dark aesthetic widgets',
    description: 'Ensure exact margins, Inter 400 headers, and zero trailing decimals on radial meters.',
    priority: 'high',
    tags: ['design', 'polish'],
    status: 'in_progress',
    customProperties: [{ key: 'Platform', value: 'Web' }],
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    name: 'Deploy Kaizen habit streak counters',
    description: 'Render flame emojis dynamically when 7+ consecutive checkmarks are verified.',
    priority: 'critical',
    tags: ['logic', 'kaizen'],
    status: 'not_started',
    customProperties: [],
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_HABITS: Habit[] = [
  { id: 'h1', name: 'Deep Work Block (90 mins)', checkedDays: [1, 2, 3, 4, 5, 6, 7] },
  { id: 'h2', name: 'No Social Media Before 5PM', checkedDays: [1, 2, 3] },
];

const INITIAL_MATRIX: MatrixTask[] = [
  { id: 'em1', name: 'Review system diagnostics logs', quadrant: 'q1' },
  { id: 'em2', name: 'Design Q3 expansion strategy', quadrant: 'q2' },
  { id: 'em3', name: 'Filter low-priority automated alerts', quadrant: 'q3' },
];

const INITIAL_ALARMS: Alarm[] = [
  {
    id: 'a1',
    label: 'Deep Work Sprint Focus',
    time: '09:00',
    prepDuration: 2,
    repeat: 'every_day',
    active: true,
  }
];

export default function App() {
  // Navigation & User
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ia_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeScreen, setActiveScreen] = useState<string>(() => {
    return localStorage.getItem('ia_active_screen') || 'home';
  });

  // Database lists
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('ia_meetings');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('ia_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('ia_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [matrixTasks, setMatrixTasks] = useState<MatrixTask[]>(() => {
    const saved = localStorage.getItem('ia_matrix');
    return saved ? JSON.parse(saved) : INITIAL_MATRIX;
  });

  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const saved = localStorage.getItem('ia_alarms');
    return saved ? JSON.parse(saved) : INITIAL_ALARMS;
  });

  const [customPlanners, setCustomPlanners] = useState<CustomPlanner[]>(() => {
    const saved = localStorage.getItem('ia_planners');
    return saved ? JSON.parse(saved) : [];
  });

  // UI States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | undefined>(undefined);
  const [initialNewTaskId, setInitialNewTaskId] = useState<string | undefined>(undefined);
  const [activeAlarmOverlay, setActiveAlarmOverlay] = useState<Alarm | null>(null);
  
  // Real Gemini API Connection state
  const [connectRealGemini, setConnectRealGemini] = useState<boolean>(() => {
    return localStorage.getItem('ia_connect_real_gemini') === 'true';
  });

  const handleToggleRealGemini = (val: boolean) => {
    setConnectRealGemini(val);
    localStorage.setItem('ia_connect_real_gemini', String(val));
    showToast(val ? 'Real Gemini API connected.' : 'Real Gemini API disconnected.');
  };

  // AI Coach Sliding Panel and Chat History State
  const [isInterveneOpen, setIsInterveneOpen] = useState(false); // Map old drawer trigger to true if needed
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachInput, setCoachInput] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachMessages, setCoachMessages] = useState<Array<{ sender: 'user' | 'coach', text: string, timestamp: string }>>(() => {
    const saved = localStorage.getItem('ia_coach_messages');
    return saved ? JSON.parse(saved) : [
      {
        sender: 'coach',
        text: '<p>I am the <strong>Intervene AI Coach</strong>. Prefrontal operating structures are synchronized.</p><p>Describe what is draining your focus, or select an AI action button around the platform. Reclaim your agency. <strong>5. 4. 3. 2. 1. Intervene.</strong></p>',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ia_coach_messages', JSON.stringify(coachMessages));
  }, [coachMessages]);

  // Custom Navigation Menu Pop-down State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toast
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Trigger Toast
  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setActiveToast(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setActiveToast(null);
    }, 3000);
  };

  // Synchronize localStorage with state updates
  useEffect(() => {
    if (user) localStorage.setItem('ia_user', JSON.stringify(user));
    else localStorage.removeItem('ia_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ia_active_screen', activeScreen);
  }, [activeScreen]);

  useEffect(() => {
    localStorage.setItem('ia_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('ia_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ia_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('ia_matrix', JSON.stringify(matrixTasks));
  }, [matrixTasks]);

  useEffect(() => {
    localStorage.setItem('ia_alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem('ia_planners', JSON.stringify(customPlanners));
  }, [customPlanners]);

  // Alarms Monitor (checks every 10 seconds for match of active alarms)
  const lastFiredRef = useRef<Record<string, string>>({}); // id -> 'HH:MM' to prevent multiple triggers in same minute

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      alarms.forEach(alarm => {
        if (alarm.active && alarm.time === currentHM) {
          const lastFiredTime = lastFiredRef.current[alarm.id];
          if (lastFiredTime !== currentHM) {
            // Trigger overlay!
            setActiveAlarmOverlay(alarm);
            lastFiredRef.current[alarm.id] = currentHM;
          }
        }
      });
    };

    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [alarms]);

  // ==========================================
  // HANDLERS FOR INDIVIDUAL MODULE ACTIONS
  // ==========================================
  const handleLoginSuccess = (newUser: User) => {
    setUser(newUser);
    setActiveScreen('home');
    showToast(`Welcome to the discipline, ${newUser.name}.`);
  };

  const handleUpdateUser = (updated: User) => {
    setUser(updated);
  };

  // Meetings
  const handleSaveMeeting = (meeting: Meeting) => {
    const exists = meetings.some(m => m.id === meeting.id);
    if (exists) {
      setMeetings(meetings.map(m => m.id === meeting.id ? meeting : m));
      showToast('Meeting notes synchronized.');
    } else {
      setMeetings([meeting, ...meetings]);
      setSelectedMeetingId(meeting.id);
      showToast('Meeting notes registered in library.');
    }
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings(meetings.filter(m => m.id !== id));
    if (selectedMeetingId === id) setSelectedMeetingId(undefined);
    showToast('Meeting archive deleted.');
  };

  // Tasks
  const handleSaveTask = (task: Task) => {
    const exists = tasks.some(t => t.id === task.id);
    if (exists) {
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      setTasks([task, ...tasks]);
      showToast('Task node spawned.');
    }
  };

  const handleUpdateTaskStatus = (id: string, status: any) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    showToast('Task status updated.');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    showToast('Task node deleted.');
  };

  // Habits
  const handleAddHabit = (name: string) => {
    const newHabit: Habit = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      checkedDays: [],
    };
    setHabits([...habits, newHabit]);
    showToast('Habit registered in Kaizen manifest.');
  };

  const handleToggleHabitDay = (habitId: string, day: number) => {
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        const isChecked = h.checkedDays.includes(day);
        const updatedDays = isChecked
          ? h.checkedDays.filter(d => d !== day)
          : [...h.checkedDays, day];
        return { ...h, checkedDays: updatedDays };
      }
      return h;
    }));
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
    showToast('Habit removed from Kaizen manifest.');
  };

  // Eisenhower Matrix Tasks
  const handleAddMatrixTask = (name: string, quadrant: any) => {
    const newTask: MatrixTask = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      quadrant,
    };
    setMatrixTasks([...matrixTasks, newTask]);
    showToast('Task logged to Eisenhower quadrant.');
  };

  const handleUpdateMatrixTaskQuadrant = (id: string, quadrant: any) => {
    setMatrixTasks(matrixTasks.map(t => t.id === id ? { ...t, quadrant } : t));
    showToast('Quadrant re-aligned.');
  };

  const handleDeleteMatrixTask = (id: string) => {
    setMatrixTasks(matrixTasks.filter(t => t.id !== id));
    showToast('Quadrant item deleted.');
  };

  // Alarms (5-Second Rule)
  const handleAddAlarm = (alarm: Alarm) => {
    setAlarms([...alarms, alarm]);
    showToast('Committal alarm set.');
  };

  const handleToggleAlarm = (id: string, active: boolean) => {
    setAlarms(alarms.map(a => a.id === id ? { ...a, active } : a));
    showToast(active ? 'Alarm activated.' : 'Alarm deactivated.');
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id));
    showToast('Alarm erased.');
  };

  // Custom Section Planners
  const handleAddCustomPlanner = (planner: CustomPlanner) => {
    setCustomPlanners([...customPlanners, planner]);
  };

  const handleDeletePlanner = (id: string) => {
    setCustomPlanners(customPlanners.filter(p => p.id !== id));
    showToast('Bespoke worksheet deleted.');
  };

  const handleImportMeetingNotes = (title: string, notes: string) => {
    const newMeeting: Meeting = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      importance: 'medium',
      style: 'blank',
      notes,
      createdAt: new Date().toISOString(),
    };
    setMeetings([newMeeting, ...meetings]);
  };

  // System management
  const handleExportData = () => {
    const backupObj = {
      meetings,
      tasks,
      habits,
      matrixTasks,
      alarms,
      customPlanners,
    };

    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `intervene_ai_backup_${Date.now()}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImportData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.meetings) setMeetings(parsed.meetings);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.habits) setHabits(parsed.habits);
      if (parsed.matrixTasks) setMatrixTasks(parsed.matrixTasks);
      if (parsed.alarms) setAlarms(parsed.alarms);
      if (parsed.customPlanners) setCustomPlanners(parsed.customPlanners);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWipeAllData = () => {
    setMeetings([]);
    setTasks([]);
    setHabits([]);
    setMatrixTasks([]);
    setAlarms([]);
    setCustomPlanners([]);
    setUser(null);
    setActiveScreen('home');
    localStorage.clear();
  };

  // Open specific library items
  const handleOpenLibraryItem = (screenId: string, itemId?: string) => {
    setActiveScreen(screenId);
    if (screenId === 'meetings' && itemId) {
      setSelectedMeetingId(itemId);
    }
    if (screenId === 'tasks' && itemId) {
      setInitialNewTaskId(itemId);
    }
  };

  // AI Coach triggering mechanisms
  const handleTriggerAICoach = async (promptText: string) => {
    setIsCoachOpen(true);
    await handleSendCoachMessage(promptText);
  };

  const handleSendCoachMessage = async (textToSend?: string) => {
    const text = textToSend || coachInput;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update history locally so the message renders instantly
    const updatedMessages = [...coachMessages, userMsg];
    setCoachMessages(updatedMessages);
    if (!textToSend) setCoachInput('');
    setCoachLoading(true);

    try {
      if (connectRealGemini) {
        const response = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages,
            tasks,
            habits,
            matrixTasks
          })
        });
        const data = await response.json();
        if (data.text) {
          setCoachMessages(prev => [...prev, {
            sender: 'coach',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          setCoachLoading(false);
          return;
        }
      }
      
      // Fallback or Simulated intelligent responses
      const lower = text.toLowerCase();
      let reply = '';

      if (lower.includes('prioritize') || lower.includes('deadline')) {
        const pending = tasks.filter(t => t.status !== 'completed');
        
        if (pending.length > 0) {
          const listHtml = pending.slice(0, 3).map(t => 
            `<li><strong>${t.title}</strong> (${t.priority || 'medium'} priority)</li>`
          ).join('');

          reply = `<p>Prefrontal prioritization engine activated. We record ${pending.length} pending tasks on your command registry.</p>
          <p>Your high-status tactical trajectory should be:</p>
          <ul style="list-style-type: decimal; padding-left: 1.25rem; margin: 0.5rem 0;">${listHtml}</ul>
          <p>Avoid task switching. Complete the first item. <strong>5. 4. 3. 2. 1. Intervene.</strong></p>`;
        } else {
          reply = `<p>The Command Board is clear of immediate tasks. This is a rare luxury. Use this window of clarity to structure your next high-value Q2 strategic ascent.</p>`;
        }
      } else if (lower.includes('break down') || lower.includes('plan')) {
        // Find a pending task to break down
        const firstPending = tasks.find(t => t.status !== 'completed');
        const taskTitle = firstPending ? firstPending.title : "your current focus vector";
        
        reply = `<p>Isolating task: <strong>"${taskTitle}"</strong>.</p>
         <p>Prefrontal chunking recommends a three-part Pomodoro trajectory to break cognitive resistance:</p>
         <ul style="list-style-type: disc; padding-left: 1.25rem; margin: 0.5rem 0;">
           <li><strong>Focus Block 1 (25 mins):</strong> Absolute isolation. Outline core structures and erase external variables.</li>
           <li><strong>Focus Block 2 (25 mins):</strong> Direct implementation. Solve the highest complexity subcomponent.</li>
           <li><strong>Focus Block 3 (25 mins):</strong> Refactoring and logging. Bring the element to perfection.</li>
         </ul>
         <p>Launch the Pomodoro timer on the Focus Ring. <strong>5. 4. 3. 2. 1. Intervene.</strong></p>`;
      } else if (lower.includes('stuck') || lower.includes('procrastinate')) {
        reply = `<p>Prefrontal friction detected. Procrastination is not a flaw of character; it is a momentary surge of limbic dread.</p>
         <p>The OS commands you to sever the loop. Count down with me now:</p>
         <p style="font-size: 1.1em; color: #C084FC; font-weight: bold; letter-spacing: 0.1em; margin: 0.5rem 0;">5. 4. 3. 2. 1. ENGAGE.</p>
         <p>Your Kaizen 1% daily ascent compounds quietly. Do not break the repetition cycle today.</p>`;
      } else {
        // General advice / response
        const completedHabits = habits.filter(h => h.checkedDays.length > 0).length;
        reply = `<p>The Intervene Operating System registers your focus request. Cognitive resources are fully synchronized.</p>
         <p>Reviewing your metrics: you have ${tasks.filter(t => t.status !== 'completed').length} pending tasks and ${habits.length} habits logged. ${completedHabits} habits are checked today.</p>
         <p>Choose one micro-repetition. Reclaim your focus. <strong>5. 4. 3. 2. 1. Intervene.</strong></p>`;
      }

      // Simulated delay
      setTimeout(() => {
        setCoachMessages(prev => [...prev, {
          sender: 'coach',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setCoachLoading(false);
      }, 700);

    } catch (err: any) {
      console.error("Coach fetch error:", err);
      setCoachMessages(prev => [...prev, {
        sender: 'coach',
        text: `<p>Failed to establish neural alignment with Gemini. Reason: ${err?.message || 'Server timeout'}</p>`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setCoachLoading(false);
    }
  };

  // If user not authenticated, show AuthScreen
  if (!user) {
    return (
      <div className="relative w-full min-h-screen bg-void text-silver">
        <CosmosBg />
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Header screen titles map
  const screenTitles: Record<string, string> = {
    home: 'Operating Core',
    library: 'Central Library',
    meetings: 'Notebook Ledger',
    tasks: 'Command Board',
    kaizen: 'Kaizen Ascents',
    pomodoro: 'Focus Ring',
    eisenhower: 'Eisenhower Matrix',
    fivesec: '5-Second Rule',
    binaural: 'Acoustic Tuning',
    planners: 'Bespoke Worksheets',
    tracker: 'Precision Timers',
  };

  return (
    <div className="relative w-full min-h-screen bg-void text-silver overflow-hidden flex flex-col">
      {/* Immersive Parallax Starfield Background */}
      <CosmosBg />

      {/* Sticky Top Header representing high-status digital governance */}
      <header className="sticky top-0 z-[8000] w-full h-16 bg-abyss/85 backdrop-blur-md border-b border-orchid/15 flex items-center justify-between px-3 sm:px-6 select-none shadow-lg shadow-black/20">
        
        {/* Left: Logo clicking takes back to Operating Core & Navigation Dropdown */}
        <div className="flex items-center gap-2 sm:gap-6">
          <div
            onClick={() => setActiveScreen('home')}
            className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group"
          >
            <span className="text-lg sm:text-xl text-orchid animate-pulse group-hover:scale-110 transition-transform">✦</span>
            <div>
              <h1 className="logo-elegant-font text-orchid text-sm sm:text-lg md:text-2xl tracking-wide select-none hidden min-[360px]:block">
                Intervene AI
              </h1>
            </div>
          </div>

          {/* Active Tab Selector Custom Pop Down - Now on the left side! */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-void border border-orchid/35 hover:border-orchid/60 text-[10px] sm:text-xs text-silver font-semibold px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg focus:outline-none flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-md shadow-black/30 transition-all uppercase tracking-wider hover:bg-violet/10"
            >
              <span className="text-orchid">☰</span>
              <span className="hidden sm:inline">
                {activeScreen === 'home' && 'Operating Core'}
                {activeScreen === 'library' && 'Library Archive'}
                {activeScreen === 'meetings' && 'Notebook Ledger'}
                {activeScreen === 'tasks' && 'Command Board'}
                {activeScreen === 'kaizen' && 'Kaizen Flow'}
                {activeScreen === 'pomodoro' && 'Focus Ring'}
                {activeScreen === 'eisenhower' && 'Eisenhower Matrix'}
                {activeScreen === 'fivesec' && '5-Second Rule'}
                {activeScreen === 'binaural' && 'Acoustic Beats'}
                {activeScreen === 'planners' && 'Bespoke Planners'}
                {activeScreen === 'tracker' && 'Precision Tracker'}
              </span>
              <span className="sm:hidden">
                {activeScreen === 'home' && 'Core'}
                {activeScreen === 'library' && 'Library'}
                {activeScreen === 'meetings' && 'Notebook'}
                {activeScreen === 'tasks' && 'Board'}
                {activeScreen === 'kaizen' && 'Kaizen'}
                {activeScreen === 'pomodoro' && 'Focus'}
                {activeScreen === 'eisenhower' && 'Matrix'}
                {activeScreen === 'fivesec' && '5s Rule'}
                {activeScreen === 'binaural' && 'Beats'}
                {activeScreen === 'planners' && 'Planners'}
                {activeScreen === 'tracker' && 'Timers'}
              </span>
              <span className="text-[8px] sm:text-[9px] text-orchid transition-transform duration-200" style={{ transform: isMenuOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
            </button>

            {isMenuOpen && (
              <>
                {/* Backdrop block for click-away behavior */}
                <div 
                  className="fixed inset-0 z-[8999]" 
                  onClick={() => setIsMenuOpen(false)} 
                />
                <div className="absolute left-0 mt-2 w-64 bg-[#050711]/95 backdrop-blur-xl border border-orchid/20 rounded-xl p-2 shadow-2xl shadow-black/90 z-[9000] animate-fade-in flex flex-col gap-0.5">
                  <div className="px-3 py-1.5 border-b border-orchid/10 text-[8px] font-mono uppercase tracking-widest text-mist mb-1">
                    System Navigation Ledger
                  </div>
                  {[
                    { id: 'home', name: 'Operating Core', index: 'CORE', emoji: '✦' },
                    { id: 'library', name: 'Library Archive', index: 'MOD 01', emoji: '📚' },
                    { id: 'meetings', name: 'Notebook Ledger', index: 'MOD 02', emoji: '🗓' },
                    { id: 'tasks', name: 'Command Board', index: 'MOD 03', emoji: '✅' },
                    { id: 'kaizen', name: 'Kaizen Flow', index: 'MOD 04', emoji: '改' },
                    { id: 'pomodoro', name: 'Focus Ring', index: 'MOD 05', emoji: '🍅' },
                    { id: 'eisenhower', name: 'Eisenhower Matrix', index: 'MOD 06', emoji: '⚡' },
                    { id: 'fivesec', name: '5-Second Rule', index: 'MOD 07', emoji: '⏱' },
                    { id: 'binaural', name: 'Acoustic Beats', index: 'MOD 08', emoji: '〰' },
                    { id: 'planners', name: 'Bespoke Planners', index: 'MOD 09', emoji: '📋' },
                    { id: 'tracker', name: 'Precision Tracker', index: 'MOD 10', emoji: '⏲' },
                  ].map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => {
                        setActiveScreen(mod.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all text-left border cursor-pointer ${
                        activeScreen === mod.id
                          ? 'bg-gradient-to-r from-violet/20 to-orchid/20 text-orchid border-orchid/30 shadow-lg shadow-orchid/5'
                          : 'text-silver border-transparent hover:bg-violet/10 hover:text-white hover:border-orchid/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm w-4 text-center">{mod.emoji}</span>
                        <span>{mod.name}</span>
                      </div>
                      <span className="text-[8px] font-mono text-mist uppercase tracking-wider">
                        {mod.index}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: user initials avatar + Settings Wheel */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-mist font-mono uppercase tracking-widest hidden md:inline-block">
            {screenTitles[activeScreen] || 'Constellation Core'}
          </span>

          {/* Initials Avatar badge */}
          <div
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 rounded-full bg-violet/30 border border-orchid/30 flex items-center justify-center text-xs font-bold text-orchid cursor-pointer hover:border-orchid/60 hover:bg-violet/40 select-none transition-all"
            title={user.name}
          >
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>

          {/* Settings Wheel button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-mist hover:text-silver text-lg leading-none cursor-pointer p-1 rounded hover:bg-ghost transition-colors"
            title="System Settings"
          >
            ⚙
          </button>
        </div>

      </header>

      {/* Main Screen Router Render Frame */}
      <main className="flex-1 w-full relative pb-20">
        
        {activeScreen === 'home' && (
          <HomeScreen
            onNavigate={(screenId) => setActiveScreen(screenId)}
            tasks={tasks}
            habits={habits}
            matrixTasks={matrixTasks}
            onTriggerAICoach={handleTriggerAICoach}
          />
        )}

        {activeScreen === 'library' && (
          <LibraryScreen
            meetings={meetings}
            tasks={tasks}
            customPlanners={customPlanners}
            onOpenItem={handleOpenLibraryItem}
            onDeleteMeeting={handleDeleteMeeting}
            onDeleteTask={handleDeleteTask}
            onDeletePlanner={handleDeletePlanner}
          />
        )}

        {activeScreen === 'meetings' && (
          <MeetingsScreen
            meetings={meetings}
            selectedMeetingId={selectedMeetingId}
            onSaveMeeting={handleSaveMeeting}
            onSelectMeetingId={setSelectedMeetingId}
            onTriggerAICoach={handleTriggerAICoach}
          />
        )}

        {activeScreen === 'tasks' && (
          <TasksScreen
            tasks={tasks}
            initialNewTaskId={initialNewTaskId}
            onSaveTask={handleSaveTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onTriggerAICoach={handleTriggerAICoach}
          />
        )}

        {activeScreen === 'kaizen' && (
          <KaizenScreen
            habits={habits}
            onAddHabit={handleAddHabit}
            onToggleHabitDay={handleToggleHabitDay}
            onDeleteHabit={handleDeleteHabit}
            onTriggerAICoach={handleTriggerAICoach}
          />
        )}

        {activeScreen === 'pomodoro' && (
          <PomodoroScreen />
        )}

        {activeScreen === 'eisenhower' && (
          <EisenhowerScreen
            matrixTasks={matrixTasks}
            onAddMatrixTask={handleAddMatrixTask}
            onUpdateMatrixTaskQuadrant={handleUpdateMatrixTaskQuadrant}
            onDeleteMatrixTask={handleDeleteMatrixTask}
            onTriggerAICoach={handleTriggerAICoach}
          />
        )}

        {activeScreen === 'fivesec' && (
          <FiveSecScreen
            alarms={alarms}
            onAddAlarm={handleAddAlarm}
            onToggleAlarm={handleToggleAlarm}
            onDeleteAlarm={handleDeleteAlarm}
            onTriggerOverlay={(al) => setActiveAlarmOverlay(al)}
          />
        )}

        {activeScreen === 'binaural' && (
          <BinauralScreen />
        )}

        {activeScreen === 'planners' && (
          <PlannersScreen
            customPlanners={customPlanners}
            onAddCustomPlanner={handleAddCustomPlanner}
            onImportMeetingNotes={handleImportMeetingNotes}
            showToast={showToast}
            onTriggerAICoach={handleTriggerAICoach}
          />
        )}

        {activeScreen === 'tracker' && (
          <TrackerScreen />
        )}

      </main>

      {/* =======================================================
          FLOATING CRYSTAL BALL ORB "INTERVENE" (LOWER-LEFT CORNER)
          ======================================================= */}
      {/* Persistent "✦ Intervene" Glowing Orchid Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-[8200] select-none">
        <button
          onClick={() => setIsCoachOpen(!isCoachOpen)}
          className="px-5 py-3 rounded-full bg-gradient-to-r from-violet via-orchid to-violet text-white border border-orchid/50 hover:border-orchid font-semibold text-xs uppercase tracking-widest cursor-pointer relative shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse"
          style={{
            boxShadow: '0 0 20px rgba(167, 139, 250, 0.7)',
            textShadow: '0 0 8px rgba(255,255,255,0.4)',
          }}
        >
          ✦ Intervene
        </button>
      </div>

      {/* Sliding AI Coach Panel (Right Side, 350px wide) */}
      {isCoachOpen && (
        <div className="fixed top-0 right-0 h-full w-[350px] bg-abyss/95 backdrop-blur-xl border-l border-orchid/20 shadow-2xl z-[8500] flex flex-col justify-between animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-orchid/15 flex justify-between items-center bg-black/25">
            <div>
              <h3 className="fell-font text-lg text-orchid tracking-wide">✦ Intervene AI Coach</h3>
              <p className="cormorant-font text-[10px] text-mist tracking-widest uppercase">Prefrontal Overlord</p>
            </div>
            <button
              onClick={() => setIsCoachOpen(false)}
              className="text-mist hover:text-silver text-xs font-mono font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-orchid/10 scrollbar-track-transparent">
            {coachMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed border ${
                    msg.sender === 'user'
                      ? 'bg-violet/10 text-silver border-violet/15 max-w-[90%]'
                      : 'bg-[#12091d]/80 text-silver/90 border-orchid/10 max-w-[90%] space-y-2'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p>{msg.text}</p>
                  ) : (
                    <div
                      className="space-y-2 text-justify select-text"
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                  )}
                </div>
                <span className="text-[8px] text-mist/60 font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            
            {coachLoading && (
              <div className="flex items-center gap-2 text-xs text-mist/80 p-2 italic-cormorant">
                <div className="w-3.5 h-3.5 border-t border-r border-orchid rounded-full animate-spin" />
                <span>Intervention algorithm calculations running...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCoachMessage();
            }}
            className="p-4 border-t border-orchid/15 bg-black/25 space-y-3"
          >
            {/* Quick action prompts for ease of use */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              <button
                type="button"
                onClick={() => handleTriggerAICoach('Prioritize my day')}
                className="text-[9px] bg-violet/10 hover:bg-violet/20 text-orchid px-2 py-1 rounded border border-orchid/10"
              >
                ✦ Prioritize
              </button>
              <button
                type="button"
                onClick={() => handleTriggerAICoach('Break down active task')}
                className="text-[9px] bg-violet/10 hover:bg-violet/20 text-orchid px-2 py-1 rounded border border-orchid/10"
              >
                ✦ Break Down
              </button>
              <button
                type="button"
                onClick={() => handleTriggerAICoach('I am stuck and procrastinating')}
                className="text-[9px] bg-violet/10 hover:bg-violet/20 text-orchid px-2 py-1 rounded border border-orchid/10"
              >
                ✦ Stuck
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder="Ask the prefrontal coach..."
                className="flex-1 dark-input text-xs py-2"
                disabled={coachLoading}
              />
              <button
                type="submit"
                className="pill-btn-rose text-[11px] px-3.5 py-2 whitespace-nowrap"
                disabled={coachLoading}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Settings Panel Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onWipeAllData={handleWipeAllData}
        showToast={showToast}
        connectRealGemini={connectRealGemini}
        onToggleRealGemini={handleToggleRealGemini}
      />

      {/* Immersive 5-Second countdown alarm overlay system */}
      {activeAlarmOverlay && (
        <FiveSecOverlay
          alarm={activeAlarmOverlay}
          onClose={() => setActiveAlarmOverlay(null)}
        />
      )}

      {/* Global Toast Notification System */}
      {activeToast && (
        <div
          className="fixed bottom-7 right-7 z-[9000] bg-abyss border border-orchid/35 rounded-xl px-5 py-3 text-xs md:text-sm text-silver shadow-2xl shadow-black/60 animate-slide-in pointer-events-none select-none max-w-sm"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-orchid">✦</span>
            <p className="font-medium">{activeToast}</p>
          </div>
        </div>
      )}

    </div>
  );
}
