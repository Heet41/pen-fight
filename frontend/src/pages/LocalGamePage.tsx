import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import GameArena from '@/components/GameArena';
import { PlayerSide, PenState } from '@shared/index';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/utils/api';

export default function LocalGamePage() {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [winner, setWinner] = useState<PlayerSide | null>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });

  const handleTurnEnd = async (_p1: PenState, _p2: PenState, matchWinner?: PlayerSide) => {
    if (matchWinner) {
      setWinner(matchWinner);
      if (matchWinner === 'player1') {
        setScores((s) => ({ ...s, p1: s.p1 + 1 }));
        toast.success('Player 1 Wins the Round!');
      } else {
        setScores((s) => ({ ...s, p2: s.p2 + 1 }));
        toast.success('Player 2 Wins the Round!');
      }

      if (isAuthenticated) {
        try {
          const res = await api.post('/users/record-match', {
            mode: 'local',
            isWin: matchWinner === 'player1',
            shots: 6,
          });
          const data = res.data?.data;
          if (data) {
            toast.success(`+${data.xpGained} XP Earned!`, { icon: '⚡' });
            if (data.leveledUp) {
              toast.success(`🎉 LEVEL UP! Reached Level ${data.currentLevel}!`);
            }
            checkAuth();
          }
        } catch {
          // ignore
        }
      }
    }
  };

  const handleRematch = () => {
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-grid-pattern relative flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col items-center justify-between">
        {/* Navigation & Match Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/menu')}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>←</span> Back to Menu
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-cyan-400 font-bold">P1 ({scores.p1})</span>
              <span className="text-white/30">vs</span>
              <span className="text-orange-400 font-bold">P2 ({scores.p2})</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Local 2P
            </span>
          </div>
        </div>

        {/* Game Canvas Arena */}
        <GameArena
          mode="local"
          p1Name="Player 1"
          p2Name="Player 2"
          p1Avatar="https://api.dicebear.com/7.x/bottts/svg?seed=P1"
          p2Avatar="https://api.dicebear.com/7.x/bottts/svg?seed=P2"
          onTurnEnd={handleTurnEnd}
          winner={winner}
          onRematch={handleRematch}
        />
      </main>
    </div>
  );
}
