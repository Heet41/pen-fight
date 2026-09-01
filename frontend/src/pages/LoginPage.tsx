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

  return (
    <div className="min-h-screen bg-dark-900 bg-grid-pattern relative flex items-center justify-center p-4">
      <ParticleBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card max-w-md w-full p-8 relative z-10 border border-white/10 shadow-2xl backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <span className="text-4xl group-hover:rotate-12 transition-transform">✒️</span>
            <span className="font-game font-black text-2xl text-neon tracking-wider">
              PEN FIGHT
            </span>
          </Link>
          <h2 className="text-xl font-semibold text-white">Player Login</h2>
          <p className="text-white/50 text-xs mt-1">Enter your credentials to battle and earn XP</p>
        </div>

        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
          >
            {formError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
              Username or Email
            </label>
            <input
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="e.g. alice or alice@penfight.gg"
              className="input-field"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-neon w-full py-3.5 mt-2 font-game text-sm tracking-wider flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              'ENTER ARENA ➔'
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-white/40 text-xs uppercase tracking-wider">or</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGuest}
          disabled={isLoading}
          className="btn-ghost w-full py-3 text-sm flex items-center justify-center gap-2"
        >
          <span>👤</span> Play as Guest
        </button>

        {/* Quick Demo Logins for easy testing */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-white/40 text-xs text-center mb-3">Quick Demo Test Accounts:</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'alice', pass: 'Alice@12345', label: 'Alice (Plat)' },
              { name: 'bob', pass: 'Bob@12345', label: 'Bob (Gold)' },
              { name: 'admin', pass: 'Admin@12345', label: 'Admin' },
            ].map((acc) => (
              <button
                key={acc.name}
                type="button"
                onClick={() => handleQuickLogin(acc.name, acc.pass)}
                disabled={isLoading}
                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-colors truncate"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-white/50">
          Don't have an account?{' '}
          <Link to="/register" className="text-neon-blue hover:underline font-medium">
            Register now
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
