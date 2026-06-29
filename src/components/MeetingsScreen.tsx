import { useState, useEffect, FormEvent } from 'react';
import { Meeting, ImportanceType, MeetingStyleType } from '../types';

interface MeetingsScreenProps {
  meetings: Meeting[];
  selectedMeetingId?: string;
  onSaveMeeting: (meeting: Meeting) => void;
  onSelectMeetingId: (id: string | undefined) => void;
  onTriggerAICoach?: (prompt: string) => void;
}

const TEMPLATE_TEXT = `Agenda
──────────────


Action Items
──────────────


Decisions
──────────────


Follow-ups
──────────────
`;

export default function MeetingsScreen({
  meetings,
  selectedMeetingId,
  onSaveMeeting,
  onSelectMeetingId,
  onTriggerAICoach,
}: MeetingsScreenProps) {
  const [activeMeeting, setActiveMeeting] = useState<Partial<Meeting>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    location: '',
    importance: 'medium',
    style: 'blank',
    notes: '',
  });

  const handleAIGenerateNotes = () => {
    const title = activeMeeting.title || 'Strategic Alignment Sync';
    const agendaText = `✦ AI GENERATED AGENDA & PLAN FOR: ${title.toUpperCase()}
────────────────────────
Date: ${activeMeeting.date || new Date().toISOString().split('T')[0]} | Time: ${activeMeeting.time || '12:00'}
Importance: ${activeMeeting.importance?.toUpperCase() || 'MEDIUM'}

1. Core Objective
──────────────
Establish unified focus on "${title}" and resolve strategic bottlenecks blocking immediate 1% execution.

2. Discussion Agendas & Time Blocks
──────────────
• [00:00 - 00:10] Current State Assessment: Review historic task logs and performance metrics.
• [00:10 - 00:25] Bottleneck Isolation: Identify where procrastination and technical debt accumulate.
• [00:25 - 00:40] Tactical Interventions: Brainstorm high-impact actions and assign direct ownership.
• [00:40 - 00:50] Alignment & Commitment: Confirm immediate Q1/Q2 task integrations.

3. Action Items
──────────────
• [ ] Action Item 1: Refactor core modules based on suggested priorities.
• [ ] Action Item 2: Synchronize habit tracking matrices with new Kaizen metrics.
• [ ] Action Item 3: Establish 5-Second focus protocols for critical project tasks.

4. Projected Decisions
──────────────
• Isolation level for upcoming sprints set to strict prefrontal focus.
• Low-value administrative overhead to be delegated (Q3) or eliminated (Q4) entirely.
`;

    setActiveMeeting(prev => ({ ...prev, notes: agendaText }));
    onTriggerAICoach?.(`meeting plan: Generate a strategic agenda and plan for a meeting titled "${title}"`);
  };

  // Sync state when selected ID changes
  useEffect(() => {
    if (selectedMeetingId) {
      const found = meetings.find(m => m.id === selectedMeetingId);
      if (found) {
        setActiveMeeting(found);
      }
    } else {
      setActiveMeeting({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        location: '',
        importance: 'medium',
        style: 'blank',
        notes: '',
      });
    }
  }, [selectedMeetingId, meetings]);

  const handleCreateNew = () => {
    onSelectMeetingId(undefined);
    setActiveMeeting({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      location: '',
      importance: 'medium',
      style: 'blank',
      notes: '',
    });
  };

  const handleStyleChange = (style: MeetingStyleType) => {
    let notesValue = activeMeeting.notes || '';
    if (style === 'template' && !notesValue.trim()) {
      notesValue = TEMPLATE_TEXT;
    }
    setActiveMeeting(prev => ({ ...prev, style, notes: notesValue }));
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!activeMeeting.title) return;

    const savedItem: Meeting = {
      id: activeMeeting.id || Math.random().toString(36).substring(2, 11),
      title: activeMeeting.title,
      date: activeMeeting.date || new Date().toISOString().split('T')[0],
      time: activeMeeting.time || '12:00',
      location: activeMeeting.location || '',
      importance: activeMeeting.importance || 'medium',
      style: activeMeeting.style || 'blank',
      notes: activeMeeting.notes || '',
      createdAt: activeMeeting.createdAt || new Date().toISOString(),
    };

    onSaveMeeting(savedItem);
  };

  // Mini toolbar helpers to insert characters
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById('notes-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentNotes = activeMeeting.notes || '';
    const newNotes = currentNotes.substring(0, start) + textToInsert + currentNotes.substring(end);
    
    setActiveMeeting(prev => ({ ...prev, notes: newNotes }));
    
    // Maintain focus & reset cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  // Styles based on selected notebook option
  const getNotesTextareaStyle = () => {
    if (activeMeeting.style === 'lined') {
      return {
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(167,139,250,0.07) 27px, rgba(167,139,250,0.07) 28px)',
        lineHeight: '28px',
        paddingTop: '6px',
      };
    }
    return {};
  };

  return (
    <div className="w-full min-h-screen relative z-10 flex flex-col md:flex-row gap-6 p-4 md:p-8 select-none">
      
      {/* Left Panel - Scrollable List (280px wide) */}
      <div className="w-full md:w-72 bg-abyss/40 border border-orchid/15 rounded-xl p-4 flex flex-col h-[calc(100vh-100px)] min-h-[450px]">
        <div className="mb-4">
          <h2 className="logo-font text-2xl text-silver">Meetings</h2>
          <button
            onClick={handleCreateNew}
            className="w-full mt-3 pill-btn-gradient text-xs py-2 px-4 shadow-orchid/10"
          >
            + New Meeting
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-mist cormorant-font">
              <span>✦</span>
              <p className="mt-1">No saved meetings. Initiate one above.</p>
            </div>
          ) : (
            meetings.map(meeting => {
              const importanceColor =
                meeting.importance === 'low'
                  ? 'bg-[#7EC8A0]' // sage
                  : meeting.importance === 'medium'
                  ? 'bg-[#E8C86A]' // gold
                  : 'bg-[#E07090]'; // rose

              const isActive = selectedMeetingId === meeting.id;

              return (
                <div
                  key={meeting.id}
                  onClick={() => onSelectMeetingId(meeting.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-orchid/10 border-orchid/30 border-l-[3px] border-l-orchid'
                      : 'bg-void/40 border-orchid/5 hover:border-orchid/20 hover:bg-ghost'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-silver truncate">{meeting.title || 'Untitled Meeting'}</p>
                    <span className="text-[10px] text-mist font-mono block mt-1">{meeting.date}</span>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${importanceColor}`} title={`${meeting.importance} importance`} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Detailed Form Editor */}
      <form onSubmit={handleSave} className="flex-1 bg-abyss/40 border border-orchid/15 rounded-xl p-6 flex flex-col h-[calc(100vh-100px)] min-h-[450px] overflow-hidden">
        
        {/* Scrollable editor elements */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 pb-4">
          
          {/* Title */}
          <input
            type="text"
            required
            value={activeMeeting.title || ''}
            onChange={(e) => setActiveMeeting(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-transparent border-none text-2xl md:text-3xl font-playfair font-bold text-silver focus:outline-none placeholder-mist"
            placeholder="Name your meeting..."
          />

          <hr className="border-orchid/10" />

          {/* Date, Time, Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-semibold tracking-wider text-mist">Date</label>
              <input
                type="date"
                required
                value={activeMeeting.date || ''}
                onChange={(e) => setActiveMeeting(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-void/40 border border-orchid/10 rounded px-3 py-1.5 text-xs text-silver focus:outline-none focus:border-orchid/30 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-semibold tracking-wider text-mist">Time</label>
              <input
                type="time"
                required
                value={activeMeeting.time || ''}
                onChange={(e) => setActiveMeeting(prev => ({ ...prev, time: e.target.value }))}
                className="w-full bg-void/40 border border-orchid/10 rounded px-3 py-1.5 text-xs text-silver focus:outline-none focus:border-orchid/30 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-semibold tracking-wider text-mist">Location or Link</label>
              <input
                type="text"
                value={activeMeeting.location || ''}
                onChange={(e) => setActiveMeeting(prev => ({ ...prev, location: e.target.value }))}
                className="w-full bg-void/40 border border-orchid/10 rounded px-3 py-1.5 text-xs text-silver focus:outline-none focus:border-orchid/30 placeholder-void/50"
                placeholder="Zoom, Room 4B..."
              />
            </div>
          </div>

          {/* Importance and Style Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            {/* Importance */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-semibold tracking-wider text-mist">Importance</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as ImportanceType[]).map(level => {
                  const isSel = activeMeeting.importance === level;
                  let btnColorClass = 'text-mist border-orchid/10 bg-transparent hover:text-silver';
                  if (isSel) {
                    if (level === 'low') btnColorClass = 'bg-[#7EC8A0]/25 border-[#7EC8A0] text-[#7EC8A0]';
                    if (level === 'medium') btnColorClass = 'bg-[#E8C86A]/25 border-[#E8C86A] text-[#E8C86A]';
                    if (level === 'high') btnColorClass = 'bg-[#E07090]/25 border-[#E07090] text-[#E07090]';
                  }
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setActiveMeeting(prev => ({ ...prev, importance: level }))}
                      className={`flex-1 py-1 px-3 border rounded text-xs capitalize transition-all cursor-pointer font-medium ${btnColorClass}`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notebook Style */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-semibold tracking-wider text-mist">Notebook Page Style</label>
              <div className="flex bg-void p-0.5 rounded border border-orchid/10 gap-0.5">
                {(['blank', 'lined', 'cornell', 'template'] as MeetingStyleType[]).map(styleOpt => (
                  <button
                    key={styleOpt}
                    type="button"
                    onClick={() => handleStyleChange(styleOpt)}
                    className={`flex-1 py-1 px-1.5 rounded text-[10px] md:text-xs font-medium capitalize transition-all cursor-pointer ${
                      activeMeeting.style === styleOpt
                        ? 'bg-violet text-white'
                        : 'text-mist hover:text-silver'
                    }`}
                  >
                    {styleOpt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor Area with Cornell cues columns if Cornell selected */}
          <div className="space-y-2 pt-2 flex-1 flex flex-col min-h-[300px]">
            
            {/* Toolbar */}
            <div className="flex items-center gap-1 bg-void/60 border border-orchid/10 rounded p-1">
              <button
                type="button"
                onClick={() => insertTextAtCursor('**BoldText**')}
                className="p-1.5 text-xs text-mist hover:text-silver rounded hover:bg-ghost cursor-pointer font-bold"
                title="Bold (Ctrl+B)"
              >
                B
              </button>
              <span className="w-[1px] h-4 bg-orchid/15" />
              <button
                type="button"
                onClick={() => insertTextAtCursor('## ')}
                className="p-1.5 text-xs text-mist hover:text-silver rounded hover:bg-ghost cursor-pointer"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor('• ')}
                className="p-1.5 text-xs text-mist hover:text-silver rounded hover:bg-ghost cursor-pointer"
                title="Bullet list"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor('\n────────────────────────\n')}
                className="p-1.5 text-xs text-mist hover:text-silver rounded hover:bg-ghost cursor-pointer"
                title="Horizontal Divider"
              >
                Divider
              </button>
              <button
                type="button"
                onClick={handleAIGenerateNotes}
                className="ml-auto flex items-center gap-1 text-[10px] font-mono border border-orchid/30 hover:border-orchid text-orchid hover:bg-orchid/10 px-2 py-1 rounded cursor-pointer transition-all"
                title="AI Suggest a highly targeted agenda plan"
              >
                ✦ AI Generate Agenda
              </button>
            </div>

            {/* Note taking body (Handles split column if Cornell is active) */}
            <div className="flex-1 flex gap-2 border border-orchid/10 rounded-lg overflow-hidden min-h-[250px] bg-void/20">
              
              {activeMeeting.style === 'cornell' && (
                <div className="w-1/3 border-r border-orchid/10 p-3 bg-void/40 flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-orchid">Cue Column</span>
                  <p className="cormorant-font text-[11px] text-mist leading-relaxed">
                    Enter key ideas, definitions, tags, or cue questions here in your Cornell notes structure.
                  </p>
                  <textarea
                    placeholder="Key questions / words..."
                    className="w-full flex-1 bg-transparent border-none text-xs text-silver resize-none focus:outline-none cormorant-font leading-relaxed"
                  />
                </div>
              )}

              <div className="flex-1 relative">
                <textarea
                  id="notes-textarea"
                  value={activeMeeting.notes || ''}
                  onChange={(e) => setActiveMeeting(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full h-full min-h-[250px] bg-transparent border-none p-4 text-sm text-silver resize-none focus:outline-none cormorant-font leading-relaxed"
                  placeholder="Inscribe notes here..."
                  style={getNotesTextareaStyle()}
                />
              </div>
            </div>

          </div>

        </div>

        {/* Save Button footer */}
        <div className="pt-4 border-t border-orchid/10 flex justify-end">
          <button
            type="submit"
            disabled={!activeMeeting.title}
            className="pill-btn-gradient text-xs py-2 px-6 shadow-orchid/15"
          >
            Inscribe Note
          </button>
        </div>

      </form>
      
    </div>
  );
}
