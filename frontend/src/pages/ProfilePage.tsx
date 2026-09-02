import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/utils/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [achievements, setAchievements] = useState<any[]>([]);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    'stats' | 'achievements' | 'history'
  >('stats');
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
        // Ignore fetch errors.
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const gamesPlayed = user.stats?.gamesPlayed || 0;
  const gamesWon = user.stats?.gamesWon || 0;
  const gamesLost = user.stats?.gamesLost || 0;
  const winRate = Math.round(user.stats?.winRate || 0);
  const bestWinStreak = user.stats?.bestWinStreak || 0;
  const totalShots = user.stats?.totalShots || 0;

  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.isUnlocked
  ).length;

  return (
    <div className="min-h-screen bg-dark-900 text-white relative overflow-hidden">
      <ParticleBackground />

      {/* ─── Atmospheric lighting ─────────────────────────────────────────── */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-[10%] h-[500px] w-[500px] rounded-full bg-neon-blue/[0.045] blur-[140px]" />
        <div className="absolute top-[35%] right-[-15%] h-[550px] w-[550px] rounded-full bg-neon-purple/[0.045] blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[35%] h-[450px] w-[450px] rounded-full bg-neon-green/[0.025] blur-[140px]" />
      </div>

      <Header />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">

        {/* ─── Profile Header ─────────────────────────────────────────────── */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]"
        >
          {/* Decorative glow */}

          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-neon-blue/[0.07] blur-[90px]" />

          <div className="absolute inset-0 bg-grid-pattern opacity-[0.12]" />

          <div className="relative p-6 sm:p-8">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              {/* Identity */}

              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-neon-blue/20 blur-xl" />

                  <img
                    src={
                      user.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                    }
                    alt={user.username}
                    className="relative h-20 w-20 rounded-2xl border border-neon-blue/40 bg-white/10 object-cover shadow-[0_0_25px_rgba(0,212,255,0.15)] sm:h-24 sm:w-24"
                  />

                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-dark-900 bg-neon-green text-[8px] text-dark-900">
                    ✓
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-neon-blue/50">
                      // PLAYER PROFILE
                    </span>

                    <span className="rounded-full border border-neon-green/20 bg-neon-green/[0.05] px-2 py-0.5 font-mono text-[7px] tracking-wider text-neon-green/60">
                      {user.isGuest ? 'GUEST' : 'PLAYER'}
                    </span>
                  </div>

                  <h1 className="truncate font-game text-2xl font-black tracking-wider text-white sm:text-3xl">
                    {user.username}
                  </h1>

                  <p className="mt-1 truncate text-xs text-white/30">
                    {user.email}
                  </p>

                  <p className="mt-3 max-w-md text-xs leading-relaxed text-white/35">
                    Fighter profile and combat record.
                  </p>
                </div>
              </div>

              {/* Quick record */}

              <div className="grid grid-cols-3 gap-2 sm:min-w-[300px]">
                <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3 text-center">
                  <div className="font-game text-xl font-bold text-neon-blue">
                    {gamesPlayed}
                  </div>

                  <div className="mt-1 font-mono text-[7px] tracking-[0.15em] text-white/20">
                    MATCHES
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3 text-center">
                  <div className="font-game text-xl font-bold text-neon-green">
                    {gamesWon}
                  </div>

                  <div className="mt-1 font-mono text-[7px] tracking-[0.15em] text-white/20">
                    WINS
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3 text-center">
                  <div className="font-game text-xl font-bold text-yellow-400">
                    {winRate}%
                  </div>

                  <div className="mt-1 font-mono text-[7px] tracking-[0.15em] text-white/20">
                    WIN RATE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─── Navigation Tabs ───────────────────────────────────────────── */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 flex overflow-x-auto border-b border-white/[0.07] pb-2"
        >
          <div className="flex min-w-max gap-1">
            {[
              {
                id: 'stats',
                label: 'COMBAT STATS',
                icon: '📊',
              },
              {
                id: 'achievements',
                label: `ACHIEVEMENTS ${achievements.length > 0 ? `(${unlockedAchievements}/${achievements.length})` : ''}`,
                icon: '🏆',
              },
              {
                id: 'history',
                label: 'MATCH HISTORY',
                icon: '📜',
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as 'stats' | 'achievements' | 'history'
                  )
                }
                className={`rounded-xl px-4 py-2.5 font-mono text-[9px] tracking-[0.12em] transition-all ${
                  activeTab === tab.id
                    ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20'
                    : 'border border-transparent text-white/30 hover:bg-white/[0.04] hover:text-white/70'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── Loading ───────────────────────────────────────────────────── */}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-neon-blue" />

              <div className="font-mono text-[8px] tracking-[0.25em] text-white/20">
                LOADING PROFILE DATA
              </div>
            </div>
          </div>
        )}

        {/* ─── Combat Stats ──────────────────────────────────────────────── */}

        {!loading && activeTab === 'stats' && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="mb-5">
              <div className="font-mono text-[8px] tracking-[0.3em] text-neon-blue/45">
                // PERFORMANCE DATA
              </div>

              <h2 className="mt-1 font-game text-xl font-bold tracking-wider">
                COMBAT STATISTICS
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                {
                  label: 'GAMES PLAYED',
                  value: gamesPlayed,
                  icon: '🎮',
                  accent: 'text-neon-blue',
                },
                {
                  label: 'VICTORIES',
                  value: gamesWon,
                  icon: '🏆',
                  accent: 'text-neon-green',
                },
                {
                  label: 'DEFEATS',
                  value: gamesLost,
                  icon: '💀',
                  accent: 'text-red-400',
                },
                {
                  label: 'WIN RATE',
                  value: `${winRate}%`,
                  icon: '🎯',
                  accent: 'text-yellow-400',
                },
                {
                  label: 'BEST STREAK',
                  value: bestWinStreak,
                  icon: '🔥',
                  accent: 'text-orange-400',
                },
                {
                  label: 'TOTAL SHOTS',
                  value: totalShots,
                  icon: '🚀',
                  accent: 'text-neon-purple',
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
                >
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/[0.02] blur-2xl transition-opacity group-hover:opacity-100" />

                  <div className="relative">
                    <div className="mb-4 text-xl">{stat.icon}</div>

                    <div
                      className={`font-game text-2xl font-bold ${stat.accent}`}
                    >
                      {stat.value}
                    </div>

                    <div className="mt-1 font-mono text-[7px] tracking-[0.16em] text-white/20">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Record summary */}

            <div className="grid gap-4 pt-2 md:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="font-mono text-[8px] tracking-[0.25em] text-white/20">
                  // MATCH RECORD
                </div>

                <div className="mt-5 flex items-end gap-8">
                  <div>
                    <div className="font-game text-4xl font-black text-neon-green">
                      {gamesWon}
                    </div>
                    <div className="mt-1 font-mono text-[7px] tracking-wider text-white/20">
                      WINS
                    </div>
                  </div>

                  <div className="pb-2 text-white/15">—</div>

                  <div>
                    <div className="font-game text-4xl font-black text-red-400">
                      {gamesLost}
                    </div>
                    <div className="mt-1 font-mono text-[7px] tracking-wider text-white/20">
                      LOSSES
                    </div>
                  </div>
                </div>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-blue transition-all duration-700"
                    style={{ width: `${winRate}%` }}
                  />
                </div>

                <div className="mt-2 flex justify-between font-mono text-[7px] tracking-wider text-white/15">
                  <span>WIN RATE</span>
                  <span>{winRate}%</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="font-mono text-[8px] tracking-[0.25em] text-white/20">
                  // PLAY STYLE
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-xs text-white/40">
                        Matches played
                      </span>

                      <span className="font-mono text-xs text-white/60">
                        {gamesPlayed}
                      </span>
                    </div>

                    <div className="mt-2 h-1 rounded-full bg-white/[0.06]">
                      <div className="h-full w-full rounded-full bg-neon-blue/40" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-xs text-white/40">
                        Best win streak
                      </span>

                      <span className="font-mono text-xs text-orange-400/70">
                        {bestWinStreak}
                      </span>
                    </div>

                    <div className="mt-2 h-1 rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-orange-400/50"
                        style={{
                          width: `${Math.min(100, bestWinStreak * 10)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-xs text-white/40">
                        Shots taken
                      </span>

                      <span className="font-mono text-xs text-neon-purple/70">
                        {totalShots}
                      </span>
                    </div>

                    <div className="mt-2 h-1 rounded-full bg-white/[0.06]">
                      <div className="h-full w-full rounded-full bg-neon-purple/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ─── Achievements ──────────────────────────────────────────────── */}

        {!loading && activeTab === 'achievements' && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-5">
              <div className="font-mono text-[8px] tracking-[0.3em] text-neon-purple/50">
                // MILESTONES
              </div>

              <h2 className="mt-1 font-game text-xl font-bold tracking-wider">
                ACHIEVEMENTS
              </h2>

              <p className="mt-2 text-xs text-white/30">
                {unlockedAchievements} of {achievements.length} achievements unlocked.
              </p>
            </div>

            {achievements.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] py-14 text-center">
                <div className="text-3xl">🏆</div>

                <p className="mt-3 text-sm text-white/30">
                  No achievements available yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ y: -2 }}
                    className={`group flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                      achievement.isUnlocked
                        ? 'border-neon-purple/20 bg-neon-purple/[0.045]'
                        : 'border-white/[0.06] bg-white/[0.02] opacity-50'
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-2xl ${
                        achievement.isUnlocked
                          ? 'border-neon-purple/20 bg-neon-purple/[0.08]'
                          : 'border-white/[0.06] bg-white/[0.03]'
                      }`}
                    >
                      {achievement.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-white">
                          {achievement.name}
                        </h3>

                        {achievement.isUnlocked && (
                          <span className="font-mono text-[8px] text-neon-green">
                            UNLOCKED
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs leading-relaxed text-white/30">
                        {achievement.description}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {achievement.isUnlocked ? (
                        <span className="text-neon-green">✓</span>
                      ) : (
                        <span className="text-white/15">🔒</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* ─── Match History ─────────────────────────────────────────────── */}

        {!loading && activeTab === 'history' && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-5">
              <div className="font-mono text-[8px] tracking-[0.3em] text-neon-blue/45">
                // COMBAT LOG
              </div>

              <h2 className="mt-1 font-game text-xl font-bold tracking-wider">
                MATCH HISTORY
              </h2>
            </div>

            {matchHistory.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] py-14 text-center">
                <div className="text-3xl">🎮</div>

                <p className="mt-3 text-sm text-white/30">
                  No completed matches yet.
                </p>

                <button
                  onClick={() => navigate('/game/local')}
                  className="mt-5 rounded-xl border border-neon-blue/20 bg-neon-blue/[0.05] px-5 py-2.5 font-game text-xs font-bold tracking-wider text-neon-blue transition-all hover:bg-neon-blue/10"
                >
                  START A MATCH →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {matchHistory.map((match) => (
                  <motion.div
                    key={match.id}
                    whileHover={{ x: 3 }}
                    className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:border-white/15 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <span
                        className={`shrink-0 rounded-lg border px-2.5 py-1 font-game text-[9px] font-bold tracking-wider ${
                          match.result === 'WIN'
                            ? 'border-neon-green/20 bg-neon-green/[0.06] text-neon-green'
                            : 'border-red-400/20 bg-red-400/[0.06] text-red-400'
                        }`}
                      >
                        {match.result}
                      </span>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white">
                          VS {match.opponentName}
                        </div>

                        <div className="mt-1 truncate font-mono text-[8px] tracking-wider text-white/20">
                          {String(match.mode || 'match').replace(/_/g, ' ').toUpperCase()}
                          {' · '}
                          {match.arena || 'DEFAULT ARENA'}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <div className="font-mono text-[9px] text-white/25">
                        {new Date(match.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* ─── Footer status ─────────────────────────────────────────────── */}

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] pt-5 sm:flex-row">
          <span className="font-mono text-[8px] tracking-[0.25em] text-white/15">
            PEN FIGHT // PLAYER PROFILE
          </span>

          <span className="font-mono text-[8px] tracking-[0.2em] text-white/10">
            COMBAT DATA SYNCHRONIZED
          </span>
        </div>
      </main>
    </div>
  );
}