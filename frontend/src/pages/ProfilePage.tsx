import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/utils/api';
import { getRankFromRating, RANK_TIERS, getXpForLevel } from '@shared/index';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'history'>('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [achRes, histRes] = await Promise.all([
          api.get('/users/achievements'),
          api.get('/users/history'),
        ]);
        setAchievements(achRes.data.data.achievements || []);
        setMatchHistory(histRes.data.data.matches || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const rankTier = getRankFromRating(user.stats?.rating || 1000);
  const rankInfo = RANK_TIERS[rankTier];

  const currentLevel = user.xp?.currentLevel || 1;
  const currentTotalXp = user.xp?.totalXp || 0;
  const xpNeeded = getXpForLevel(currentLevel);
  const xpProgressPercent = Math.min(100, Math.round((currentTotalXp % xpNeeded) / (xpNeeded / 100)));

  return (
    <div className="min-h-screen bg-dark-900 bg-grid-pattern relative flex flex-col">
      <ParticleBackground />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 relative z-10">
        {/* Navigation & Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8 rounded-2xl glass-card border-white/10 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          {/* Avatar & Username */}
          <div className="flex items-center gap-5">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.username}
              className="w-20 h-20 rounded-2xl bg-white/10 object-cover border-2 border-neon-blue shadow-neon-blue"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-game font-bold text-2xl text-white">{user.username}</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/60">
                  {user.isGuest ? 'GUEST' : 'PLAYER'}
                </span>
              </div>
              <p className="text-white/40 text-xs mt-0.5">{user.email}</p>

              {/* Rank & Level Mini Tag */}
              <div className="flex items-center gap-2 mt-3">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                  style={{
                    color: rankInfo.color,
                    borderColor: `${rankInfo.color}40`,
                    backgroundColor: `${rankInfo.color}15`,
                  }}
                >
                  🎖️ {rankInfo.name} ({user.stats?.rating || 1000})
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ⚡ LVL {currentLevel}
                </span>
              </div>
            </div>
          </div>

          {/* XP Progress Card */}
          <div className="w-full md:w-64 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/60 font-semibold">Level {currentLevel} XP</span>
              <span className="text-neon-blue font-mono font-bold">{currentTotalXp} XP</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full transition-all duration-500"
                style={{ width: `${xpProgressPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-white/40 text-right mt-1">
              {xpProgressPercent}% to Level {currentLevel + 1}
            </div>
          </div>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
          {[
            { id: 'stats', label: '📊 Combat Stats' },
            { id: 'achievements', label: `🏆 Achievements (${achievements.filter((a) => a.isUnlocked).length}/${achievements.length})` },
            { id: 'history', label: '📜 Match History' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === t.id
                  ? 'bg-neon-purple text-white shadow-neon-purple'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Stats Grid */}
        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: 'Games Played', value: user.stats?.gamesPlayed || 0, icon: '🎮', color: 'text-cyan-400' },
              { label: 'Victories', value: user.stats?.gamesWon || 0, icon: '🏆', color: 'text-emerald-400' },
              { label: 'Defeats', value: user.stats?.gamesLost || 0, icon: '💀', color: 'text-red-400' },
              { label: 'Win Rate', value: `${Math.round(user.stats?.winRate || 0)}%`, icon: '🎯', color: 'text-yellow-400' },
              { label: 'Best Win Streak', value: user.stats?.bestWinStreak || 0, icon: '🔥', color: 'text-orange-400' },
              { label: 'Total Shots', value: user.stats?.totalShots || 0, icon: '🚀', color: 'text-purple-400' },
              { label: 'Peak MMR Rating', value: user.currentRank?.peakRating || user.stats?.rating || 1000, icon: '⭐', color: 'text-amber-400' },
              { label: 'Account Status', value: 'Active', icon: '🛡️', color: 'text-blue-400' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl glass-card border-white/10">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className={`font-game font-bold text-xl ${stat.color}`}>{stat.value}</div>
                <div className="text-white/40 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tab 2: Achievements */}
        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                  ach.isUnlocked
                    ? 'glass-card border-neon-purple/40 bg-purple-500/10 shadow-neon-purple'
                    : 'bg-white/5 border-white/5 opacity-50'
                }`}
              >
                <div className="text-3xl p-2 rounded-lg bg-white/10">{ach.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">{ach.name}</h3>
                    <span className="text-[10px] font-mono text-neon-blue font-bold">
                      +{ach.xpReward} XP
                    </span>
                  </div>
                  <p className="text-white/50 text-xs mt-0.5">{ach.description}</p>
                </div>
                <div>
                  {ach.isUnlocked ? (
                    <span className="text-emerald-400 text-sm font-bold">✓</span>
                  ) : (
                    <span className="text-white/20 text-sm font-mono">🔒</span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tab 3: Match History */}
        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {matchHistory.length === 0 ? (
              <div className="text-center py-12 text-white/40 text-sm glass-card p-6">
                No completed matches in history yet. Play an online or ranked match to see results!
              </div>
            ) : (
              matchHistory.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl glass-card border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-game font-bold text-xs px-2.5 py-1 rounded-lg ${
                        m.result === 'WIN'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {m.result}
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm">vs {m.opponentName}</div>
                      <div className="text-[10px] text-white/40 capitalize">
                        Mode: {m.mode.replace('_', ' ')} • Arena: {m.arena}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {m.ratingChange !== 0 && (
                      <div
                        className={`font-mono font-bold text-xs ${
                          m.ratingChange > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {m.ratingChange > 0 ? `+${m.ratingChange}` : m.ratingChange} MMR
                      </div>
                    )}
                    <div className="text-[10px] text-white/30 font-mono">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
