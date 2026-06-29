import { useState, useEffect, useRef, FormEvent } from 'react';
import { Alarm } from '../types';

interface FiveSecScreenProps {
  alarms: Alarm[];
  onAddAlarm: (alarm: Alarm) => void;
  onToggleAlarm: (id: string, active: boolean) => void;
  onDeleteAlarm: (id: string) => void;
  onTriggerOverlay: (alarm: Alarm) => void;
}

export default function FiveSecScreen({
  alarms,
  onAddAlarm,
  onToggleAlarm,
  onDeleteAlarm,
  onTriggerOverlay,
}: FiveSecScreenProps) {
  const [label, setLabel] = useState('');
  const [time, setTime] = useState('08:00');
  const [prepDuration, setPrepDuration] = useState<2 | 5>(2);
  const [repeat, setRepeat] = useState<'once' | 'weekdays' | 'every_day'>('once');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!time) return;

    const newAlarm: Alarm = {
      id: Math.random().toString(36).substring(2, 11),
      label: label.trim() || 'Command Action Session',
      time,
      prepDuration,
      repeat,
      active: true,
    };

    onAddAlarm(newAlarm);
    setLabel('');
  };

  return (
    <div className="w-full min-h-screen relative z-10 px-4 py-8 md:p-8 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* H1 Headings */}
        <div>
          <h1 className="h1-font text-silver text-3xl md:text-4xl">
            5-Second Rule
          </h1>
          <p className="cormorant-font text-mist text-sm md:text-base mt-1">
            Reclaim momentum. Interrupt the hesitation before self-doubt freezes you.
          </p>
        </div>

        {/* Explanation Card */}
        <div className="bg-abyss/40 border border-orchid/15 border-l-[3px] border-l-[#E07090] rounded-xl p-5 space-y-3">
          <h3 className="fell-font text-lg text-[#E07090]">The 5-Second Rule philosophy</h3>
          <div className="cormorant-font text-silver text-sm md:text-base space-y-2 leading-relaxed">
            <p>
              The moment you think about doing something important — count backwards: <strong>5, 4, 3, 2, 1</strong>. Act immediately. This countdown interrupts the hesitation gap before self-doubt takes hold.
            </p>
            <p className="text-mist text-xs md:text-sm">
              How Intervene AI uses it: Set an alarm for when you need to begin. When it fires, a preparation window opens — 2 or 5 minutes to get yourself ready. Once you declare you are ready, a full-screen countdown takes over your screen. When it reaches zero, you begin. No renegotiating. No delay.
            </p>
          </div>
        </div>

        {/* Alarm List & Creator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Creator Form */}
          <form onSubmit={handleSubmit} className="bg-abyss/40 border border-orchid/15 rounded-xl p-5 space-y-4">
            <span className="eyebrow-label block">Setup Alarm</span>
            
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-semibold text-mist">What begins at this time?</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Study, coding, writing..."
                className="w-full dark-input text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-semibold text-mist">Alarm Time</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full dark-input font-mono text-lg py-1.5"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-semibold text-mist">Repeat Pattern</label>
                <select
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value as any)}
                  className="w-full dark-input text-xs h-10"
                >
                  <option value="once">Once Only</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="every_day">Every Day</option>
                </select>
              </div>
            </div>

            {/* Preparation Window Selection */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-semibold text-mist">Preparation Window</label>
              <div className="flex gap-4">
                {[2, 5].map((mins) => (
                  <label key={mins} className="flex-1 flex items-center justify-center border border-orchid/10 bg-void/30 p-2.5 rounded-lg cursor-pointer hover:border-orchid/35">
                    <input
                      type="radio"
                      name="prepDuration"
                      checked={prepDuration === mins}
                      onChange={() => setPrepDuration(mins as any)}
                      className="accent-orchid mr-2"
                    />
                    <span className="text-xs text-silver font-medium">{mins} Minutes</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full pill-btn-rose text-xs py-2.5">
                ✦ Set Committal Alarm ✦
              </button>
            </div>
          </form>

          {/* Alarm list */}
          <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-5 space-y-4">
            <span className="eyebrow-label block">Committal Alarms</span>

            <div className="space-y-3">
              {alarms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-mist cormorant-font">
                  <span>✦</span>
                  <p className="mt-1">No active alarms in this quadrant. Set one to lock in action.</p>
                </div>
              ) : (
                alarms.map((alarm) => {
                  const repeatLabel =
                    alarm.repeat === 'once'
                      ? 'Once'
                      : alarm.repeat === 'weekdays'
                      ? 'Weekdays'
                      : 'Every Day';

                  return (
                    <div
                      key={alarm.id}
                      className={`p-4 bg-void/50 border border-orchid/10 rounded-xl flex items-center justify-between gap-4 transition-all relative overflow-hidden ${
                        alarm.active ? 'border-rose/25 shadow-lg shadow-rose/5' : ''
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        {/* Time display */}
                        <div className="flex items-baseline gap-2">
                          <span className="mono-font text-2xl font-bold text-silver leading-none">
                            {alarm.time}
                          </span>
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-rose">
                            {alarm.prepDuration}m prep
                          </span>
                        </div>
                        {/* Label */}
                        <p className="text-xs text-silver font-semibold truncate leading-none pt-1">
                          {alarm.label}
                        </p>
                        {/* Repeat */}
                        <span className="text-[10px] text-mist font-mono block">
                          Repeat: {repeatLabel}
                        </span>
                      </div>

                      {/* Toggle & delete */}
                      <div className="flex items-center gap-3">
                        {/* Toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={alarm.active}
                            onChange={(e) => onToggleAlarm(alarm.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-void rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-mist after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose peer-checked:after:bg-white border border-orchid/15" />
                        </label>

                        {/* Trigger / Test button */}
                        <button
                          onClick={() => onTriggerOverlay(alarm)}
                          className="p-1 text-[10px] bg-rose/10 text-rose border border-rose/15 rounded hover:bg-rose/20 cursor-pointer"
                          title="Trigger overlay (Test)"
                        >
                          Test
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteAlarm(alarm.id)}
                          className="text-mist hover:text-rose-500 font-bold px-1 cursor-pointer text-sm"
                          title="Delete Alarm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
