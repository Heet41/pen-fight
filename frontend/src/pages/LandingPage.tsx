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
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const penVariants = {
  idle: {
    rotate: [-5, 5, -5],
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─── Feature cards data ───────────────────────────────────────────────────────
const features = [
  {
    icon: '👥',
    title: 'Local 2-Player',
    desc: 'Battle friends on the same screen, no setup required',
    color: 'from-green-500/10 to-emerald-500/10',
    border: 'border-green-500/20',
  },
  {
    icon: '🤖',
    title: 'Smart AI Bot',
    desc: 'Test your skills against Easy, Medium, and Hard AI',
    color: 'from-purple-500/10 to-pink-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: '🏆',
    title: 'Leaderboard & XP',
    desc: 'Earn XP, level up, and compete on the global leaderboard',
    color: 'from-yellow-500/10 to-orange-500/10',
    border: 'border-yellow-500/20',
  },
  {
    icon: '🎨',
    title: 'Locker & Skins',
    desc: 'Unlock and equip unique pen skins, effects, and titles',
    color: 'from-cyan-500/10 to-blue-500/10',
    border: 'border-cyan-500/20',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-dark-900 bg-grid-pattern relative overflow-hidden"
    >
      {/* Particle / animated background */}
      <ParticleBackground />

      {/* Ambient glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-neon-green/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
      </div>

      {/* ─── Navigation ─────────────────────────────────────────────────────── */}
      <motion.nav
        variants={itemVariants}
        className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">✒️</span>
          <span className="font-game font-bold text-lg text-neon-blue tracking-wider">
            PEN FIGHT
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHowToPlay(true)}
            className="btn-ghost text-sm py-2 px-4 hidden sm:flex"
          >
            How to Play
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-neon text-sm py-2 px-4"
          >
            Login
          </button>
        </div>
      </motion.nav>

      {/* ─── Hero Section ────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-12 pb-20">
        {/* Animated pen icon */}
        <motion.div
          variants={penVariants}
          animate="idle"
          className="text-7xl md:text-8xl mb-8 select-none"
          style={{ filter: 'drop-shadow(0 0 30px rgba(0, 212, 255, 0.6))' }}
        >
          ✒️
        </motion.div>

        {/* Title */}
        <motion.div variants={itemVariants} className="mb-4">
          <h1 className="font-game font-black text-5xl md:text-7xl lg:text-8xl text-neon tracking-tight leading-none">
            PEN FIGHT
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-white/60 mb-12 max-w-lg leading-relaxed"
        >
          The classic desk game, reimagined. Battle friends online, conquer AI, 
          and climb the global leaderboard.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <button
            onClick={() => navigate('/menu')}
            className="btn-neon text-base px-10 py-4 font-game tracking-wider"
          >
            ▶ PLAY NOW
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-ghost text-base px-8 py-4"
          >
            Sign In
          </button>
          <button
            onClick={() => setShowHowToPlay(true)}
            className="btn-ghost text-base px-8 py-4 sm:hidden"
          >
            How to Play
          </button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          variants={itemVariants}
          className="glass-card px-8 py-4 flex gap-8 md:gap-12 mb-16"
        >
          {[
            { label: 'Players', value: '10K+' },
            { label: 'Matches', value: '250K+' },
            { label: 'Countries', value: '80+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-game font-bold text-xl md:text-2xl text-neon-blue">
                {stat.value}
              </div>
              <div className="text-white/40 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ─── Feature Cards ──────────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className={`glass-card border ${feature.border} bg-gradient-to-br ${feature.color} p-5 text-left cursor-default`}
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-white mb-1 text-sm">{feature.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Quick Tutorial Preview ─────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-6 md:p-8 max-w-2xl w-full"
        >
          <h2 className="font-game text-lg font-bold text-center mb-6 text-white/80">
            HOW TO PLAY
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: '1', icon: '🎯', text: 'Aim your pen' },
              { step: '2', icon: '⚡', text: 'Choose your power' },
              { step: '3', icon: '🚀', text: 'Shoot!' },
              { step: '4', icon: '💥', text: 'Knock opponent out' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-neon-blue/20 border border-neon-blue/30 flex items-center justify-center text-neon-blue font-game font-bold text-sm">
                  {s.step}
                </div>
                <div className="text-2xl">{s.icon}</div>
                <div className="text-white/60 text-xs">{s.text}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="text-neon-blue text-sm hover:text-neon-purple transition-colors duration-200 underline underline-offset-2"
            >
              Read full guide →
            </button>
          </div>
        </motion.div>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <motion.footer
        variants={itemVariants}
        className="relative z-10 text-center py-6 text-white/20 text-xs border-t border-white/5"
      >
        <p>© 2026 Pen Fight. Built with ❤️ for gamers worldwide.</p>
      </motion.footer>

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
    </motion.div>
  );
}
