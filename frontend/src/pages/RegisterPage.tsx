import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import ParticleBackground from '@/components/ParticleBackground';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, guestLogin, isLoading } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setFormError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      setFormError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      await register(username, email, password);
      toast.success('Account created! Welcome to Pen Fight!');
      navigate('/menu');
    } catch (err: any) {
      setFormError(err.message || 'Registration failed');
    }
  };

  const handleGuest = async () => {
    try {
      await guestLogin();
      toast.success('Entering as Guest!');
      navigate('/menu');
    } catch (err: any) {
      toast.error(err.message || 'Guest login failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white relative overflow-hidden flex items-center justify-center px-4 py-8 sm:px-6">

      <ParticleBackground />

      {/* ─── Ambient lighting ─────────────────────────────────────────────── */}

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 right-[10%] h-[450px] w-[450px] rounded-full bg-neon-purple/[0.05] blur-[140px]" />
        <div className="absolute -bottom-40 left-[5%] h-[450px] w-[450px] rounded-full bg-neon-blue/[0.05] blur-[140px]" />
      </div>

      {/* ─── HUD corners ─────────────────────────────────────────────────── */}

      <div className="fixed left-5 top-5 hidden h-12 w-12 border-l border-t border-neon-purple/20 sm:block" />
      <div className="fixed right-5 top-5 hidden h-12 w-12 border-r border-t border-neon-purple/20 sm:block" />
      <div className="fixed bottom-5 left-5 hidden h-12 w-12 border-b border-l border-neon-purple/20 sm:block" />
      <div className="fixed bottom-5 right-5 hidden h-12 w-12 border-b border-r border-neon-purple/20 sm:block" />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="grid overflow-hidden rounded-3xl border border-white/[0.08] bg-dark-900/70 shadow-2xl backdrop-blur-2xl lg:grid-cols-[0.9fr_1.1fr]">

          {/* ─── Left visual panel ───────────────────────────────────────── */}

          <div className="relative hidden overflow-hidden border-r border-white/[0.07] bg-white/[0.015] p-8 lg:flex lg:flex-col lg:justify-between">

            <div>
              <Link
                to="/"
                className="group inline-flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-blue/20 bg-neon-blue/[0.05] text-xl transition-transform duration-300 group-hover:rotate-6">
                  ✒️
                </div>

                <div>
                  <div className="font-game text-sm font-black tracking-[0.18em]">
                    PEN<span className="text-neon-blue">FIGHT</span>
                  </div>

                  <div className="font-mono text-[7px] tracking-[0.3em] text-white/20">
                    PHYSICS ARENA
                  </div>
                </div>
              </Link>
            </div>

            {/* Arena visual */}

            <div className="relative flex flex-1 items-center justify-center py-10">
              <div className="relative h-64 w-64">

                <div className="absolute inset-5 rounded-full border border-neon-purple/10" />

                <div className="absolute inset-12 rounded-full border border-dashed border-white/[0.08] animate-[spin_20s_linear_infinite]" />

                <div className="absolute inset-16 rotate-45 rounded-3xl border border-neon-purple/20 bg-neon-purple/[0.025]" />

                <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-neon-purple/20 to-transparent" />

                <div className="absolute left-1/2 top-1/2 h-full w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-neon-purple/15 to-transparent" />

                {/* Main pen */}

                <motion.div
                  animate={{
                    y: [0, -7, 0],
                    rotate: [-14, -7, -14],
                  }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="absolute inset-0 scale-150 rounded-full bg-neon-purple/20 blur-2xl" />

                  <div className="relative h-28 w-7 rounded-full bg-gradient-to-b from-neon-purple via-purple-500 to-purple-800 shadow-[0_0_30px_rgba(168,85,247,0.55)]">
                    <div className="absolute inset-x-1 top-3 h-2 rounded-full bg-white/25" />
                    <div className="absolute bottom-1 left-1/2 h-4 w-2 -translate-x-1/2 rounded-b-full bg-white/10" />
                  </div>
                </motion.div>

                {/* Orbit marker */}

                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute inset-2"
                >
                  <div className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.9)]" />
                </motion.div>

                <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-dark-900/40 backdrop-blur-md">
                  <div className="h-5 w-5 rounded-full border border-neon-purple/40" />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 font-mono text-[8px] tracking-[0.3em] text-neon-purple/40">
                // NEW PLAYER REGISTRATION
              </div>

              <h2 className="font-game text-2xl font-black tracking-wider">
                BUILD YOUR PROFILE.
              </h2>

              <p className="mt-2 max-w-xs text-xs leading-relaxed text-white/30">
                Create your fighter identity and start earning XP,
                achievements, and cosmetics.
              </p>
            </div>
          </div>

          {/* ─── Registration panel ─────────────────────────────────────── */}

          <div className="p-6 sm:p-8 lg:p-10">

            {/* Mobile logo */}

            <div className="mb-7 lg:hidden">
              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neon-blue/20 bg-neon-blue/[0.05]">
                  ✒️
                </div>

                <div className="font-game text-sm font-black tracking-[0.18em]">
                  PEN<span className="text-neon-blue">FIGHT</span>
                </div>
              </Link>
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-purple shadow-[0_0_8px_rgba(168,85,247,0.8)]" />

                <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-neon-purple/60">
                  Registration terminal
                </span>
              </div>

              <h1 className="font-game text-2xl font-black tracking-wider sm:text-3xl">
                CREATE PLAYER
              </h1>

              <p className="mt-2 text-xs leading-relaxed text-white/35">
                Register your fighter and enter the competitive arena.
              </p>
            </div>

            {/* Error */}

            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs text-red-300"
              >
                <span>⚠</span>
                <span>{formError}</span>
              </motion.div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Player Name
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="CHOOSE USERNAME"
                  className="input-field h-11 rounded-xl border-white/[0.08] bg-white/[0.025] font-mono text-xs tracking-wide placeholder:text-white/15 focus:border-neon-purple/40 focus:bg-neon-purple/[0.02]"
                  disabled={isLoading}
                  required
                />

                <div className="mt-1.5 font-mono text-[7px] tracking-wider text-white/15">
                  MINIMUM 3 CHARACTERS
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER EMAIL"
                  className="input-field h-11 rounded-xl border-white/[0.08] bg-white/[0.025] font-mono text-xs tracking-wide placeholder:text-white/15 focus:border-neon-purple/40 focus:bg-neon-purple/[0.02]"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="CREATE PASSWORD"
                  className="input-field h-11 rounded-xl border-white/[0.08] bg-white/[0.025] font-mono text-xs tracking-wide placeholder:text-white/15 focus:border-neon-purple/40 focus:bg-neon-purple/[0.02]"
                  disabled={isLoading}
                  required
                />

                <div className="mt-1.5 font-mono text-[7px] tracking-wider text-white/15">
                  MINIMUM 6 CHARACTERS
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="REPEAT PASSWORD"
                  className="input-field h-11 rounded-xl border-white/[0.08] bg-white/[0.025] font-mono text-xs tracking-wide placeholder:text-white/15 focus:border-neon-purple/40 focus:bg-neon-purple/[0.02]"
                  disabled={isLoading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-neon-purple font-game text-xs font-black tracking-[0.18em] text-white shadow-[0_0_25px_rgba(168,85,247,0.15)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <span className="animate-spin">◌</span>
                      CREATING PLAYER
                    </>
                  ) : (
                    <>
                      CREATE ACCOUNT
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </span>

                <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
              </button>
            </form>

            {/* Guest divider */}

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.07]" />

              <span className="font-mono text-[8px] tracking-[0.25em] text-white/20">
                OR
              </span>

              <div className="h-px flex-1 bg-white/[0.07]" />
            </div>

            <button
              type="button"
              onClick={handleGuest}
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] text-xs font-semibold text-white/45 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            >
              <span>👤</span>
              PLAY AS GUEST
            </button>

            {/* Sign in */}

            <div className="mt-7 text-center text-xs text-white/25">
              ALREADY A PLAYER?{' '}
              <Link
                to="/login"
                className="font-semibold text-neon-blue transition-colors hover:text-cyan-300"
              >
                SIGN IN →
              </Link>
            </div>

            <div className="mt-5 text-center">
              <Link
                to="/"
                className="font-mono text-[8px] tracking-[0.2em] text-white/15 transition-colors hover:text-white/40"
              >
                ← RETURN TO HOME
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
