import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import GameArena from '@/components/GameArena';
import { PlayerSide, PenState } from '@shared/index';
import { AIBot, AIDifficulty } from '@shared/ai';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/utils/api';

export default function AIGamePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [winner, setWinner] = useState<PlayerSide | null>(null);
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [isAiThinking, setIsAiThinking] = useState(false);

  const pensRef = useRef<{ p1: PenState; p2: PenState }>({
    p1: { id: 'player1', x: 180, y: 250, velocityX: 0, velocityY: 0, radius: 18, mass: 1.0, isOut: false },
    p2: { id: 'player2', x: 580, y: 250, velocityX: 0, velocityY: 0, radius: 18, mass: 1.0, isOut: false },
  });

  const handleTurnEnd = async (p1: PenState, p2: PenState, matchWinner?: PlayerSide) => {
    pensRef.current = { p1, p2 };

    if (matchWinner) {
      setWinner(matchWinner);
      const isPlayerWin = matchWinner === 'player1';

      if (isPlayerWin) {
        setScores((s) => ({ ...s, player: s.player + 1 }));
        toast.success(`You defeated the ${difficulty.toUpperCase()} AI!`);
      } else {
        setScores((s) => ({ ...s, ai: s.ai + 1 }));
        toast.error('AI won this round! Try again.');
      }

      // Record match result and grant XP if authenticated
      if (isAuthenticated) {
        try {
          const res = await api.post('/users/record-match', {
            mode: `ai_${difficulty}`,
            isWin: isPlayerWin,
            shots: 6,
          });

          const data = res.data?.data;
          if (data) {
            toast.success(`+${data.xpGained} XP Earned!`, { icon: '⚡' });

            if (data.leveledUp) {
              toast.success(`🎉 LEVEL UP! Reached Level ${data.currentLevel}!`, {
                duration: 6000,
                style: { border: '1px solid #a855f7', background: '#1a1030' },
              });
            }

            if (data.unlockedAchievements?.length > 0) {
              data.unlockedAchievements.forEach((achName: string) => {
                toast.success(`🏆 Achievement Unlocked: ${achName}!`, {
                  duration: 5000,
                  style: { border: '1px solid #ffd700', background: '#252010' },
                });
              });
            }

            // Refresh user store
            checkAuth();
          }
        } catch {
          // ignore
        }
      }
      return;
    }

    // If it is now AI's turn (Player 2)
    // Trigger AI thinking and shot after brief delay
    setIsAiThinking(true);
    setTimeout(() => {
      if (p2.isOut || p1.isOut) return;

      const aiShot = AIBot.calculateShot(p2, p1, difficulty);
      setIsAiThinking(false);

      // Trigger shot on GameArena via DOM/event or state
      // Since executeShot is in GameArena, we can simulate the AI shot
      const event = new CustomEvent('ai:shoot', {
        detail: { angle: aiShot.angle, power: aiShot.power },
      });
      window.dispatchEvent(event);
    }, 900);
  };

  const handleRematch = () => {
    setWinner(null);
    setIsAiThinking(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-grid-pattern relative flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col items-center justify-between">
        {/* Navigation & Match Header */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <button
            onClick={() => navigate('/menu')}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>←</span> Back to Menu
          </button>

          {/* Difficulty Selector */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  difficulty === diff
                    ? 'bg-purple-500 text-white shadow-neon-purple'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-cyan-400 font-bold">You ({scores.player})</span>
              <span className="text-white/30">vs</span>
              <span className="text-orange-400 font-bold">AI ({scores.ai})</span>
            </div>
            {isAiThinking && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 animate-pulse border border-purple-500/30">
                🤖 AI Thinking...
              </span>
            )}
          </div>
        </div>

        {/* Game Canvas Arena */}
        <GameArena
          mode={`ai_${difficulty}` as any}
          p1Name={user?.username || 'You'}
          p2Name={`AI Bot (${difficulty.toUpperCase()})`}
          p1Avatar={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=HumanPlayer'}
          p2Avatar="https://api.dicebear.com/7.x/bottts/svg?seed=AIBot"
          p1Color={(user as any)?.equipped?.find((e: any) => e.slot === 'PEN_SKIN')?.item?.data?.color || '#00d4ff'}
          p1StrokeColor={(user as any)?.equipped?.find((e: any) => e.slot === 'PEN_SKIN')?.item?.data?.strokeColor || '#0099cc'}
          onTurnEnd={handleTurnEnd}
          winner={winner}
          onRematch={handleRematch}
        />
      </main>
    </div>
  );
}
