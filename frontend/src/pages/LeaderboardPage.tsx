import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import { api } from '@/utils/api';

interface LeaderboardUser {
  rankPosition: number;
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  rating: number;
  rankTier: string;
  rankColor: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  bestStreak: number;
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'rating' | 'winrate' | 'streak'>('rating');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [season, setSeason] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/leaderboard?type=${tab}`);
        setLeaderboard(res.data.data.leaderboard || []);
        setSeason(res.data.data.season || null);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [tab]);

  return (
    <div className="min-h-screen bg-dark-900 bg-grid-pattern relative flex flex-col">
      <ParticleBackground />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 relative z-10">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/menu')}
              className="text-xs text-white/50 hover:text-white mb-1 flex items-center gap-1 transition-colors"
            >
              <span>←</span> Back to Menu
            </button>
            <h1 className="font-game font-black text-3xl text-white">Global Leaderboard</h1>
            <p className="text-white/50 text-sm">Top ranked pen fighters competing in the global arena</p>
          </div>

          {/* Season Badge */}
          {season && (
            <div className="p-3 rounded-xl glass-card border-white/10 flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="text-[10px] uppercase font-mono text-neon-blue font-semibold">Active Season</div>
                <div className="font-bold text-white text-xs">{season.name}</div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
          {[
            { id: 'rating', label: '🏆 MMR Rating' },
            { id: 'winrate', label: '🎯 Top Win Rate' },
            { id: 'streak', label: '🔥 Best Win Streak' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === t.id
                  ? 'bg-neon-blue text-dark-900 font-bold shadow-neon-blue'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="glass-card overflow-hidden border-white/10">
          {loading ? (
            <div className="text-center py-16 text-white/40 text-sm">
              <span className="inline-block animate-spin text-2xl mb-2">⏳</span>
              <div>Loading champions...</div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16 text-white/40 text-sm">
              No players found in this category yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[11px] font-mono text-white/40 uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-center w-16"># Rank</th>
                    <th className="py-3.5 px-4">Player</th>
                    <th className="py-3.5 px-4">Tier</th>
                    <th className="py-3.5 px-4 text-right">Rating</th>
                    <th className="py-3.5 px-4 text-right">Win Rate</th>
                    <th className="py-3.5 px-4 text-right">W / L</th>
                    <th className="py-3.5 px-4 text-right">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard.map((player) => (
                    <motion.tr
                      key={player.userId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      {/* Rank Position */}
                      <td className="py-3 px-4 text-center font-game font-bold">
                        {player.rankPosition === 1 ? (
                          <span className="text-yellow-400 text-lg">🥇</span>
                        ) : player.rankPosition === 2 ? (
                          <span className="text-gray-300 text-lg">🥈</span>
                        ) : player.rankPosition === 3 ? (
                          <span className="text-amber-600 text-lg">🥉</span>
                        ) : (
                          <span className="text-white/60">#{player.rankPosition}</span>
                        )}
                      </td>

                      {/* Player Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}
                            alt={player.username}
                            className="w-9 h-9 rounded-full bg-white/10 object-cover"
                          />
                          <div>
                            <div className="font-bold text-white text-sm">{player.username}</div>
                            <div className="text-[10px] text-white/40 font-mono">
                              LVL {player.level}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rank Tier Badge */}
                      <td className="py-3 px-4">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-bold border inline-block"
                          style={{
                            color: player.rankColor,
                            borderColor: `${player.rankColor}40`,
                            backgroundColor: `${player.rankColor}15`,
                          }}
                        >
                          {player.rankTier}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                        {player.rating}
                      </td>

                      {/* Win Rate */}
                      <td className="py-3 px-4 text-right font-mono text-xs">
                        <span className={player.winRate >= 60 ? 'text-emerald-400 font-bold' : 'text-white/70'}>
                          {player.winRate}%
                        </span>
                      </td>

                      {/* W / L */}
                      <td className="py-3 px-4 text-right font-mono text-xs text-white/50">
                        <span className="text-emerald-400">{player.gamesWon}W</span> /{' '}
                        <span className="text-red-400">{player.gamesLost}L</span>
                      </td>

                      {/* Best Streak */}
                      <td className="py-3 px-4 text-right font-mono text-xs text-orange-400 font-bold">
                        {player.bestStreak > 0 ? `🔥 ${player.bestStreak}` : '-'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
