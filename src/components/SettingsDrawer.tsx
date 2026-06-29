import { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import { User, CustomProperty } from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser: (user: User) => void;
  onExportData: () => void;
  onImportData: (jsonData: string) => void;
  onWipeAllData: () => void;
  showToast: (msg: string) => void;
  connectRealGemini: boolean;
  onToggleRealGemini: (val: boolean) => void;
}

export default function SettingsDrawer({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onExportData,
  onImportData,
  onWipeAllData,
  showToast,
  connectRealGemini,
  onToggleRealGemini,
}: SettingsDrawerProps) {
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [volume, setVolume] = useState(50);

  // Clear data confirmation
  const [confirmWipe, setConfirmWipe] = useState(false);

  // Sync state with prop
  useEffect(() => {
    if (user) {
      setUserName(user.name);
      setUserEmail(user.email);
    }
  }, [user]);

  // File upload input ref for importing JSON
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpdateProfile = (e: FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) return;
    onUpdateUser({ name: userName, email: userEmail });
    showToast('Profile credentials synchronized!');
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contents = event.target?.result;
      if (typeof contents === 'string') {
        try {
          // Quick validation
          const parsed = JSON.parse(contents);
          if (parsed.meetings || parsed.tasks || parsed.habits) {
            onImportData(contents);
            showToast('External archive parsed and merged!');
          } else {
            showToast('Invalid backup file layout.');
          }
        } catch (err) {
          showToast('Failed to parse JSON file.');
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleWipeData = () => {
    if (confirmWipe) {
      onWipeAllData();
      setConfirmWipe(false);
      onClose();
      showToast('All local profiles and logs erased.');
    } else {
      setConfirmWipe(true);
      // Auto-reset confirmation after 3s
      setTimeout(() => {
        setConfirmWipe(false);
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[8500] select-none">
      
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#000000]/75 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-abyss border-l border-orchid/15 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-in">
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-orchid/10 pb-3">
            <div>
              <h2 className="logo-font text-xl text-silver">System Settings</h2>
              <p className="cormorant-font text-xs text-mist">Tune properties and sync credentials</p>
            </div>
            <button
              onClick={onClose}
              className="text-mist hover:text-silver text-sm font-bold font-mono cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          {/* User profile credentials */}
          <form onSubmit={handleUpdateProfile} className="space-y-3 bg-void/30 border border-orchid/5 rounded-xl p-4">
            <span className="eyebrow-label block">Profile Credentials</span>
            
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-semibold text-mist">Full Name</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full dark-input text-xs py-1.5"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-semibold text-mist">Email Address</label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full dark-input text-xs py-1.5"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={user?.name === userName && user?.email === userEmail}
                className="pill-btn-gradient py-1 px-4 text-[10px] disabled:opacity-50 disabled:pointer-events-none"
              >
                Sync Profile
              </button>
            </div>
          </form>

          {/* Master volume controls */}
          <div className="space-y-2 bg-void/30 border border-orchid/5 rounded-xl p-4 text-xs">
            <span className="eyebrow-label block">Acoustic Audio Volumes</span>
            <div className="flex items-center gap-4">
              <span className="text-mist text-xs">Decibels</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 accent-orchid h-1 bg-void rounded-lg cursor-pointer"
              />
              <span className="font-mono text-silver w-8 text-right">{volume}%</span>
            </div>
          </div>

          {/* AI Settings Section */}
          <div className="space-y-3 bg-void/30 border border-orchid/5 rounded-xl p-4 text-xs">
            <span className="eyebrow-label block">Cognitive AI Core</span>
            <div className="flex items-center justify-between">
              <span className="text-silver font-medium">Connect Real Gemini API</span>
              <button
                type="button"
                onClick={() => onToggleRealGemini(!connectRealGemini)}
                className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer relative ${
                  connectRealGemini ? 'bg-orchid' : 'bg-void border border-orchid/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    connectRealGemini ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {connectRealGemini ? (
              <p className="font-mono text-[9px] text-[#E8C86A] bg-[#E8C86A]/5 border border-[#E8C86A]/20 rounded p-2 leading-relaxed">
                ✦ SYSTEM ACTIVE: Real-time queries will engage the raw Gemini LLM API directly for hyper-responsive cognitive coaching.
              </p>
            ) : (
              <p className="cormorant-font text-mist leading-relaxed">
                In production, this toggle switches from simulated intelligence to the Google Gemini API for true cognitive analysis.
              </p>
            )}
          </div>

          {/* Backup Archives */}
          <div className="space-y-3 bg-void/30 border border-orchid/5 rounded-xl p-4 text-xs">
            <span className="eyebrow-label block">System Database Backup</span>
            <p className="cormorant-font text-mist leading-relaxed">
              Export your registered task sheets, habits, and meeting templates into a single JSON archive file, or drop a backup here to restore state.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onExportData}
                className="flex-1 border border-orchid/15 hover:border-orchid/35 py-1.5 rounded bg-void text-xs text-silver font-semibold cursor-pointer"
              >
                Export Archive
              </button>
              
              <button
                type="button"
                onClick={handleImportClick}
                className="flex-1 border border-orchid/15 hover:border-orchid/35 py-1.5 rounded bg-void text-xs text-silver font-semibold cursor-pointer"
              >
                Import Archive
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Destruction State */}
        <div className="pt-6 border-t border-orchid/10">
          <button
            type="button"
            onClick={handleWipeData}
            className={`w-full py-2 px-4 rounded text-xs font-semibold cursor-pointer border transition-all ${
              confirmWipe
                ? 'bg-rose text-white border-rose animate-pulse'
                : 'bg-transparent border-rose/30 text-rose hover:bg-rose/5'
            }`}
          >
            {confirmWipe ? 'Confirm complete state wipe (3s reset)' : 'Clear and Delete All Data'}
          </button>
        </div>

      </div>
      
    </div>
  );
}
