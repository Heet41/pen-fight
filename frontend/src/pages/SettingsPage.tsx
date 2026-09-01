import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import { useAuthStore } from '@/store/authStore';
import { sound } from '@/utils/audio';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [soundEnabled, setSoundEnabled] = useState(!sound.getMuted());
  const [screenShake, setScreenShake] = useState(true);
  const [aimGuide, setAimGuide] = useState(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setMuted(!next);
    if (next) sound.playClick();
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-grid-pattern relative flex flex-col">
      <ParticleBackground />
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/menu')}
              className="text-xs text-white/50 hover:text-white mb-1 flex items-center gap-1 transition-colors"
            >
              <span>←</span> Back to Menu
            </button>
            <h1 className="font-game font-black text-3xl text-white">Game Settings</h1>
            <p className="text-white/50 text-sm">Configure audio, gameplay feedback, and account preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Audio Settings */}
          <div className="glass-card p-6 border-white/10">
            <h2 className="text-sm font-mono uppercase tracking-widest text-neon-blue font-bold mb-4">
              🔊 Audio & Sound FX
            </h2>
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <div className="text-sm font-bold text-white">Sound Effects</div>
                <div className="text-xs text-white/40">Synthesized audio for launches, collisions, and victory</div>
              </div>
              <button
                onClick={toggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  soundEnabled ? 'bg-cyan-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Gameplay & Visuals */}
          <div className="glass-card p-6 border-white/10">
            <h2 className="text-sm font-mono uppercase tracking-widest text-neon-purple font-bold mb-4">
              🎮 Gameplay & Visual FX
            </h2>

            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <div className="text-sm font-bold text-white">Trajectory Aim Guide</div>
                <div className="text-xs text-white/40">Displays trajectory line and predicted collision dots</div>
              </div>
              <button
                onClick={() => setAimGuide(!aimGuide)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  aimGuide ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    aimGuide ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-bold text-white">Screen Shake on Hard Hits</div>
                <div className="text-xs text-white/40">Camera vibration on high-velocity pen collisions</div>
              </div>
              <button
                onClick={() => setScreenShake(!screenShake)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  screenShake ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    screenShake ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Account */}
          {user && (
            <div className="glass-card p-6 border-white/10">
              <h2 className="text-sm font-mono uppercase tracking-widest text-red-400 font-bold mb-4">
                👤 Account
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">Signed in as {user.username}</div>
                  <div className="text-xs text-white/40">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
