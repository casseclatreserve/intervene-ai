import { useState, FormEvent } from 'react';
import { User } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

type AuthTab = 'signin' | 'signup';

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  
  // Sign in states
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign up states
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');

  const [error, setError] = useState<string | null>(null);

  const handleSignInSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signInEmail || !signInPassword) {
      setError('Please fill in all fields.');
      return;
    }

    // Capture first name or fallback to full name
    const defaultName = signInEmail.split('@')[0];
    const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

    const user: User = {
      name: formattedName,
      email: signInEmail,
    };

    onLoginSuccess(user);
  };

  const handleSignUpSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signUpName || !signUpEmail || !signUpPassword || !signUpConfirm) {
      setError('All fields are required.');
      return;
    }

    if (signUpPassword !== signUpConfirm) {
      setError('Passwords do not match.');
      return;
    }

    const user: User = {
      name: signUpName,
      email: signUpEmail,
    };

    onLoginSuccess(user);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 md:p-8 relative z-10 overflow-x-hidden select-none">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-12 lg:gap-24 items-center">
        
        {/* Left Column - Cinematic Brand Presentation (Desktop only) */}
        <div className="hidden md:flex flex-1 flex-col justify-center relative py-12">
          {/* Faint rotating decorative element in background */}
          <div className="absolute -left-12 -top-12 w-64 h-64 border border-[rgba(167,139,250,0.06)] rounded-full animate-spin-slow pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-96 h-96 border border-[rgba(167,139,250,0.03)] rounded-full animate-spin-slow-reverse pointer-events-none" />

          <h1 className="logo-font text-orchid text-5xl lg:text-7xl tracking-widest uppercase transition-all">
            INTERVENE AI
          </h1>
          <p className="fell-font text-mist text-lg lg:text-2xl mt-3">
            Don't wait. Intervene.
          </p>

          <div className="mt-12 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-orchid text-lg">✦</span>
              <p className="cormorant-font text-silver text-base lg:text-lg">
                Built for the ones who refuse to miss what matters.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orchid text-lg">✦</span>
              <p className="cormorant-font text-silver text-base lg:text-lg">
                AI that intervenes before you spiral.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orchid text-lg">✦</span>
              <p className="cormorant-font text-silver text-base lg:text-lg">
                Your time. Reclaimed.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Beautiful Goth Glass Auth Card */}
        <div className="flex-1 w-full flex justify-center">
          <div className="w-full max-w-md bg-abyss/90 backdrop-blur-2xl border border-orchid/15 rounded-2xl p-8 shadow-2xl shadow-orchid/5 relative overflow-hidden">
            
            {/* Header for Mobile */}
            <div className="text-center md:hidden mb-8">
              <h1 className="logo-font text-orchid text-3xl tracking-widest uppercase">
                INTERVENE AI
              </h1>
              <p className="fell-font text-mist text-sm mt-1">
                Don't wait. Intervene.
              </p>
            </div>

            {/* Pill tabs */}
            <div className="flex bg-void p-1 rounded-full border border-orchid/10 mb-8">
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); setError(null); }}
                className={`flex-1 py-2 px-4 rounded-full text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-violet text-white shadow-lg shadow-violet/30'
                    : 'text-mist hover:text-silver bg-transparent'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setError(null); }}
                className={`flex-1 py-2 px-4 rounded-full text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-violet text-white shadow-lg shadow-violet/30'
                    : 'text-mist hover:text-silver bg-transparent'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg border border-rose/30 bg-rose/5 text-rose text-xs font-medium text-center">
                {error}
              </div>
            )}

            {activeTab === 'signin' ? (
              <form onSubmit={handleSignInSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-semibold tracking-wider text-mist">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full dark-input"
                    placeholder="name@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs uppercase font-semibold tracking-wider text-mist">
                      Password
                    </label>
                    <span 
                      onClick={() => setError('Password reset is simulated. Just log in!')}
                      className="text-xs text-orchid hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </span>
                  </div>
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full dark-input"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full pill-btn-gradient">
                    Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-semibold tracking-wider text-mist">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full dark-input"
                    placeholder="Alaric Vance"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs uppercase font-semibold tracking-wider text-mist">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full dark-input"
                    placeholder="name@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs uppercase font-semibold tracking-wider text-mist">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full dark-input"
                    placeholder="Min. 8 characters"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs uppercase font-semibold tracking-wider text-mist">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signUpConfirm}
                    onChange={(e) => setSignUpConfirm(e.target.value)}
                    className="w-full dark-input"
                    placeholder="Repeat password"
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full pill-btn-gradient">
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* Subtle terms note */}
            <p className="cormorant-font text-mist text-xs text-center mt-6">
              ✦ By entering, you agree to step into the disciplined flow. ✦
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
