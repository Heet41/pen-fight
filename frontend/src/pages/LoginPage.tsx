import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import ParticleBackground from '@/components/ParticleBackground';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, guestLogin, isLoading } = useAuthStore();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!emailOrUsername.trim() || !password.trim()) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login(emailOrUsername, password);
      toast.success('Welcome back to the Arena!');
      navigate('/menu');
    } catch (err: any) {
      setFormError(err.message || 'Invalid credentials');
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

  const handleQuickLogin = async (username: string, pass: string) => {
    setEmailOrUsername(username);
    setPassword(pass);

    try {
      await login(username, pass);
      toast.success(`Logged in as ${username}!`);
      navigate('/menu');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  const demoAccounts = [
    { name: 'alice', pass: 'Alice@12345', label: 'ALICE', rank: 'PLATINUM' },
    { name: 'bob', pass: 'Bob@12345', label: 'BOB', rank: 'GOLD' },
    { name: 'admin', pass: 'Admin@12345', label: 'ADMIN', rank: 'STAFF' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white relative overflow-hidden flex items-center justify-center px-4 py-8 sm:px-6">

      <ParticleBackground />

      {/* ─── Ambient lighting ─────────────────────────────────────────────── */}

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 left-[10%] h-[450px] w-[450px] rounded-full bg-neon-blue/[0.05] blur-[140px]" />
        <div className="absolute -bottom-40 right-[5%] h-[450px] w-[450px] rounded-full bg-neon-purple/[0.05] blur-[140px]" />
      </div>

      {/* ─── Decorative HUD ──────────────────────────────────────────────── */}

      <div className="fixed left-5 top-5 hidden h-12 w-12 border-l border-t border-neon-blue/20 sm:block" />
      <div className="fixed right-5 top-5 hidden h-12 w-12 border-r border-t border-neon-blue/20 sm:block" />
      <div className="fixed bottom-5 left-5 hidden h-12 w-12 border-b border-l border-neon-blue/20 sm:block" />
      <div className="fixed bottom-5 right-5 hidden h-12 w-12 border-b border-r border-neon-blue/20 sm:block" />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="grid overflow-hidden rounded-3xl border border-white/[0.08] bg-dark-900/70 shadow-2xl backdrop-blur-2xl lg:grid-cols-[0.9fr_1.1fr]">

          {/* ─── Left visual panel ──────────────────────────────────────── */}

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

            {/* Arena illustration */}

            <div className="relative flex flex-1 items-center justify-center py-12">
              <div className="relative h-64 w-64">

                <div className="absolute inset-5 rounded-full border border-neon-blue/10" />
                <div className="absolute inset-12 rounded-full border border-dashed border-white/[0.08] animate-[spin_20s_linear_infinite]" />

                <div className="absolute inset-16 rotate-45 rounded-3xl border border-neon-blue/20 bg-neon-blue/[0.025]" />

                <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent" />

                <div className="absolute left-1/2 top-1/2 h-full w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-neon-blue/15 to-transparent" />

                <motion.div
                  animate={{
                    x: [0, 5, 0],
                    y: [0, -5, 0],
                    rotate: [-12, -7, -12],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute left-8 top-20"
                >
                  <div className="h-20 w-5 rounded-full bg-gradient-to-b from-neon-blue to-cyan-600 shadow-[0_0_25px_rgba(0,212,255,0.5)]" />
                  <span className="absolute -left-1 -top-5 font-mono text-[7px] tracking-widest text-neon-blue/50">
                    P1
                  </span>
                </motion.div>

                <motion.div
                  animate={{
                    x: [0, -5, 0],
                    y: [0, 5, 0],
                    rotate: [12, 7, 12],
                  }}
                  transition={{
                    duration: 3.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute right-8 top-20"
                >
                  <div className="h-20 w-5 rounded-full bg-gradient-to-b from-neon-purple to-purple-700 shadow-[0_0_25px_rgba(168,85,247,0.5)]" />
                  <span className="absolute -right-1 -top-5 font-mono text-[7px] tracking-widest text-neon-purple/50">
                    P2
                  </span>
                </motion.div>

                <motion.div
                  animate={{
                    x: [-28, 28, -28],
                    opacity: [0.2, 1, 0.2],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_14px_white]"
                />

                <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-dark-900/80">
                  <div className="h-5 w-5 rounded-full border border-neon-blue/40" />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 font-mono text-[8px] tracking-[0.3em] text-neon-blue/40">
                // PLAYER AUTHENTICATION
              </div>

              <h2 className="font-game text-2xl font-black tracking-wider">
                READY TO FIGHT?
              </h2>

              <p className="mt-2 max-w-xs text-xs leading-relaxed text-white/30">
                Sign in to track your progress, earn XP, unlock cosmetics,
                and climb the leaderboard.
              </p>
            </div>
          </div>

          {/* ─── Login panel ────────────────────────────────────────────── */}

          <div className="p-6 sm:p-8 lg:p-10">

            {/* Mobile logo */}

            <div className="mb-8 lg:hidden">
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

            <div className="mb-7">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-green shadow-[0_0_8px_rgba(34,197,94,0.8)]" />

                <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-neon-green/60">
                  Authentication online
                </span>
              </div>

              <h1 className="font-game text-2xl font-black tracking-wider sm:text-3xl">
                PLAYER LOGIN
              </h1>

              <p className="mt-2 text-xs leading-relaxed text-white/35">
                Enter your credentials to access the arena.
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
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Username / Email
                </label>

                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="ENTER IDENTIFIER"
                  className="input-field h-12 rounded-xl border-white/[0.08] bg-white/[0.025] font-mono text-xs tracking-wide placeholder:text-white/15 focus:border-neon-blue/40 focus:bg-neon-blue/[0.02]"
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
                  placeholder="ENTER PASSWORD"
                  className="input-field h-12 rounded-xl border-white/[0.08] bg-white/[0.025] font-mono text-xs tracking-wide placeholder:text-white/15 focus:border-neon-blue/40 focus:bg-neon-blue/[0.02]"
                  disabled={isLoading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-neon-blue font-game text-xs font-black tracking-[0.18em] text-dark-900 shadow-[0_0_25px_rgba(0,212,255,0.15)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,212,255,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <span className="animate-spin">◌</span>
                      AUTHENTICATING
                    </>
                  ) : (
                    <>
                      ENTER ARENA
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </span>

                <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-500 group-hover:translate-x-full" />
              </button>
            </form>

            {/* Divider */}

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.07]" />
              <span className="font-mono text-[8px] tracking-[0.25em] text-white/20">
                OR
              </span>
              <div className="h-px flex-1 bg-white/[0.07]" />
            </div>

            {/* Guest */}

            <button
              type="button"
              onClick={handleGuest}
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] text-xs font-semibold text-white/45 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            >
              <span>👤</span>
              PLAY AS GUEST
            </button>

            {/* Demo accounts */}

            <div className="mt-7 border-t border-white/[0.07] pt-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[8px] tracking-[0.2em] text-white/20">
                  DEVELOPMENT ACCESS
                </span>

                <span className="rounded-full border border-yellow-400/15 bg-yellow-400/[0.04] px-2 py-0.5 font-mono text-[7px] text-yellow-300/40">
                  TEST
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.name}
                    type="button"
                    onClick={() =>
                      handleQuickLogin(account.name, account.pass)
                    }
                    disabled={isLoading}
                    className="group rounded-xl border border-white/[0.07] bg-white/[0.02] px-2 py-3 text-left transition-all duration-300 hover:border-neon-blue/25 hover:bg-neon-blue/[0.04] disabled:opacity-50"
                  >
                    <div className="text-[10px] font-bold text-white/55 transition-colors group-hover:text-white">
                      {account.label}
                    </div>

                    <div className="mt-1 font-mono text-[7px] tracking-wider text-white/20">
                      {account.rank}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Register */}

            <div className="mt-7 text-center text-xs text-white/25">
              NEW PLAYER?{' '}
              <Link
                to="/register"
                className="font-semibold text-neon-blue transition-colors hover:text-cyan-300"
              >
                CREATE ACCOUNT →
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
