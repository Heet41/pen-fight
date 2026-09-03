import { useEffect, useRef, useState, useCallback } from 'react';
import { PenState, PlayerSide, GameMode } from '@shared/index';
import {
  PhysicsEngine,
  DEFAULT_ARENA,
  ArenaDimensions,
  CollisionEvent,
} from '@shared/physics';
import { sound } from '@/utils/audio';

interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  life: number;
}

interface GameArenaProps {
  mode: GameMode;
  p1Name?: string;
  p2Name?: string;
  p1Avatar?: string;
  p2Avatar?: string;
  p1Color?: string;
  p1StrokeColor?: string;
  p2Color?: string;
  p2StrokeColor?: string;
  isMyTurn?: boolean;
  mySide?: PlayerSide;
  onTurnEnd?: (
    p1: PenState,
    p2: PenState,
    winner?: PlayerSide,
    nextTurn?: PlayerSide
  ) => void;
  onShotFired?: (
    angle: number,
    power: number,
    side: PlayerSide
  ) => void;
  winner?: PlayerSide | null;
  onRematch?: () => void;
  isInteractive?: boolean;
}

export default function GameArena({
  mode,
  p1Name = 'Player 1',
  p2Name = 'Player 2',
  p1Avatar,
  p2Avatar,
  p1Color = '#00d4ff',
  p1StrokeColor = '#0099cc',
  p2Color = '#f97316',
  p2StrokeColor = '#ea580c',
  mySide = 'player1',
  onTurnEnd,
  onShotFired,
  winner = null,
  onRematch,
  isInteractive = true,
}: GameArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Arena dimensions
  const arena: ArenaDimensions = DEFAULT_ARENA;

  // Game state refs for 60fps loop
  const p1Ref = useRef<PenState>({
    id: 'player1',
    x: 180,
    y: 250,
    velocityX: 0,
    velocityY: 0,
    radius: 18,
    mass: 1.0,
    isOut: false,
  });

  const p2Ref = useRef<PenState>({
    id: 'player2',
    x: 580,
    y: 250,
    velocityX: 0,
    velocityY: 0,
    radius: 18,
    mass: 1.0,
    isOut: false,
  });

  const currentTurnRef = useRef<PlayerSide>('player1');
  const [currentTurn, setCurrentTurn] =
    useState<PlayerSide>('player1');

  /*
   * LOCAL 2P:
   * Both players are allowed to control the arena.
   *
   * ONLINE / AI:
   * Only the player whose side matches the current turn can control it.
   */
  const canControlCurrentTurn =
    mode === 'local'
      ? true
      : mySide === currentTurn && isInteractive;

  const [isSimulating, setIsSimulating] = useState(false);
  const isSimulatingRef = useRef(false);

  // Aiming state
  const [aimAngle, setAimAngle] = useState<number>(0);
  const [aimPower, setAimPower] = useState<number>(60);
  const [isDragging, setIsDragging] = useState(false);

  // VFX
  const particlesRef = useRef<ParticleEffect[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const screenShakeRef = useRef<number>(0);

  // Initialize pens
  const resetBoard = useCallback(() => {
    p1Ref.current = {
      id: 'player1',
      x: 180,
      y: 250,
      velocityX: 0,
      velocityY: 0,
      radius: 18,
      mass: 1.0,
      isOut: false,
    };

    p2Ref.current = {
      id: 'player2',
      x: 580,
      y: 250,
      velocityX: 0,
      velocityY: 0,
      radius: 18,
      mass: 1.0,
      isOut: false,
    };

    currentTurnRef.current = 'player1';
    setCurrentTurn('player1');

    setIsSimulating(false);
    isSimulatingRef.current = false;

    particlesRef.current = [];
    floatingTextsRef.current = [];
  }, []);

  useEffect(() => {
    resetBoard();
  }, [resetBoard]);

  // Spawn visual particles
  const spawnParticles = (
    x: number,
    y: number,
    color: string,
    count: number = 12
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3 + 1.5,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 20 + 20,
      });
    }
  };

  const spawnFloatingText = (
    text: string,
    x: number,
    y: number,
    color: string
  ) => {
    floatingTextsRef.current.push({
      id: Math.random(),
      text,
      x,
      y,
      color,
      alpha: 1,
      scale: 1.2,
      life: 0,
    });
  };

  // Perform shot
  const executeShot = useCallback(
    (angle: number, power: number, shooter: PlayerSide) => {
      if (isSimulatingRef.current) return;

      sound.playLaunch(power / 100);

      const vel = PhysicsEngine.calculateShotVelocity(
        angle,
        power
      );

      const activePen =
        shooter === 'player1'
          ? p1Ref.current
          : p2Ref.current;

      activePen.velocityX = vel.x;
      activePen.velocityY = vel.y;

      setIsSimulating(true);
      isSimulatingRef.current = true;

      spawnParticles(
        activePen.x,
        activePen.y,
        shooter === 'player1'
          ? '#00d4ff'
          : '#f97316',
        16
      );

      if (onShotFired) {
        onShotFired(angle, power, shooter);
      }
    },
    [onShotFired]
  );

  // Listen for AI shots
  useEffect(() => {
    const handleAiShoot = (e: any) => {
      const { angle, power } = e.detail;

      executeShot(
        angle,
        power,
        'player2'
      );
    };

    window.addEventListener(
      'ai:shoot',
      handleAiShoot
    );

    return () =>
      window.removeEventListener(
        'ai:shoot',
        handleAiShoot
      );
  }, [executeShot]);

  // Main Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    let animId: number;

    const render = () => {
      // 1. Physics Step
      if (isSimulatingRef.current) {
        const {
          isMoving,
          events,
        } = PhysicsEngine.step(
          p1Ref.current,
          p2Ref.current,
          arena
        );

        // Handle collision sound & VFX
        events.forEach(
          (ev: CollisionEvent) => {
            if (ev.type === 'pen_pen') {
              sound.playHit(ev.intensity);

              spawnParticles(
                ev.x,
                ev.y,
                '#ffffff',
                Math.floor(
                  ev.intensity * 20
                ) + 5
              );

              screenShakeRef.current =
                Math.min(
                  10,
                  ev.intensity * 12
                );

              if (ev.intensity > 0.6) {
                spawnFloatingText(
                  'SMASH!',
                  ev.x,
                  ev.y - 20,
                  '#f97316'
                );
              } else {
                spawnFloatingText(
                  'CLACK!',
                  ev.x,
                  ev.y - 20,
                  '#00d4ff'
                );
              }
            } else if (
              ev.type === 'fall_off'
            ) {
              sound.playFall();

              spawnParticles(
                ev.x,
                ev.y,
                '#ef4444',
                24
              );

              screenShakeRef.current = 8;

              spawnFloatingText(
                'RING OUT!',
                ev.x,
                ev.y - 20,
                '#ef4444'
              );
            }
          }
        );

        // Check if movement stopped
        if (!isMoving) {
          isSimulatingRef.current = false;
          setIsSimulating(false);

          // Check Win Condition
          let matchWinner:
            | PlayerSide
            | undefined;

          if (
            p1Ref.current.isOut &&
            p2Ref.current.isOut
          ) {
            matchWinner =
              currentTurnRef.current ===
              'player1'
                ? 'player2'
                : 'player1';
          } else if (
            p1Ref.current.isOut
          ) {
            matchWinner = 'player2';
          } else if (
            p2Ref.current.isOut
          ) {
            matchWinner = 'player1';
          }

          if (matchWinner) {
            sound.playVictory();
          } else {
            // Switch Turn
            const nextTurn =
              currentTurnRef.current ===
              'player1'
                ? 'player2'
                : 'player1';

            currentTurnRef.current =
              nextTurn;

            setCurrentTurn(nextTurn);
          }

          if (onTurnEnd) {
            onTurnEnd(
              p1Ref.current,
              p2Ref.current,
              matchWinner,
              currentTurnRef.current
            );
          }
        }
      }

      // 2. Clear Screen & Handle Screen Shake
      ctx.save();

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (screenShakeRef.current > 0) {
        const shakeX =
          (Math.random() - 0.5) *
          screenShakeRef.current;

        const shakeY =
          (Math.random() - 0.5) *
          screenShakeRef.current;

        ctx.translate(
          shakeX,
          shakeY
        );

        screenShakeRef.current =
          Math.max(
            0,
            screenShakeRef.current -
              0.5
          );
      }

      // 3. Draw Arena Table & Desk
      drawDeskArena(
        ctx,
        arena
      );

      // 4. Draw Trajectory Preview
      if (
        !isSimulatingRef.current &&
        !winner &&
        isInteractive &&
        canControlCurrentTurn
      ) {
        const activePen =
          currentTurnRef.current ===
          'player1'
            ? p1Ref.current
            : p2Ref.current;

        const targetPen =
          currentTurnRef.current ===
          'player1'
            ? p2Ref.current
            : p1Ref.current;

        drawTrajectory(
          ctx,
          activePen,
          targetPen,
          aimAngle,
          aimPower,
          arena
        );
      }

      // 5. Draw Pens
      drawPen(
        ctx,
        p1Ref.current,
        p1Color,
        p1StrokeColor,
        currentTurnRef.current ===
          'player1'
      );

      drawPen(
        ctx,
        p2Ref.current,
        p2Color,
        p2StrokeColor,
        currentTurnRef.current ===
          'player2'
      );

      // 6. Draw Particle VFX
      drawParticles(
        ctx,
        particlesRef.current
      );

      // 7. Draw Floating Combat Text
      drawFloatingTexts(
        ctx,
        floatingTextsRef.current
      );

      ctx.restore();

      animId =
        requestAnimationFrame(
          render
        );
    };

    animId =
      requestAnimationFrame(
        render
      );

    return () =>
      cancelAnimationFrame(animId);
  }, [
    arena,
    isInteractive,
    mySide,
    onTurnEnd,
    winner,
    aimAngle,
    aimPower,
    canControlCurrentTurn,
  ]);

  // ─── Canvas Interaction ──────────────────────────────────────────────

  const handlePointerDown = (
    e: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (
      isSimulating ||
      winner ||
      !isInteractive ||
      !canControlCurrentTurn
    ) {
      return;
    }

    const rect =
      e.currentTarget.getBoundingClientRect();

    const x =
      ((e.clientX - rect.left) /
        rect.width) *
      arena.width;

    const y =
      ((e.clientY - rect.top) /
        rect.height) *
      arena.height;

    const activePen =
      currentTurnRef.current ===
      'player1'
        ? p1Ref.current
        : p2Ref.current;

    const dist = Math.hypot(
      x - activePen.x,
      y - activePen.y
    );

    if (dist < 80) {
      setIsDragging(true);
      updateAimFromPointer(
        x,
        y,
        activePen
      );
    }
  };

  const handlePointerMove = (
    e: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (
      !isDragging ||
      isSimulating ||
      winner ||
      !isInteractive ||
      !canControlCurrentTurn
    ) {
      return;
    }

    const rect =
      e.currentTarget.getBoundingClientRect();

    const x =
      ((e.clientX - rect.left) /
        rect.width) *
      arena.width;

    const y =
      ((e.clientY - rect.top) /
        rect.height) *
      arena.height;

    const activePen =
      currentTurnRef.current ===
      'player1'
        ? p1Ref.current
        : p2Ref.current;

    updateAimFromPointer(
      x,
      y,
      activePen
    );
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const updateAimFromPointer = (
    pointerX: number,
    pointerY: number,
    pen: PenState
  ) => {
    const dx =
      pointerX - pen.x;

    const dy =
      pointerY - pen.y;

    const angle =
      Math.atan2(dy, dx);

    const dist =
      Math.hypot(dx, dy);

    setAimAngle(angle);

    // Map drag distance (0-150px) to power (20-100)
    const power =
      Math.max(
        15,
        Math.min(
          100,
          Math.round(
            (dist / 140) * 100
          )
        )
      );

    setAimPower(power);
  };

  return (
    <div className="flex flex-col items-center w-full select-none">

      {/* ─── Match Top Bar ─────────────────────────────────────────────── */}
      <div className="w-full max-w-4xl mb-3">
        <div className="glass-card border-white/10 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3">

          {/* Players + VS */}
          <div className="flex items-center justify-between gap-2">

            {/* Player 1 */}
            <div
              className={`flex min-w-0 items-center gap-1.5 sm:gap-3 px-1.5 sm:px-2 py-1.5 rounded-xl transition-all duration-300 ${
                currentTurn === 'player1' &&
                !winner
                  ? 'bg-cyan-500/15 border border-cyan-400/40 shadow-neon-blue'
                  : 'border border-transparent opacity-60'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={
                    p1Avatar ||
                    'https://api.dicebear.com/7.x/bottts/svg?seed=P1'
                  }
                  alt={p1Name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cyan-500/20 border border-cyan-400/40"
                />

                {currentTurn ===
                  'player1' &&
                  !winner && (
                    <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-dark-900 animate-pulse" />
                  )}
              </div>

              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-cyan-400 truncate max-w-[90px] sm:max-w-[140px]">
                  {p1Name}
                </div>

                <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wider">
                  Blue Pen
                </div>
              </div>
            </div>

            {/* Center Status */}
            <div className="flex flex-col items-center justify-center shrink-0 px-2 sm:px-4">
              {winner ? (
                <div className="text-center">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-yellow-400/60 mb-0.5">
                    Match Over
                  </div>

                  <div className="font-game font-black text-xs sm:text-sm text-yellow-400 animate-pulse">
                    👑{' '}
                    {winner ===
                    'player1'
                      ? p1Name
                      : p2Name}
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-white/30 font-mono mb-1">
                    Turn
                  </div>

                  <div
                    className={`px-2.5 sm:px-3 py-1 rounded-full border text-[9px] sm:text-[10px] font-game font-bold uppercase tracking-wider ${
                      currentTurn ===
                      'player1'
                        ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300'
                        : 'bg-orange-500/10 border-orange-400/30 text-orange-300'
                    }`}
                  >
                    {currentTurn ===
                    'player1'
                      ? '🎯 '
                      : '⚔️ '}

                    {currentTurn ===
                    'player1'
                      ? p1Name
                      : p2Name}
                  </div>
                </>
              )}
            </div>

            {/* Player 2 */}
            <div
              className={`flex min-w-0 items-center gap-1.5 sm:gap-3 px-1.5 sm:px-2 py-1.5 rounded-xl transition-all duration-300 ${
                currentTurn === 'player2' &&
                !winner
                  ? 'bg-orange-500/15 border border-orange-400/40 shadow-[0_0_18px_rgba(249,115,22,0.18)]'
                  : 'border border-transparent opacity-60'
              }`}
            >
              <div className="text-right min-w-0">
                <div className="text-xs sm:text-sm font-bold text-orange-400 truncate max-w-[90px] sm:max-w-[140px]">
                  {p2Name}
                </div>

                <div className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wider">
                  Red Pen
                </div>
              </div>

              <div className="relative shrink-0">
                <img
                  src={
                    p2Avatar ||
                    'https://api.dicebear.com/7.x/bottts/svg?seed=P2'
                  }
                  alt={p2Name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-500/20 border border-orange-400/40"
                />

                {currentTurn ===
                  'player2' &&
                  !winner && (
                    <span className="absolute -left-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-orange-400 border-2 border-dark-900 animate-pulse" />
                  )}
              </div>
            </div>
          </div>

          {/* Turn Progress */}
          {!winner && (
            <div className="mt-2.5 h-0.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentTurn ===
                  'player1'
                    ? 'w-1/2 bg-cyan-400'
                    : 'w-full bg-orange-400'
                }`}
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── Canvas Arena ──────────────────────────────────────────────── */}
      <div className="relative w-full max-w-4xl aspect-[760/500] rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-dark-900 sm:rounded-2xl">
        <canvas
          ref={canvasRef}
          width={arena.width}
          height={arena.height}
          onPointerDown={
            handlePointerDown
          }
          onPointerMove={
            handlePointerMove
          }
          onPointerUp={
            handlePointerUp
          }
          className="w-full h-full cursor-crosshair touch-none"
        />
      </div>

      {/* Winner Overlay Modal */}
      {winner && (
        <div className="absolute inset-0 bg-dark-900/85 backdrop-blur-lg flex flex-col items-center justify-center p-5 sm:p-6 z-30 animate-fade-in">

          {/* Result Card */}
          <div
            className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 text-center shadow-2xl ${
              winner === 'player1'
                ? 'border-yellow-400/20 bg-yellow-400/[0.03]'
                : 'border-red-400/20 bg-red-400/[0.03]'
            }`}
          >

            {/* Decorative Glow */}
            <div
              className={`absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none ${
                winner ===
                'player1'
                  ? 'bg-yellow-400'
                  : 'bg-red-500'
              }`}
            />

            {/* Trophy / Defeat Icon */}
            <div
              className={`relative text-5xl sm:text-6xl mb-4 ${
                winner ===
                'player1'
                  ? 'animate-bounce'
                  : 'animate-pulse'
              }`}
            >
              {winner ===
              'player1'
                ? '🏆'
                : '💀'}
            </div>

            {/* Result Label */}
            <div
              className={`text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] mb-2 ${
                winner ===
                'player1'
                  ? 'text-yellow-400/60'
                  : 'text-red-400/60'
              }`}
            >
              Match Complete
            </div>

            {/* Result */}
            <h2
              className={`font-game font-black text-4xl sm:text-5xl tracking-wide mb-3 ${
                winner ===
                'player1'
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}
            >
              {winner ===
              'player1'
                ? 'VICTORY!'
                : 'DEFEAT!'}
            </h2>

            {/* Description */}
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-6 max-w-sm mx-auto">
              {winner ===
              'player1' ? (
                <>
                  <strong className="text-white">
                    {p1Name}
                  </strong>{' '}
                  knocked the opponent out of the arena!
                </>
              ) : (
                <>
                  <strong className="text-white">
                    {p2Name}
                  </strong>{' '}
                  knocked you out of the arena!
                </>
              )}
            </p>

            {/* Winner Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${
                winner ===
                'player1'
                  ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-300'
                  : 'bg-red-400/10 border-red-400/20 text-red-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />

              <span className="text-[10px] font-mono uppercase tracking-widest">
                {winner ===
                'player1'
                  ? 'Arena Champion'
                  : 'Better luck next round'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  resetBoard();

                  if (onRematch) {
                    onRematch();
                  }
                }}
                className="btn-neon w-full sm:w-auto min-w-[190px] px-8 py-3.5 text-sm font-game font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                🔄 PLAY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Bottom Game Controls ──────────────────────────────────────── */}
      {!winner && isInteractive && (
        <div className="w-full max-w-4xl mt-3 space-y-2.5">

          {/* Turn Status */}
          <div
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-[10px] sm:text-xs font-mono uppercase tracking-widest transition-all ${
              canControlCurrentTurn
                ? 'bg-cyan-500/10 border-cyan-400/25 text-cyan-300'
                : 'bg-orange-500/10 border-orange-400/25 text-orange-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                canControlCurrentTurn
                  ? 'bg-cyan-400'
                  : 'bg-orange-400'
              }`}
            />

            {canControlCurrentTurn
              ? '🎯 Your turn — aim and fire'
              : '⏳ Opponent turn — waiting'}
          </div>

          {/* Controls */}
          <div className="glass-card border-white/10 rounded-2xl p-2.5 sm:p-4">

            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3 lg:gap-5">

              {/* Angle */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] sm:text-[10px] text-white/40 font-mono uppercase tracking-widest">
                    Angle
                  </span>

                  <span className="text-xs font-game font-bold text-cyan-400">
                    {Math.round(
                      (aimAngle * 180) /
                        Math.PI
                    )}
                    °
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30">
                    ←
                  </span>

                  <input
                    type="range"
                    min={-Math.PI}
                    max={Math.PI}
                    step={0.05}
                    value={aimAngle}
                    onChange={(e) =>
                      setAimAngle(
                        parseFloat(
                          e.target.value
                        )
                      )
                    }
                    disabled={
                      isSimulating ||
                      !canControlCurrentTurn
                    }
                    className="w-full h-5 accent-cyan-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                  />

                  <span className="text-[10px] text-white/30">
                    →
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden lg:block w-px h-10 bg-white/10" />

              {/* Power */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] sm:text-[10px] text-white/40 font-mono uppercase tracking-widest">
                    Power
                  </span>

                  <span className="text-xs font-game font-bold text-orange-400">
                    {aimPower}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30">
                    10
                  </span>

                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={aimPower}
                    onChange={(e) =>
                      setAimPower(
                        parseInt(
                          e.target.value,
                          10
                        )
                      )
                    }
                    disabled={
                      isSimulating ||
                      !canControlCurrentTurn
                    }
                    className="w-full h-5 accent-orange-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                  />

                  <span className="text-[10px] text-white/30">
                    100
                  </span>
                </div>
              </div>

              {/* Shoot */}
              <button
                onClick={() =>
                  executeShot(
                    aimAngle,
                    aimPower,
                    currentTurn
                  )
                }
                disabled={
                  isSimulating ||
                  !canControlCurrentTurn
                }
                className={`lg:w-40 px-6 py-3 rounded-xl text-xs font-game tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${
                  canControlCurrentTurn &&
                  !isSimulating
                    ? 'btn-neon hover:scale-[1.02]'
                    : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {isSimulating
                  ? '🚀 Rolling...'
                  : canControlCurrentTurn
                    ? '🎯 SHOOT!'
                    : '⏳ WAIT'}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Canvas Drawing Helper Functions ──────────────────────────────────────────

function drawDeskArena(
  ctx: CanvasRenderingContext2D,
  arena: ArenaDimensions
) {
  const {
    width,
    height,
    padding,
  } = arena;

  // 1. Floor Drop-off Shadow / Background
  ctx.fillStyle = '#06060c';
  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  // 2. Wooden Table Top with Rounded Borders
  const tableX = padding;
  const tableY = padding;
  const tableW =
    width - padding * 2;
  const tableH =
    height - padding * 2;
  const radius = 16;

  // Table Outer Shadow
  ctx.shadowColor =
    'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;

  ctx.fillStyle = '#141424';
  ctx.beginPath();
  ctx.roundRect(
    tableX,
    tableY,
    tableW,
    tableH,
    radius
  );
  ctx.fill();

  ctx.shadowColor =
    'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Grid / Paper Texture lines
  ctx.strokeStyle =
    'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;

  const gridSize = 40;

  ctx.beginPath();

  for (
    let x =
      tableX + gridSize;
    x < tableX + tableW;
    x += gridSize
  ) {
    ctx.moveTo(x, tableY);
    ctx.lineTo(
      x,
      tableY + tableH
    );
  }

  for (
    let y =
      tableY + gridSize;
    y < tableY + tableH;
    y += gridSize
  ) {
    ctx.moveTo(tableX, y);
    ctx.lineTo(
      tableX + tableW,
      y
    );
  }

  ctx.stroke();

  // Center Court Line
  ctx.strokeStyle =
    'rgba(0, 212, 255, 0.15)';
  ctx.setLineDash([6, 6]);

  ctx.beginPath();
  ctx.moveTo(
    width / 2,
    tableY
  );
  ctx.lineTo(
    width / 2,
    tableY + tableH
  );
  ctx.stroke();

  // Center Circle
  ctx.beginPath();

  ctx.arc(
    width / 2,
    height / 2,
    45,
    0,
    Math.PI * 2
  );

  ctx.stroke();
  ctx.setLineDash([]);

  // Glowing Arena Boundary Edge
  ctx.strokeStyle =
    'rgba(0, 212, 255, 0.4)';
  ctx.lineWidth = 3;

  ctx.beginPath();

  ctx.roundRect(
    tableX,
    tableY,
    tableW,
    tableH,
    radius
  );

  ctx.stroke();
}

function drawPen(
  ctx: CanvasRenderingContext2D,
  pen: PenState,
  primaryColor: string,
  strokeColor: string,
  isActive: boolean
) {
  if (pen.isOut) return;

  const length = 48;
  const width = 12;

  const angle = Math.atan2(
    pen.velocityY || 0,
    pen.velocityX || 0
  );

  ctx.save();

  ctx.translate(
    pen.x,
    pen.y
  );

  ctx.rotate(angle);

  // Drop Shadow
  ctx.fillStyle =
    'rgba(0, 0, 0, 0.4)';

  ctx.beginPath();

  ctx.ellipse(
    3,
    4,
    length / 2,
    width / 2,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // Active Aura Glow
  if (isActive) {
    ctx.shadowColor =
      primaryColor;
    ctx.shadowBlur = 15;
  }

  // Pen Barrel
  ctx.fillStyle =
    primaryColor;

  ctx.beginPath();

  ctx.roundRect(
    -length / 2,
    -width / 2,
    length * 0.7,
    width,
    4
  );

  ctx.fill();

  // Pen Grip Rings
  ctx.fillStyle =
    strokeColor;

  for (let i = 0; i < 3; i++) {
    ctx.fillRect(
      -length / 2 +
        6 +
        i * 5,
      -width / 2,
      2,
      width
    );
  }

  // Pen Nib
  ctx.fillStyle =
    '#e2e8f0';

  ctx.beginPath();

  ctx.moveTo(
    length * 0.2,
    -width / 2
  );

  ctx.lineTo(
    length / 2,
    0
  );

  ctx.lineTo(
    length * 0.2,
    width / 2
  );

  ctx.closePath();
  ctx.fill();

  // Ink Tip Dot
  ctx.fillStyle =
    primaryColor;

  ctx.beginPath();

  ctx.arc(
    length / 2 - 2,
    0,
    2.5,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // Metal Clip
  ctx.fillStyle =
    '#94a3b8';

  ctx.fillRect(
    -length / 2 + 2,
    -width / 2 - 2,
    14,
    2
  );

  ctx.restore();
}

function drawTrajectory(
  ctx: CanvasRenderingContext2D,
  activePen: PenState,
  targetPen: PenState,
  angle: number,
  power: number,
  arena: ArenaDimensions
) {
  const sim =
    PhysicsEngine.simulateTrajectory(
      activePen,
      targetPen,
      angle,
      power,
      arena,
      25
    );

  ctx.save();

  ctx.beginPath();

  ctx.moveTo(
    activePen.x,
    activePen.y
  );

  sim.points.forEach(
    (pt) => {
      ctx.lineTo(
        pt.x,
        pt.y
      );
    }
  );

  ctx.strokeStyle =
    sim.leavesArena
      ? 'rgba(239, 68, 68, 0.6)'
      : sim.hitOpponent
        ? 'rgba(249, 115, 22, 0.8)'
        : 'rgba(0, 212, 255, 0.6)';

  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.stroke();

  // Draw dots along trajectory
  sim.points.forEach(
    (pt, i) => {
      if (i % 3 === 0) {
        ctx.fillStyle =
          sim.hitOpponent
            ? '#f97316'
            : '#00d4ff';

        ctx.beginPath();

        ctx.arc(
          pt.x,
          pt.y,
          2.5,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }
    }
  );

  ctx.restore();
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: ParticleEffect[]
) {
  for (
    let i =
      particles.length - 1;
    i >= 0;
    i--
  ) {
    const p =
      particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.life++;

    p.alpha =
      1 -
      p.life /
        p.maxLife;

    if (
      p.life >=
      p.maxLife
    ) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();

    ctx.globalAlpha =
      Math.max(
        0,
        p.alpha
      );

    ctx.fillStyle =
      p.color;

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      p.size,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }
}

function drawFloatingTexts(
  ctx: CanvasRenderingContext2D,
  texts: FloatingText[]
) {
  for (
    let i =
      texts.length - 1;
    i >= 0;
    i--
  ) {
    const t =
      texts[i];

    t.y -= 1;
    t.life += 1;

    t.alpha =
      1 -
      t.life / 35;

    if (
      t.life >= 35
    ) {
      texts.splice(i, 1);
      continue;
    }

    ctx.save();

    ctx.globalAlpha =
      Math.max(
        0,
        t.alpha
      );

    ctx.fillStyle =
      t.color;

    ctx.font =
      'bold 13px Orbitron, sans-serif';

    ctx.textAlign =
      'center';

    ctx.fillText(
      t.text,
      t.x,
      t.y
    );

    ctx.restore();
  }
}
