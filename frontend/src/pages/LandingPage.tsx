import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ParticleBackground from '@/components/ParticleBackground';
import HowToPlayModal from '@/components/HowToPlayModal';

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: 'easeOut',
    },
  },
};

// ─── Feature data ─────────────────────────────────────────────────────────────

const features = [
  {
    number: '01',
    icon: '👥',
    title: 'LOCAL BATTLE',
    subtitle: '2 PLAYERS',
    desc: 'Challenge a friend on the same screen.',
    accent: 'green',
  },
  {
    number: '02',
    icon: '🤖',
    title: 'AI ARENA',
    subtitle: '3 DIFFICULTIES',
    desc: 'Take on an adaptive AI opponent.',
    accent: 'purple',
  },
  {
    number: '03',
    icon: '🏆',
    title: 'RANKED MODE',
    subtitle: 'XP + LEADERBOARD',
    desc: 'Earn XP, climb levels, and compete.',
    accent: 'yellow',
  },
  {
    number: '04',
    icon: '🎨',
    title: 'LOCKER',
    subtitle: 'CUSTOMIZE',
    desc: 'Unlock skins, effects, and titles.',
    accent: 'blue',
  },
];

const stats = [
  { value: '10K+', label: 'PLAYERS' },
  { value: '250K+', label: 'MATCHES' },
  { value: '80+', label: 'COUNTRIES' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-dark-900 text-white relative overflow-hidden"
    >
      <ParticleBackground />

      {/* ─── Atmospheric background ────────────────────────────────────────── */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[15%] w-[500px] h-[500px] rounded-full bg-neon-blue/[0.06] blur-[140px]" />

        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-neon-purple/[0.07] blur-[150px]" />

        <div className="absolute bottom-[-20%] left-[35%] w-[500px] h-[500px] rounded-full bg-neon-green/[0.025] blur-[150px]" />
      </div>

      {/* ─── Navigation ─────────────────────────────────────────────────────── */}

      <motion.header
        variants={fadeUp}
        className="relative z-20 border-b border-white/[0.06] bg-dark-900/60 backdrop-blur-xl"
      >
        <nav className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-neon-blue/20 bg-neon-blue/5 transition-all duration-300 group-hover:border-neon-blue/50 group-hover:bg-neon-blue/10">
              <span className="text-lg">✒️</span>
            </div>

            <div className="text-left">
              <div className="font-game font-bold text-sm tracking-[0.18em] text-white">
                PEN<span className="text-neon-blue">FIGHT</span>
              </div>
              <div className="font-mono text-[7px] tracking-[0.3em] text-white/25">
                PHYSICS ARENA
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="hidden sm:inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/50 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
            >
              HOW TO PLAY
            </button>

            <button
              onClick={() => navigate('/login')}
              className="rounded-lg border border-neon-blue/30 bg-neon-blue/10 px-4 py-2 text-xs font-semibold text-neon-blue transition-all duration-300 hover:border-neon-blue/60 hover:bg-neon-blue/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]"
            >
              LOGIN
            </button>
          </div>
        </nav>
      </motion.header>

      {/* ─── Hero ───────────────────────────────────────────────────────────── */}

      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <section className="min-h-[calc(100vh-64px)] flex items-center py-14 sm:py-20 lg:py-24">
          <div className="w-full grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-8 items-center">

            {/* ─── Hero copy ───────────────────────────────────────────────── */}

            <div className="text-center lg:text-left">
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-neon-blue/20 bg-neon-blue/[0.04] px-3 py-1.5 mb-7"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-50 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.9)]" />
                </span>

                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-neon-blue/70">
                  Arena online
                </span>
              </motion.div>

              <motion.div variants={fadeUp}>
                <p className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-white/25 mb-4">
                  THE CLASSIC DESK GAME
                </p>

                <h1 className="font-game font-black text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.82] tracking-[-0.04em]">
                  <span className="block text-white">PEN</span>

                  <span className="block text-neon">
                    FIGHT
                  </span>
                </h1>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="mt-7 max-w-xl mx-auto lg:mx-0 text-sm sm:text-base lg:text-lg leading-relaxed text-white/45"
              >
                Aim. Calculate your shot. Knock your opponent out.
                <span className="text-white/70"> Simple rules. Serious battles.</span>
              </motion.p>

              {/* ─── CTA ───────────────────────────────────────────────────── */}

              <motion.div
                variants={fadeUp}
                className="mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
              >
                <button
                  onClick={() => navigate('/menu')}
                  className="group relative w-full sm:w-auto min-w-[190px] overflow-hidden rounded-xl bg-gradient-to-r from-neon-blue to-cyan-400 px-8 py-4 font-game text-sm font-black tracking-[0.15em] text-dark-900 shadow-[0_0_35px_rgba(0,212,255,0.2)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_55px_rgba(0,212,255,0.4)] active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <span>▶</span>
                    PLAY NOW
                  </span>

                  <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-500 group-hover:translate-x-full" />
                </button>

                <button
                  onClick={() => setShowHowToPlay(true)}
                  className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-medium text-white/60 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
                >
                  HOW TO PLAY
                </button>
              </motion.div>

              {/* ─── Stats ─────────────────────────────────────────────────── */}

              <motion.div
                variants={fadeUp}
                className="mt-10 pt-6 border-t border-white/[0.07] max-w-xl mx-auto lg:mx-0"
              >
                <div className="grid grid-cols-3">
                  {stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className={`text-center lg:text-left ${
                        index !== 0 ? 'border-l border-white/[0.07] pl-4' : ''
                      }`}
                    >
                      <div className="font-game font-bold text-lg sm:text-xl text-white">
                        {stat.value}
                      </div>

                      <div className="mt-1 font-mono text-[8px] tracking-[0.2em] text-white/25">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ─── Arena visual ────────────────────────────────────────────── */}

            <motion.div
              variants={fadeUp}
              className="relative flex items-center justify-center min-h-[360px] sm:min-h-[440px]"
            >
              {/* Decorative HUD corners */}

              <div className="absolute top-5 left-5 h-10 w-10 border-l border-t border-neon-blue/30" />
              <div className="absolute top-5 right-5 h-10 w-10 border-r border-t border-neon-blue/30" />
              <div className="absolute bottom-5 left-5 h-10 w-10 border-l border-b border-neon-blue/30" />
              <div className="absolute bottom-5 right-5 h-10 w-10 border-r border-b border-neon-blue/30" />

              {/* Arena */}

              <div className="relative w-[min(80vw,460px)] aspect-square">
                {/* Outer glow */}
                <div className="absolute inset-[8%] rounded-full bg-neon-blue/[0.04] blur-3xl" />

                {/* Orbit rings */}
                <div className="absolute inset-[10%] rounded-full border border-neon-blue/10" />
                <div className="absolute inset-[17%] rounded-full border border-dashed border-white/[0.08] animate-[spin_25s_linear_infinite]" />
                <div className="absolute inset-[28%] rounded-full border border-neon-purple/15" />

                {/* Arena square */}
                <div className="absolute inset-[15%] rotate-45 rounded-3xl border border-neon-blue/20 bg-neon-blue/[0.025] shadow-[0_0_70px_rgba(0,212,255,0.08)]" />

                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-px w-[65%] bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                  <div className="absolute h-[65%] w-px bg-gradient-to-b from-transparent via-neon-blue/20 to-transparent" />
                </div>

                {/* Player 1 */}
                <motion.div
                  animate={{
                    x: [0, 7, 0],
                    y: [0, -5, 0],
                    rotate: [-12, -7, -12],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute left-[18%] top-[39%] z-10"
                >
                  <div className="absolute inset-0 blur-xl bg-neon-blue/40" />

                  <div className="relative h-20 w-6 sm:h-24 sm:w-7 rounded-full bg-gradient-to-b from-neon-blue to-cyan-600 shadow-[0_0_25px_rgba(0,212,255,0.65)]">
                    <div className="absolute inset-x-1 top-2 h-2 rounded-full bg-white/30" />
                  </div>

                  <div className="absolute -left-4 -top-5 font-mono text-[7px] tracking-widest text-neon-blue/60">
                    P1
                  </div>
                </motion.div>

                {/* Player 2 */}
                <motion.div
                  animate={{
                    x: [0, -6, 0],
                    y: [0, 5, 0],
                    rotate: [12, 7, 12],
                  }}
                  transition={{
                    duration: 3.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute right-[18%] top-[39%] z-10"
                >
                  <div className="absolute inset-0 blur-xl bg-neon-purple/40" />

                  <div className="relative h-20 w-6 sm:h-24 sm:w-7 rounded-full bg-gradient-to-b from-neon-purple to-purple-700 shadow-[0_0_25px_rgba(168,85,247,0.55)]">
                    <div className="absolute inset-x-1 top-2 h-2 rounded-full bg-white/25" />
                  </div>

                  <div className="absolute -right-5 -top-5 font-mono text-[7px] tracking-widest text-neon-purple/60">
                    P2
                  </div>
                </motion.div>

                {/* Projectile */}
                <motion.div
                  animate={{
                    x: [-50, 50, -50],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)]"
                />

                {/* Center target */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-dark-900/70 backdrop-blur-md">
                    <div className="h-7 w-7 rounded-full border border-neon-blue/40">
                      <div className="h-full w-full rounded-full border border-neon-purple/30 scale-50" />
                    </div>
                  </div>
                </div>

                {/* HUD labels */}
                <div className="absolute left-[8%] top-[12%] font-mono text-[7px] tracking-[0.25em] text-white/20">
                  AIM SYSTEM
                </div>

                <div className="absolute right-[7%] bottom-[12%] text-right font-mono text-[7px] tracking-[0.25em] text-white/20">
                  PHYSICS // READY
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Game modes ───────────────────────────────────────────────────── */}

        <section className="pb-20 sm:pb-28">
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7"
          >
            <div>
              <div className="font-mono text-[9px] tracking-[0.35em] text-neon-blue/50 mb-2">
                // SELECT YOUR BATTLE
              </div>

              <h2 className="font-game text-xl sm:text-2xl font-bold tracking-wider text-white">
                ENTER THE ARENA
              </h2>
            </div>

            <div className="hidden sm:block font-mono text-[8px] tracking-[0.2em] text-white/20">
              04 GAME SYSTEMS
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.2 },
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
              >
                {/* Hover glow */}
                <div
                  className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-20 ${
                    feature.accent === 'purple'
                      ? 'bg-neon-purple'
                      : feature.accent === 'green'
                        ? 'bg-neon-green'
                        : feature.accent === 'yellow'
                          ? 'bg-yellow-400'
                          : 'bg-neon-blue'
                  }`}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-7">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {feature.icon}
                    </div>

                    <span className="font-mono text-[8px] tracking-[0.2em] text-white/20">
                      {feature.number}
                    </span>
                  </div>

                  <div className="font-mono text-[8px] tracking-[0.25em] text-white/25 mb-1">
                    {feature.subtitle}
                  </div>

                  <h3 className="font-game text-sm font-bold tracking-wider text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-white/35">
                    {feature.desc}
                  </p>

                  <div className="mt-5 h-px w-full bg-white/[0.06]" />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono text-[7px] tracking-[0.2em] text-white/15">
                      SYSTEM READY
                    </span>

                    <span className="text-xs text-white/20 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-neon-blue">
                      →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── How to play ──────────────────────────────────────────────────── */}

        <section className="pb-24">
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/[0.03] via-transparent to-neon-purple/[0.03]" />

            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <div className="font-mono text-[9px] tracking-[0.3em] text-neon-blue/50 mb-2">
                    // FOUR SIMPLE STEPS
                  </div>

                  <h2 className="font-game text-xl sm:text-2xl font-bold tracking-wider">
                    HOW TO PLAY
                  </h2>

                  <p className="mt-2 text-xs sm:text-sm text-white/35 max-w-md">
                    Master the angle and power. Every shot counts.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 max-w-2xl">
                  {[
                    ['01', '🎯', 'AIM'],
                    ['02', '⚡', 'POWER'],
                    ['03', '🚀', 'SHOOT'],
                    ['04', '💥', 'KNOCK OUT'],
                  ].map(([step, icon, text]) => (
                    <div
                      key={step}
                      className="text-center"
                    >
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-neon-blue/20 bg-neon-blue/5 font-game text-xs text-neon-blue">
                        {step}
                      </div>

                      <div className="mt-2 text-lg">{icon}</div>

                      <div className="mt-1 font-mono text-[8px] tracking-[0.15em] text-white/35">
                        {text}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowHowToPlay(true)}
                  className="shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-medium text-white/50 transition-all hover:border-neon-blue/30 hover:text-neon-blue"
                >
                  FULL GUIDE →
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}

      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-mono text-[8px] tracking-[0.25em] text-white/20">
            PEN FIGHT // PHYSICS ARENA
          </div>

          <div className="text-[10px] text-white/15">
            © 2026 Pen Fight · Built for gamers
          </div>
        </div>
      </footer>

      {/* ─── Modal ──────────────────────────────────────────────────────────── */}

      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
    </motion.div>
  );
}