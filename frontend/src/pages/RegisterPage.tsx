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
          <h2 className="text-xl font-semibold text-white">Create New Account</h2>
          <p className="text-white/50 text-xs mt-1">Join the competitive arena and build your stats</p>
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
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Inkmaster99"
              className="input-field"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              placeholder="Min. 6 characters"
              className="input-field"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
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
              'CREATE ACCOUNT ➔'
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

        <div className="mt-6 text-center text-sm text-white/50">
          Already have an account?{' '}
          <Link to="/login" className="text-neon-blue hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
