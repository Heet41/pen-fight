import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import HowToPlayModal from '@/components/HowToPlayModal';
import { useAuthStore } from '@/store/authStore';

const gameModes = [
  {
    id: 'local',
    title: 'LOCAL BATTLE',
    eyebrow: 'PASS & PLAY',
    description: 'Challenge a friend on the same screen.',
    icon: '👥',
    accent: 'green',
    players: '2 PLAYERS',
  },
  {
    id: 'ai',
    title: 'AI ARENA',
    eyebrow: 'SOLO TRAINING',
    description: 'Test your aim against three AI difficulties.',
    icon: '🤖',
    accent: 'purple',
    players: '1 PLAYER',
  },
];

const quickLinks = [
  { label: 'Leaderboard', icon: '👑', action: 'leaderboard' },
  { label: 'Profile', icon: '📊', action: 'profile' },
  { label: 'Cosmetics', icon: '🎨', action: 'cosmetics' },
  { label: 'How To Play', icon: '📖', action: 'howto' },
  { label: 'Settings', icon: '⚙️', action: 'settings' },
];

export default function MenuPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleQuickLink = (action: string) => {
    if (action === 'howto') {
      setShowHowToPlay(true);
      return;
    }

    navigate(`/${action}`);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white relative overflow-hidden">
      <ParticleBackground />

      {/* Atmospheric lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-[10%] h-[500px] w-[500px] rounded-full bg-neon-blue/[0.045] blur-[140px]" />
        <div className="absolute top-[30%] right-[-15%] h-[550px] w-[550px] rounded-full bg-neon-purple/[0.05] blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[35%] h-[450px] w-[450px] rounded-full bg-neon-green/[0.025] blur-[140px]" />
      </div>

      <Header />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">

        {/* ─── Lobby Header ────────────────────────────────────────────────── */}

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-green shadow-[0_0_10px_rgba(34,197,94,0.8)]" />

                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-neon-green/60">
                  Arena systems online
                </span>
              </div>

              <h1 className="font-game text-3xl font-black tracking-wide sm:text-4xl lg:text-5xl">
                {user ? (
                  <>
                    WELCOME BACK,{' '}
                    <span className="text-neon-blue">
                      {user.username.toUpperCase()}
                    </span>
                  </>
                ) : (
                  <>
                    ENTER THE{' '}
                    <span className="text-neon-blue">ARENA</span>
                  </>
                )}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/35 sm:text-base">
                Choose your battle mode, sharpen your aim, and knock your
                opponent out of the arena.
              </p>
            </div>

            <button
              onClick={() => navigate('/game/local')}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-neon-blue px-6 py-3.5 font-game text-xs font-black tracking-[0.15em] text-dark-900 shadow-[0_0_30px_rgba(0,212,255,0.15)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_45px_rgba(0,212,255,0.3)] active:scale-[0.98] sm:w-auto"
            >
              <span className="relative z-10">⚡ QUICK MATCH</span>
              <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-500 group-hover:translate-x-full" />
            </button>
          </div>
        </motion.section>

        {/* ─── Main Battle Selection ──────────────────────────────────────── */}

        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-4 flex items-center justify-between"
          >
            <div>
              <div className="font-mono text-[8px] tracking-[0.3em] text-neon-blue/45">
                // BATTLE SELECT
              </div>

              <h2 className="mt-1 font-game text-lg font-bold tracking-wider text-white sm:text-xl">
                CHOOSE YOUR OPPONENT
              </h2>
            </div>

            <span className="hidden font-mono text-[8px] tracking-[0.2em] text-white/15 sm:block">
              02 MODES AVAILABLE
            </span>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-2">
            {gameModes.map((mode, index) => {
              const isGreen = mode.accent === 'green';

              return (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() =>
                    navigate(`/game/${mode.id}`)
                  }
                  className="group relative min-h-[270px] overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 text-left transition-all duration-300 hover:border-white/20 hover:bg-white/[0.045] sm:p-8"
                >
                  {/* Glow */}
                  <div
                    className={`absolute -right-24 -top-24 h-64 w-64 rounded-full blur-[80px] opacity-0 transition-opacity duration-500 group-hover:opacity-20 ${
                      isGreen ? 'bg-emerald-400' : 'bg-purple-500'
                    }`}
                  />

                  {/* Decorative grid */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-[0.12]" />

                  <div className="relative flex h-full flex-col">

                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl transition-all duration-300 group-hover:scale-110 ${
                          isGreen
                            ? 'border-emerald-400/20 bg-emerald-400/[0.06]'
                            : 'border-purple-400/20 bg-purple-400/[0.06]'
                        }`}
                      >
                        {mode.icon}
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 font-mono text-[8px] tracking-[0.2em] ${
                          isGreen
                            ? 'border-emerald-400/20 bg-emerald-400/5 text-emerald-300/70'
                            : 'border-purple-400/20 bg-purple-400/5 text-purple-300/70'
                        }`}
                      >
                        {mode.players}
                      </span>
                    </div>

                    <div className="mt-auto">
                      <div className="mb-1 font-mono text-[8px] tracking-[0.3em] text-white/25">
                        {mode.eyebrow}
                      </div>

                      <h3
                        className={`font-game text-2xl font-black tracking-wider transition-colors sm:text-3xl ${
                          isGreen
                            ? 'group-hover:text-emerald-300'
                            : 'group-hover:text-purple-300'
                        }`}
                      >
                        {mode.title}
                      </h3>

                      <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/35 sm:text-sm">
                        {mode.description}
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-4">
                        <span className="font-mono text-[8px] tracking-[0.25em] text-white/20">
                          SYSTEM READY
                        </span>

                        <span className="flex items-center gap-2 text-xs font-semibold text-white/40 transition-all group-hover:gap-3 group-hover:text-white">
                          ENTER ARENA
                          <span className="text-neon-blue">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ─── Dashboard Strip ───────────────────────────────────────────── */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="font-mono text-[8px] tracking-[0.25em] text-white/20">
              CURRENT STATUS
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
              <span className="font-game text-sm font-bold text-neon-green">
                READY TO FIGHT
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="font-mono text-[8px] tracking-[0.25em] text-white/20">
              GAME PHYSICS
            </div>
            <div className="mt-2 font-game text-sm font-bold text-white">
              PRECISION MODE
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="font-mono text-[8px] tracking-[0.25em] text-white/20">
              PLAYER PROFILE
            </div>
            <div className="mt-2 font-game text-sm font-bold text-neon-blue">
              {user ? 'PROFILE ACTIVE' : 'GUEST MODE'}
            </div>
          </div>
        </motion.section>

        {/* ─── Game Hub ───────────────────────────────────────────────────── */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="font-mono text-[8px] tracking-[0.3em] text-neon-purple/50">
                // CONTROL CENTER
              </div>

              <h2 className="mt-1 font-game text-lg font-bold tracking-wider">
                GAME HUB
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleQuickLink(link.action)}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-black/20 text-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {link.icon}
                </div>

                <div className="mt-3 truncate text-[10px] font-semibold tracking-wide text-white/45 transition-colors group-hover:text-white">
                  {link.label}
                </div>

                <div className="mt-1 font-mono text-[7px] tracking-[0.2em] text-white/15">
                  OPEN →
                </div>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Bottom status */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] pt-5 sm:flex-row">
          <span className="font-mono text-[8px] tracking-[0.25em] text-white/15">
            PEN FIGHT // LOBBY SYSTEM
          </span>

          <span className="font-mono text-[8px] tracking-[0.2em] text-white/10">
            PHYSICS ENGINE ONLINE · READY
          </span>
        </div>
      </main>

      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
    </div>
  );
}

