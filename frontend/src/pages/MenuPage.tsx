import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import HowToPlayModal from '@/components/HowToPlayModal';
import { useAuthStore } from '@/store/authStore';

export default function MenuPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const gameModes = [
    {
      id: 'local',
      title: 'Local 2-Player',
      subtitle: 'Pass & Play on same screen with a friend',
      icon: '👥',
      badge: 'Multiplayer',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-400',
      textColor: 'text-emerald-400',
      action: () => navigate('/game/local'),
    },
    {
      id: 'ai',
      title: 'Play VS AI',
      subtitle: 'Battle Easy, Medium, or Hard computer bot',
      icon: '🤖',
      badge: 'Singleplayer',
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 hover:border-purple-400',
      textColor: 'text-purple-400',
      action: () => navigate('/game/ai'),
    },
  ];

  const quickLinks = [
    { label: 'Leaderboard', icon: '👑', action: () => navigate('/leaderboard') },
    { label: 'Profile & Stats', icon: '📊', action: () => navigate('/profile') },
    { label: 'Cosmetics', icon: '🎨', action: () => navigate('/cosmetics') },
    { label: 'How to Play', icon: '📖', action: () => setShowHowToPlay(true) },
    { label: 'Settings', icon: '⚙️', action: () => navigate('/settings') },
  ];

  return (
    <div className="min-h-screen bg-dark-900 bg-grid-pattern relative flex flex-col">
      <ParticleBackground />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 relative z-10">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl glass-card bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-transparent border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-neon-blue font-semibold">
              Arena Ready
            </span>
            <h1 className="text-2xl sm:text-3xl font-game font-bold text-white mt-1">
              Select Game Mode
            </h1>
            <p className="text-white/50 text-sm mt-0.5">
              {user
                ? `Welcome back, ${user.username}! Select a mode to start fighting.`
                : 'Choose a mode to play or sign in to track stats and level up.'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/game/local')}
              className="btn-neon text-xs py-2.5 px-5 font-game"
            >
              ⚡ Quick Match
            </button>
          </div>
        </motion.div>

        {/* ─── Main Mode Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={mode.action}
              className={`p-8 rounded-2xl glass-card bg-gradient-to-br ${mode.color} border cursor-pointer group transition-all duration-300 relative overflow-hidden`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="text-5xl p-3 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                  {mode.icon}
                </div>
                <span className={`text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-white/10 ${mode.textColor}`}>
                  {mode.badge}
                </span>
              </div>

              <h2 className="text-2xl font-game font-bold text-white group-hover:text-neon-blue transition-colors">
                {mode.title}
              </h2>
              <p className="text-white/50 text-sm mt-1.5 mb-6">{mode.subtitle}</p>

              <div className="flex items-center gap-2 text-sm font-semibold text-white/70 group-hover:text-white">
                <span>Play Now</span>
                <span className="group-hover:translate-x-1 transition-transform">➔</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Secondary Hub Links ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 border-white/10"
        >
          <h3 className="text-xs font-mono uppercase tracking-widest text-white/50 font-bold mb-4">
            Game Hub & Stats
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-center group"
              >
                <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
                  {link.icon}
                </span>
                <span className="text-xs text-white/70 group-hover:text-white font-medium truncate w-full">
                  {link.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </main>

      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
    </div>
  );
}
