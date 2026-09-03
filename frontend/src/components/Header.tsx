import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getRankFromRating, RANK_TIERS } from '@shared/index';

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const rankTier = user?.stats?.rating ? getRankFromRating(user.stats.rating) : 'BRONZE';
  const rankInfo = RANK_TIERS[rankTier];

  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-dark-900/80 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-3 group">
        <span className="text-3xl group-hover:rotate-12 transition-transform">✒️</span>
        <div>
          <span className="font-game font-black text-lg text-neon tracking-wider block leading-none">
            PEN FIGHT
          </span>
          <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">
            ARENA V1.0
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            {/* Rank badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
              style={{
                borderColor: `${rankInfo.color}40`,
                backgroundColor: `${rankInfo.color}15`,
                color: rankInfo.color,
              }}
            >
              <span>🎖️</span>
              <span>{rankInfo.name}</span>
              <span className="opacity-60 text-[10px]">({user.stats?.rating || 1000})</span>
            </div>

            {/* Level badge */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-xs font-semibold">
              <span>⚡</span>
              <span>LVL {user.xp?.currentLevel || 1}</span>
            </div>

            {/* Profile Avatar / Username dropdown button */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={user.username}
                className="w-7 h-7 rounded-full bg-white/10 object-cover"
              />
              <span className="text-sm font-medium text-white max-w-[120px] truncate">
                {user.username}
              </span>
            </button>

            <button
  onClick={() => logout()}
  title="Log out"
  className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-red-300/80 transition-all duration-300 hover:border-red-400/40 hover:bg-red-400/[0.12] hover:text-red-200"
>
  <span>🚪</span>
  <span>LOG OUT</span>
</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-xs py-2 px-4">
              Sign In
            </Link>
            <Link to="/register" className="btn-neon text-xs py-2 px-4">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
