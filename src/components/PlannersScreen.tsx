import { useState, FormEvent } from 'react';
import { CustomPlanner, CustomSection, SectionType } from '../types';

interface PlannersScreenProps {
  customPlanners: CustomPlanner[];
  onAddCustomPlanner: (planner: CustomPlanner) => void;
  onImportMeetingNotes: (title: string, notes: string) => void;
  showToast: (msg: string) => void;
  onTriggerAICoach?: (prompt: string) => void;
}

export default function PlannersScreen({
  customPlanners,
  onAddCustomPlanner,
  onImportMeetingNotes,
  showToast,
  onTriggerAICoach,
}: PlannersScreenProps) {
  const [activeTab, setActiveTab] = useState<'custom' | 'vacation' | 'finance' | 'student'>('custom');

  // AI Planner generators
  const handleAIGenerateBespoke = () => {
    setPlannerName('Prefrontal Isolation Framework');
    setSections([
      {
        id: 'sec-ai-1',
        title: 'Dopamine Quarantine Protocol',
        type: 'checklist',
        content: '• [ ] Block social feeds\n• [ ] Set workspace environment to dark\n• [ ] Launch binaural theta loop',
      },
      {
        id: 'sec-ai-2',
        title: 'High-Status Time Blocks',
        type: 'table',
        content: '| Block | Target Execution |\n| --- | --- |\n| 08:00 - 11:00 | High Complexity Focus (Q2) |\n| 11:00 - 13:00 | Transactional Tasks (Q3) |\n| 13:00 - 14:00 | Post-Mortem Assessment |',
      },
      {
        id: 'sec-ai-3',
        title: 'Ascent Reflections',
        type: 'notes',
        content: 'Identify core friction points. What is the single smallest 1% Kaizen change for tomorrow?',
      }
    ]);
    showToast('AI bespoke planner sections injected!');
    onTriggerAICoach?.('bespoke planner: Suggest a deep focus planner framework');
  };

  const handleAIGenerateVacation = () => {
    setVacationTitle('Kyoto Zen Garden Ascent');
    setVacationDates('November 1 - November 10');
    setVacationChecklist('• [ ] Pack silent meditation journal\n• [ ] Download offline temple coordinates\n• [ ] Prep 5-Second focus card\n• [ ] Dark charcoal linen wardrobe items\n• [ ] Pocket translate app configured\n• [ ] Set Intervene AI active schedule');
    showToast('AI trip plan suggested!');
    onTriggerAICoach?.('trip plan: Suggest a continuous growth vacation itinerary');
  };

  // ==========================================
  // 1. Custom Planner State
  // ==========================================
  const [plannerName, setPlannerName] = useState('');
  const [sections, setSections] = useState<CustomSection[]>([]);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionType, setSectionType] = useState<SectionType>('notes');

  const handleAddSection = () => {
    if (!sectionTitle.trim()) return;
    const newSec: CustomSection = {
      id: Math.random().toString(36).substring(2, 9),
      title: sectionTitle.trim(),
      type: sectionType,
      content: sectionType === 'checklist' ? '• Task 1\n• Task 2' : sectionType === 'table' ? '| Key | Value |\n| --- | --- |\n| Item 1 | Value 1 |' : '',
    };
    setSections([...sections, newSec]);
    setSectionTitle('');
  };

  const handleUpdateSectionContent = (id: string, val: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, content: val } : s));
  };

  const handleRemoveSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const handleSaveCustomPlanner = () => {
    if (!plannerName.trim() || sections.length === 0) return;
    const newPlanner: CustomPlanner = {
      id: Math.random().toString(36).substring(2, 11),
      name: plannerName.trim(),
      sections,
      createdAt: new Date().toISOString(),
    };
    onAddCustomPlanner(newPlanner);
    setPlannerName('');
    setSections([]);
    showToast('Custom Section Planner saved to library!');
  };

  // ==========================================
  // 2. Vacation Planner State
  // ==========================================
  const [vacationTitle, setVacationTitle] = useState('');
  const [vacationDates, setVacationDates] = useState('');
  const [vacationChecklist, setVacationChecklist] = useState('• Passport & tickets\n• Chargers & adapters\n• Local currency\n• Offline maps downloaded\n• Set alarm to 5s rule');

  const handleExportVacation = () => {
    if (!vacationTitle) return;
    const textContent = `VACATION TRIP PLANNER
=====================
Title: ${vacationTitle}
Dates: ${vacationDates}

PACKING & TASK CHECKLIST:
─────────────────────────
${vacationChecklist}
`;
    const element = document.createElement('a');
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${vacationTitle.toLowerCase().replace(/\s+/g, '_')}_planner.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Vacation Checklist exported successfully!');
  };

  // ==========================================
  // 3. Finance Planner State
  // ==========================================
  const [budgetLimit, setBudgetLimit] = useState<number>(2000);
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<string>('rent');
  const [loggedExpenses, setLoggedExpenses] = useState<{ id: string; category: string; amount: number }[]>([
    { id: '1', category: 'rent', amount: 900 },
    { id: '2', category: 'food', amount: 350 },
    { id: '3', category: 'travel', amount: 150 },
  ]);

  const handleAddExpense = (e: FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) return;

    setLoggedExpenses([
      ...loggedExpenses,
      { id: Math.random().toString(), category: expenseCategory, amount: amt }
    ]);
    setExpenseAmount('');
    showToast(`Logged $${amt} for ${expenseCategory}!`);
  };

  const getCategoryTotal = (cat: string) => {
    return loggedExpenses.filter(e => e.category === cat).reduce((acc, e) => acc + e.amount, 0);
  };

  const totalSpent = loggedExpenses.reduce((acc, e) => acc + e.amount, 0);
  const budgetRatio = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 0;

  // ==========================================
  // 4. Student Grade Tracker State
  // ==========================================
  const [gradeComponents, setGradeComponents] = useState<{ id: string; name: string; score: number; weight: number }[]>([
    { id: '1', name: 'Midterm Exam', score: 85, weight: 30 },
    { id: '2', name: 'Final Exam', score: 92, weight: 40 },
    { id: '3', name: 'Laboratory Logs', score: 95, weight: 30 },
  ]);
  const [compName, setCompName] = useState('');
  const [compScore, setCompScore] = useState('');
  const [compWeight, setCompWeight] = useState('');

  const handleAddGradeComponent = (e: FormEvent) => {
    e.preventDefault();
    const scoreVal = parseFloat(compScore);
    const weightVal = parseFloat(compWeight);
    if (!compName || isNaN(scoreVal) || isNaN(weightVal)) return;

    setGradeComponents([
      ...gradeComponents,
      { id: Math.random().toString(), name: compName, score: scoreVal, weight: weightVal }
    ]);
    setCompName('');
    setCompScore('');
    setCompWeight('');
    showToast('Grade component registered!');
  };

  const handleRemoveGradeComponent = (id: string) => {
    setGradeComponents(gradeComponents.filter(c => c.id !== id));
  };

  // Calculate weighted grade
  const totalWeight = gradeComponents.reduce((acc, c) => acc + c.weight, 0);
  const weightedAverage = totalWeight > 0 
    ? Math.round(gradeComponents.reduce((acc, c) => acc + (c.score * (c.weight / totalWeight)), 0) * 10) / 10
    : 0;

  const calculateGPA = (avg: number) => {
    if (avg >= 93) return { gpa: '4.0', letter: 'A' };
    if (avg >= 90) return { gpa: '3.7', letter: 'A-' };
    if (avg >= 87) return { gpa: '3.3', letter: 'B+' };
    if (avg >= 83) return { gpa: '3.0', letter: 'B' };
    if (avg >= 80) return { gpa: '2.7', letter: 'B-' };
    if (avg >= 77) return { gpa: '2.3', letter: 'C+' };
    if (avg >= 73) return { gpa: '2.0', letter: 'C' };
    return { gpa: '1.0', letter: 'D/F' };
  };

  const gpaInfo = calculateGPA(weightedAverage);

  const handleImportGradesToMeetings = () => {
    const formattedGrades = `Academic Grade Transcript
=========================
Registered Components:
${gradeComponents.map(c => `• ${c.name}: Score ${c.score}% (Weight: ${c.weight}%)`).join('\n')}

Weighted average: ${weightedAverage}%
Calculated GPA Equivalent: ${gpaInfo.gpa} (${gpaInfo.letter})
`;
    onImportMeetingNotes('Grades Assessment Log', formattedGrades);
    showToast('Transcript exported to Meetings notebook!');
  };

  return (
    <div className="w-full min-h-screen relative z-10 px-4 py-8 md:p-8 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Headings */}
        <div>
          <h1 className="h1-font text-silver text-3xl md:text-4xl">
            Planners & Calculators
          </h1>
          <p className="cormorant-font text-mist text-sm md:text-base mt-1">
            Build bespoke worksheets, track travel committals, forecast budgets, and log academic achievements.
          </p>
        </div>

        {/* Sub-tabs pills */}
        <div className="flex bg-void p-1 rounded-full border border-orchid/15 max-w-xl">
          {[
            { id: 'custom', label: 'Bespoke' },
            { id: 'vacation', label: 'Vacation' },
            { id: 'finance', label: 'Finance' },
            { id: 'student', label: 'Grades' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-violet text-white shadow shadow-violet/30'
                  : 'text-mist hover:text-silver'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. BESPOKE CUSTOM PLANNER */}
        {activeTab === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Left builder panel */}
            <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-5 space-y-4 md:col-span-1">
              <span className="eyebrow-label block">Custom Section Builder</span>
              
              <button
                type="button"
                onClick={handleAIGenerateBespoke}
                className="w-full text-center py-2 border border-dashed border-orchid/30 hover:border-orchid text-orchid hover:bg-orchid/10 text-[11px] font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Generate custom focus sections utilizing prefrontal cortex containment strategy"
              >
                ✦ AI Suggest Bespoke Sections
              </button>
              
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-semibold text-mist">Planner Name</label>
                <input
                  type="text"
                  required
                  value={plannerName}
                  onChange={(e) => setPlannerName(e.target.value)}
                  placeholder="Daily Ascent Routine..."
                  className="w-full dark-input text-xs"
                />
              </div>

              <hr className="border-orchid/5" />

              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-semibold text-mist">Section Title</label>
                  <input
                    type="text"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="E.g. Gratitude log"
                    className="w-full dark-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-semibold text-mist">Section Layout Type</label>
                  <select
                    value={sectionType}
                    onChange={(e) => setSectionType(e.target.value as any)}
                    className="w-full dark-input text-xs"
                  >
                    <option value="notes">Notes / Text Block</option>
                    <option value="checklist">Checklist Block</option>
                    <option value="table">Tabular Grid</option>
                    <option value="dates">Target Dates</option>
                    <option value="trackers">Mini Metric</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddSection}
                  className="w-full pill-btn-gradient text-[10px] py-1.5"
                >
                  + Add Section
                </button>
              </div>

              {sections.length > 0 && (
                <div className="pt-4 border-t border-orchid/5">
                  <button
                    onClick={handleSaveCustomPlanner}
                    className="w-full pill-btn-rose text-xs py-2"
                  >
                    Save Planner to Library
                  </button>
                </div>
              )}
            </div>

            {/* Right preview canvas */}
            <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-6 md:col-span-2 min-h-[350px] space-y-5">
              <div className="border-b border-orchid/5 pb-2">
                <h3 className="fell-font text-lg text-silver">{plannerName || 'Bespoke Planner Draft'}</h3>
                <span className="text-[10px] text-mist font-mono">Real-time custom sections preview</span>
              </div>

              {sections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-xs text-mist cormorant-font">
                  <span>✦</span>
                  <p className="mt-1">Add custom sections on the left to structure your sheet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sections.map((sec, idx) => (
                    <div key={sec.id} className="bg-void/30 border border-orchid/10 rounded-lg p-4 space-y-3 relative">
                      <button
                        onClick={() => handleRemoveSection(sec.id)}
                        className="absolute top-3 right-3 text-mist hover:text-rose-500 font-bold text-xs"
                      >
                        ✕
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-orchid">✦</span>
                        <h4 className="text-sm font-semibold text-silver uppercase tracking-wider">{sec.title}</h4>
                        <span className="text-[9px] font-mono text-mist bg-void px-2 py-0.5 rounded-full uppercase">
                          {sec.type}
                        </span>
                      </div>

                      {/* Content representation */}
                      <textarea
                        value={sec.content}
                        onChange={(e) => handleUpdateSectionContent(sec.id, e.target.value)}
                        placeholder={`Write custom notes or content layout for ${sec.title}...`}
                        className="w-full bg-void/50 border border-orchid/10 rounded p-2 text-xs text-silver resize-y font-mono min-h-[60px] focus:outline-none focus:border-orchid/20"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. VACATION PLANNING & EXPORT */}
        {activeTab === 'vacation' && (
          <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-6 max-w-2xl mx-auto space-y-5">
            <div className="border-b border-orchid/5 pb-2">
              <h3 className="fell-font text-xl text-silver">Vacation Trip Tracker</h3>
              <p className="cormorant-font text-xs text-mist">Plan itineraries and export formatted checklist.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-semibold text-mist">Trip Subject / Destination</label>
                <input
                  type="text"
                  value={vacationTitle}
                  onChange={(e) => setVacationTitle(e.target.value)}
                  placeholder="Kyoto retreat, Tokyo ascent..."
                  className="w-full dark-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-semibold text-mist">Trip Dates</label>
                <input
                  type="text"
                  value={vacationDates}
                  onChange={(e) => setVacationDates(e.target.value)}
                  placeholder="Oct 12 - Oct 22"
                  className="w-full dark-input text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-semibold text-mist">Packing list (Linear Checklist rows)</label>
              <textarea
                value={vacationChecklist}
                onChange={(e) => setVacationChecklist(e.target.value)}
                className="w-full min-h-[140px] dark-input text-xs font-mono leading-relaxed"
                placeholder="• Passport..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleAIGenerateVacation}
                className="bg-void/60 border border-orchid/30 hover:border-orchid text-orchid text-xs px-4 py-2 rounded-lg font-mono flex items-center gap-1.5 cursor-pointer transition-all hover:bg-orchid/10"
                title="Let AI Suggest high-value vacation checklist nodes"
              >
                ✦ AI Suggest Trip Plan
              </button>
              <button
                type="button"
                onClick={handleExportVacation}
                disabled={!vacationTitle}
                className="pill-btn-gradient text-xs py-2 px-6"
              >
                Export Checklist (.TXT)
              </button>
            </div>
          </div>
        )}

        {/* 3. FINANCE BUDGET FORECASTER */}
        {activeTab === 'finance' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Input expense form */}
            <form onSubmit={handleAddExpense} className="bg-abyss/40 border border-orchid/15 rounded-xl p-5 space-y-4">
              <span className="eyebrow-label block">Expense Logger</span>
              
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-semibold text-mist">Monthly budget limit ($)</label>
                <input
                  type="number"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(Number(e.target.value))}
                  className="w-full dark-input text-xs"
                />
              </div>

              <hr className="border-orchid/5" />

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-semibold text-mist">Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="E.g. 15.50"
                    className="w-full dark-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-semibold text-mist">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full dark-input text-xs"
                  >
                    <option value="rent">Rent / Shelter</option>
                    <option value="food">Nourishment / Food</option>
                    <option value="travel">Travel / Commute</option>
                    <option value="utilities">Utilities & Tech</option>
                    <option value="misc">Miscellaneous</option>
                  </select>
                </div>

                <button type="submit" className="w-full pill-btn-rose text-[10px] py-1.5">
                  Log Expense
                </button>
              </div>
            </form>

            {/* Expenses display progress */}
            <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-6 md:col-span-2 space-y-5">
              <div className="border-b border-orchid/5 pb-2">
                <h3 className="fell-font text-lg text-silver">Expenditure Analysis</h3>
                <span className="text-[10px] text-mist font-mono">Dynamic category progress tracker</span>
              </div>

              {/* Progress bars categories */}
              <div className="space-y-4">
                {[
                  { cat: 'rent', label: 'Rent / Shelter' },
                  { cat: 'food', label: 'Nourishment / Food' },
                  { cat: 'travel', label: 'Travel / Commute' },
                  { cat: 'utilities', label: 'Utilities & Tech' },
                  { cat: 'misc', label: 'Miscellaneous' },
                ].map((item) => {
                  const amt = getCategoryTotal(item.cat);
                  const ratio = budgetLimit > 0 ? (amt / budgetLimit) * 100 : 0;

                  return (
                    <div key={item.cat} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-silver">{item.label}</span>
                        <span className="text-mist">${amt} spent</span>
                      </div>
                      <div className="w-full bg-void h-1.5 rounded-full overflow-hidden border border-orchid/5">
                        <div
                          className={`h-full transition-all duration-500 ${
                            ratio > 50 ? 'bg-rose' : ratio > 25 ? 'bg-orchid' : 'bg-sage-600'
                          }`}
                          style={{ width: `${Math.min(100, ratio)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary indicators */}
              <div className="pt-4 border-t border-orchid/10 flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-mist">Total logged: </span>
                  <span className="text-silver font-bold">${totalSpent}</span>
                </div>
                <div>
                  <span className="text-mist">Budget ratio: </span>
                  <span className={`font-bold ${budgetRatio > 90 ? 'text-rose' : 'text-[#E8C86A]'}`}>
                    {Math.round(budgetRatio)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. STUDENT GRADE TRACKER */}
        {activeTab === 'student' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Input component form */}
            <form onSubmit={handleAddGradeComponent} className="bg-abyss/40 border border-orchid/15 rounded-xl p-5 space-y-4">
              <span className="eyebrow-label block">Grade Component Register</span>
              
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-semibold text-mist">Component Name</label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="Midterm, Final Paper..."
                  className="w-full dark-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-semibold text-mist">Score (%)</label>
                  <input
                    type="number"
                    required
                    value={compScore}
                    onChange={(e) => setCompScore(e.target.value)}
                    placeholder="95"
                    className="w-full dark-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-semibold text-mist">Weight (%)</label>
                  <input
                    type="number"
                    required
                    value={compWeight}
                    onChange={(e) => setCompWeight(e.target.value)}
                    placeholder="30"
                    className="w-full dark-input text-xs"
                  />
                </div>
              </div>

              <button type="submit" className="w-full pill-btn-rose text-[10px] py-1.5">
                Register Component
              </button>
            </form>

            {/* List & average GPA */}
            <div className="bg-abyss/40 border border-orchid/15 rounded-xl p-6 md:col-span-2 space-y-5">
              <div className="border-b border-orchid/5 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="fell-font text-lg text-silver">Academic Tracker</h3>
                  <span className="text-[10px] text-mist font-mono">Weighted GPA projections</span>
                </div>
                
                {gradeComponents.length > 0 && (
                  <button
                    onClick={handleImportGradesToMeetings}
                    className="text-[10px] text-orchid hover:underline border border-orchid/10 bg-void px-2 py-1 rounded"
                  >
                    ✏ Import Transcript to Meetings
                  </button>
                )}
              </div>

              {/* Components list */}
              <div className="space-y-2">
                {gradeComponents.length === 0 ? (
                  <p className="cormorant-font text-xs text-mist text-center py-6">
                    No components logged yet. Enter academic weights on the left.
                  </p>
                ) : (
                  gradeComponents.map((comp) => (
                    <div key={comp.id} className="flex justify-between items-center bg-void/30 p-2.5 border border-orchid/5 rounded-lg text-xs">
                      <div>
                        <span className="text-silver font-medium">{comp.name}</span>
                        <span className="text-mist font-mono block text-[10px] mt-0.5">Weight: {comp.weight}%</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-silver">{comp.score}%</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGradeComponent(comp.id)}
                          className="text-mist hover:text-rose-500 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Projections GPA block */}
              {gradeComponents.length > 0 && (
                <div className="pt-4 border-t border-orchid/10 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-void/50 border border-orchid/5 rounded-xl">
                    <span className="mono-font text-2xl font-bold text-orchid block">{weightedAverage}%</span>
                    <span className="text-[10px] text-mist font-medium uppercase">Weighted average</span>
                  </div>
                  
                  <div className="p-3 bg-void/50 border border-orchid/5 rounded-xl">
                    <span className="mono-font text-2xl font-bold text-[#E8C86A] block">{gpaInfo.gpa} ({gpaInfo.letter})</span>
                    <span className="text-[10px] text-mist font-medium uppercase">GPA equivalent</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
