import { PenState, ShotParams, GAME_CONFIG } from './index';
import { PhysicsEngine, DEFAULT_ARENA, ArenaDimensions } from './physics';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export class AIBot {
  /**
   * Calculate shot parameters for AI bot given current board state
   */
  static calculateShot(
    aiPen: PenState,
    opponentPen: PenState,
    difficulty: AIDifficulty = 'medium',
    arena: ArenaDimensions = DEFAULT_ARENA
  ): ShotParams {
    const dx = opponentPen.x - aiPen.x;
    const dy = opponentPen.y - aiPen.y;
    const dist = Math.hypot(dx, dy);

    // Direct angle to opponent
    let directAngle = Math.atan2(dy, dx);

    switch (difficulty) {
      case 'easy': {
        // Inaccurate angle (-20 to +20 degrees jitter)
        const angleJitter = (Math.random() - 0.5) * 0.7;
        const angle = directAngle + angleJitter;

        // Random power (35 to 80)
        const power = Math.floor(35 + Math.random() * 45);

        return { angle, power };
      }

      case 'medium': {
        // Find closest edge to opponent to aim through them towards that edge
        const center = { x: arena.width / 2, y: arena.height / 2 };
        const oppDx = opponentPen.x - center.x;
        const oppDy = opponentPen.y - center.y;

        // Angle pushing outward
        const outwardAngle = Math.atan2(oppDy, oppDx);
        // Blend direct angle with outward angle
        const targetAngle = directAngle * 0.75 + outwardAngle * 0.25;

        // Small jitter (+-6 degrees)
        const angleJitter = (Math.random() - 0.5) * 0.2;
        const angle = targetAngle + angleJitter;

        // Scale power proportionally with distance
        const basePower = Math.min(100, Math.max(40, (dist / (arena.width * 0.6)) * 100));
        const powerJitter = (Math.random() - 0.5) * 15;
        const power = Math.max(25, Math.min(95, Math.round(basePower + powerJitter)));

        return { angle, power };
      }

      case 'hard': {
        // Best strategic shot calculation using simulation
        let bestAngle = directAngle;
        let bestPower = 70;
        let bestScore = -Infinity;

        // Sample candidate angles around direct line
        const angleCandidates: number[] = [];
        for (let a = -0.3; a <= 0.3; a += 0.05) {
          angleCandidates.push(directAngle + a);
        }

        const powerCandidates = [50, 65, 75, 85, 95, 100];

        for (const angle of angleCandidates) {
          for (const power of powerCandidates) {
            const sim = PhysicsEngine.simulateTrajectory(
              aiPen,
              opponentPen,
              angle,
              power,
              arena,
              35
            );

            let score = 0;
            if (sim.hitOpponent) score += 100;
            if (sim.leavesArena) score -= 200; // Do not knock self out!

            // Preference for staying near center of arena
            const finalPoint = sim.points[sim.points.length - 1];
            const distFromCenter = Math.hypot(
              finalPoint.x - arena.width / 2,
              finalPoint.y - arena.height / 2
            );
            score -= distFromCenter * 0.1;

            if (score > bestScore) {
              bestScore = score;
              bestAngle = angle;
              bestPower = power;
            }
          }
        }

        // Add tiny human-like imperfection (+-2 degrees)
        const smallJitter = (Math.random() - 0.5) * 0.06;
        return {
          angle: bestAngle + smallJitter,
          power: Math.max(GAME_CONFIG.MIN_POWER, Math.min(GAME_CONFIG.MAX_POWER, bestPower)),
        };
      }

      default:
        return { angle: directAngle, power: 60 };
    }
  }
}
