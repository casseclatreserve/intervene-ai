import { useState, FormEvent } from 'react';
import { Habit } from '../types';

interface KaizenScreenProps {
  habits: Habit[];
  onAddHabit: (name: string) => void;
  onToggleHabitDay: (habitId: string, day: number) => void;
  onDeleteHabit: (id: string) => void;
  onTriggerAICoach?: (prompt: string) => void;
}

export default function KaizenScreen({
  habits,
  onAddHabit,
  onToggleHabitDay,
  onDeleteHabit,
  onTriggerAICoach,
}: KaizenScreenProps) {
  const [newHabitName, setNewHabitName] = useState('');
  
  const KAIZEN_HABITS = [
    'No Phone First 30 Min',
    'Deep Breathing (5 Min)',
    'Read 5 Pages of Non-fiction',
    'Inscribe 3 Gratitudes',
    'Zero Sugar After 6 PM',
    'Plan Next Day in Matrix',
    'Stand Every 50 Mins',
    'Drink 1L Water Upon Waking',
    'Plank Exercise (2 Min)',
    'No Screens After 10 PM'
  ];

  const handleSuggestHabit = () => {
    // Select one that isn't already registered, if possible
    const existingNames = habits.map(h => h.name.toLowerCase());
    const candidates = KAIZEN_HABITS.filter(h => !existingNames.includes(h.toLowerCase()));
    const pool = candidates.length > 0 ? candidates : KAIZEN_HABITS;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    
    setNewHabitName(selected);
    onTriggerAICoach?.(`kaizen habit: Why is "${selected}" recommended as a 1% continuous improvement habit?`);
  };
  
  // Track selected month/year
  const [currentYear] = useState(new Date().getFullYear());
  const [currentMonth] = useState(new Date().getMonth()); // 0-11

  // Month metadata
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    onAddHabit(newHabitName.trim());
    setNewHabitName('');
  };

  // Helper to compute consecutive checked streaks
  const calculateStreak = (checkedDays: number[]): number => {
    if (checkedDays.length === 0) return 0;
    const sorted = [...checkedDays].sort((a, b) => b - a); // descending
    
    let streak = 0;
    let expected = sorted[0];

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] === expected) {
        streak++;
        expected--;
      } else {
        break;
      }
    }
    return streak;
  };

  // Check total completion rate
  const totalCells = habits.length * daysInMonth;
  const totalChecked = habits.reduce((acc, h) => acc + h.checkedDays.length, 0);
  const completionPercentage = totalCells > 0 ? Math.round((totalChecked / totalCells) * 100) : 0;

  return (
    <div className="w-full min-h-screen relative z-10 px-4 py-8 md:p-8 select-none">
      
      {/* Background Override elements style */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet/5 via-void to-[#05060D] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Section 1 - Philosophy (Top centered banner) */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4 px-2">
          {/* Kanji */}
          <span className="font-jp text-[56px] sm:text-[80px] md:text-[96px] text-orchid leading-none glow-text-orchid">
            改善
          </span>
          <h1 className="logo-font text-xl md:text-3xl tracking-[0.15em] text-silver uppercase mt-1">
            KAIZEN FLOW
          </h1>
          <p className="cormorant-font text-silver text-sm md:text-lg leading-relaxed px-1">
            Kaizen (改善) is the Japanese philosophy of continuous improvement — not revolution, but evolution. The principle is simple: improve by 1% each day. Over 365 days, that single percent becomes 37 times your starting point. Kaizen asks not how do I change everything, but what is the single smallest next step.
          </p>
          
          {/* Compound formula */}
          <div className="font-mono text-[11px] md:text-sm text-[#E8C86A] tracking-wider md:tracking-widest bg-void/50 border border-orchid/5 rounded-xl sm:rounded-full px-4 py-2.5 sm:px-5 sm:py-2 mt-4 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-6">
            <span>1.01³⁶⁵ = 37.78 ×</span>
            <span className="text-mist hidden sm:inline">·</span>
            <span className="text-rose">0.99³⁶⁵ = 0.03 ×</span>
          </div>
        </div>

        {/* Section 2 - Add Habit Form */}
        <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-5 max-w-lg mx-auto flex flex-col gap-3">
          <form onSubmit={handleAddSubmit} className="flex gap-2 w-full">
            <input
              type="text"
              required
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Inscribe a new daily habit..."
              className="flex-1 dark-input py-2"
            />
            <button type="submit" className="pill-btn-gradient py-2 px-4 text-xs shrink-0">
              Add Habit
            </button>
          </form>
          <button
            type="button"
            onClick={handleSuggestHabit}
            className="w-full text-center py-2 border border-dashed border-orchid/30 hover:border-orchid text-orchid hover:bg-orchid/10 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Let AI suggest a highly optimized 1% daily micro-habit"
          >
            ✦ AI Suggest Next 1% Improvement
          </button>
        </div>

        {/* Section 3 - Monthly Habit Cards (HabitKit Style) */}
        <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-5 space-y-6">
          
          {/* Month Indicator */}
          <div className="flex justify-between items-center pb-3 border-b border-orchid/5">
            <h3 className="fell-font text-lg text-silver flex items-center gap-2">
              <span>✦</span> Habit Manifest
            </h3>
            <span className="font-mono text-sm text-orchid uppercase tracking-wider">
              {monthNames[currentMonth]} {currentYear}
            </span>
          </div>

          {habits.length === 0 ? (
            <div className="py-16 text-center text-xs text-mist cormorant-font border border-dashed border-orchid/10 rounded-xl bg-void/20">
              ✦ No habits registered. Spawn one above to begin your 1% compound ascent. ✦
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map(habit => {
                const streakCount = calculateStreak(habit.checkedDays);
                const isLongStreak = streakCount >= 7;
                
                // Calendar calculations for current month
                const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
                // Adjust so Monday is 0, Sunday is 6
                const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
                
                // Days checked this month
                const checkedThisMonth = habit.checkedDays.length;
                const habitProgressPercent = daysInMonth > 0 ? Math.round((checkedThisMonth / daysInMonth) * 100) : 0;

                const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

                return (
                  <div 
                    key={habit.id} 
                    className={`bg-[#070914]/90 border rounded-xl p-4 flex flex-col justify-between gap-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-orchid/40 ${
                      isLongStreak 
                        ? 'border-[#E8C86A]/40 shadow-[#E8C86A]/5' 
                        : 'border-orchid/10'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start gap-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => onDeleteHabit(habit.id)}
                          className="text-mist hover:text-rose hover:bg-rose/10 transition-all cursor-pointer p-1 rounded text-xs font-bold shrink-0 w-6 h-6 flex items-center justify-center border border-transparent hover:border-rose/20"
                          title="Remove habit"
                        >
                          ✕
                        </button>
                        <h4 className="logo-font text-white text-xs sm:text-sm truncate uppercase tracking-wider" title={habit.name}>
                          {habit.name}
                        </h4>
                      </div>
                      
                      {/* Streak badge */}
                      <span className={`shrink-0 font-mono text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isLongStreak 
                          ? 'bg-[#E8C86A]/15 text-[#E8C86A] border border-[#E8C86A]/25 animate-pulse' 
                          : 'bg-orchid/10 text-orchid border border-orchid/20'
                      }`} title="Consecutive checked streak">
                        🔥 {streakCount}d
                      </span>
                    </div>

                    {/* Habit Calendar Grid */}
                    <div className="space-y-2 pt-1 border-t border-orchid/5">
                      {/* Weekday indicator labels */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {weekdays.map((day, idx) => (
                          <div key={idx} className="text-[9px] font-mono font-bold text-mist/30 uppercase tracking-widest">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Day matrix container */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {/* Start offset placeholders */}
                        {Array.from({ length: startOffset }).map((_, idx) => (
                          <div 
                            key={`offset-${idx}`} 
                            className="aspect-square w-full max-w-[28px] mx-auto rounded-md bg-void/10 border border-transparent"
                          />
                        ))}

                        {/* Interactive days */}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                          const dayNum = idx + 1;
                          const isChecked = habit.checkedDays.includes(dayNum);

                          return (
                            <button
                              key={dayNum}
                              type="button"
                              onClick={() => onToggleHabitDay(habit.id, dayNum)}
                              className={`aspect-square w-full max-w-[28px] mx-auto rounded-md flex items-center justify-center cursor-pointer border transition-all text-[8px] font-mono ${
                                isChecked
                                  ? 'bg-orchid border-orchid text-void font-bold shadow-md shadow-orchid/20 hover:scale-105'
                                  : 'bg-void/50 border-orchid/10 text-mist/40 hover:border-orchid/35 hover:text-silver'
                              }`}
                              title={`${monthNames[currentMonth]} ${dayNum} - ${isChecked ? 'Completed' : 'Pending'}`}
                            >
                              {dayNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card Footer: Progress tracker */}
                    <div className="pt-2.5 border-t border-orchid/5 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[9px] font-mono text-mist/60 uppercase tracking-wider">
                        <span>Month Progress</span>
                        <span>{checkedThisMonth} / {daysInMonth} days ({habitProgressPercent}%)</span>
                      </div>
                      <div className="w-full bg-void h-1 rounded-full overflow-hidden border border-orchid/5">
                        <div 
                          className="bg-gradient-to-r from-violet to-orchid h-full transition-all duration-300" 
                          style={{ width: `${habitProgressPercent}%` }}
                        />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Month progress summary */}
          {habits.length > 0 && (
            <div className="pt-5 border-t border-orchid/5 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-mist">
                <span>Total Workspace Ascent Progress</span>
                <span className="text-[#E8C86A]">{completionPercentage}% of target achieved</span>
              </div>
              <div className="w-full bg-void h-1.5 rounded-full overflow-hidden border border-orchid/5">
                <div
                  className="bg-gradient-to-r from-violet via-orchid to-[#E8C86A] h-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
