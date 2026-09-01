import { GAME_CONFIG, PenState, PlayerSide } from './index';

export interface Vector2D {
  x: number;
  y: number;
}

export interface CollisionEvent {
  type: 'pen_pen' | 'boundary' | 'fall_off';
  x: number;
  y: number;
  intensity: number; // 0 to 1
  penId?: PlayerSide;
}

export interface ArenaDimensions {
  width: number;
  height: number;
  padding: number;
}

export const DEFAULT_ARENA: ArenaDimensions = {
  width: 760,
  height: 500,
  padding: 40,
};

export class PhysicsEngine {
  /**
   * Calculate shot velocity vector from angle (radians) and power (0-100)
   */
  static calculateShotVelocity(angle: number, power: number): Vector2D {
    const clampedPower = Math.max(
      GAME_CONFIG.MIN_POWER,
      Math.min(GAME_CONFIG.MAX_POWER, power)
    );
    const speed = (clampedPower / GAME_CONFIG.MAX_POWER) * GAME_CONFIG.MAX_SPEED;

    return {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };
  }

  /**
   * Apply physics step to two pens
   * Returns whether any pen is still moving and any collision events occurred
   */
  static step(
    pen1: PenState,
    pen2: PenState,
    arena: ArenaDimensions = DEFAULT_ARENA,
    friction: number = GAME_CONFIG.FRICTION
  ): { isMoving: boolean; events: CollisionEvent[] } {
    const events: CollisionEvent[] = [];

    // 1. Move both pens
    if (!pen1.isOut) {
      pen1.x += pen1.velocityX;
      pen1.y += pen1.velocityY;
      pen1.velocityX *= friction;
      pen1.velocityY *= friction;

      if (Math.hypot(pen1.velocityX, pen1.velocityY) < GAME_CONFIG.MIN_VELOCITY) {
        pen1.velocityX = 0;
        pen1.velocityY = 0;
      }
    }

    if (!pen2.isOut) {
      pen2.x += pen2.velocityX;
      pen2.y += pen2.velocityY;
      pen2.velocityX *= friction;
      pen2.velocityY *= friction;

      if (Math.hypot(pen2.velocityX, pen2.velocityY) < GAME_CONFIG.MIN_VELOCITY) {
        pen2.velocityX = 0;
        pen2.velocityY = 0;
      }
    }

    // 2. Check Pen vs Pen Collision
    if (!pen1.isOut && !pen2.isOut) {
      const dx = pen2.x - pen1.x;
      const dy = pen2.y - pen1.y;
      const dist = Math.hypot(dx, dy);
      const minDist = pen1.radius + pen2.radius;

      if (dist > 0 && dist < minDist) {
        // Normal vector
        const nx = dx / dist;
        const ny = dy / dist;

        // Separate overlapping pens
        const overlap = minDist - dist;
        pen1.x -= nx * (overlap / 2);
        pen1.y -= ny * (overlap / 2);
        pen2.x += nx * (overlap / 2);
        pen2.y += ny * (overlap / 2);

        // Relative velocity
        const kx = pen1.velocityX - pen2.velocityX;
        const ky = pen1.velocityY - pen2.velocityY;

        // Velocity along normal
        const p = 2 * (nx * kx + ny * ky) / (pen1.mass + pen2.mass);
        const relativeSpeed = Math.hypot(kx, ky);

        if (p > 0) {
          pen1.velocityX -= p * pen2.mass * nx * GAME_CONFIG.RESTITUTION;
          pen1.velocityY -= p * pen2.mass * ny * GAME_CONFIG.RESTITUTION;
          pen2.velocityX += p * pen1.mass * nx * GAME_CONFIG.RESTITUTION;
          pen2.velocityY += p * pen1.mass * ny * GAME_CONFIG.RESTITUTION;

          events.push({
            type: 'pen_pen',
            x: (pen1.x + pen2.x) / 2,
            y: (pen1.y + pen2.y) / 2,
            intensity: Math.min(1, relativeSpeed / (GAME_CONFIG.MAX_SPEED * 0.8)),
          });
        }
      }
    }

    // 3. Boundary & Out of Bounds check
    const minX = arena.padding;
    const maxX = arena.width - arena.padding;
    const minY = arena.padding;
    const maxY = arena.height - arena.padding;

    // Check Pen 1 out of bounds
    if (!pen1.isOut) {
      if (
        pen1.x < minX ||
        pen1.x > maxX ||
        pen1.y < minY ||
        pen1.y > maxY
      ) {
        pen1.isOut = true;
        pen1.velocityX *= 0.5;
        pen1.velocityY *= 0.5;
        events.push({
          type: 'fall_off',
          x: pen1.x,
          y: pen1.y,
          intensity: 1,
          penId: 'player1',
        });
      }
    }

    // Check Pen 2 out of bounds
    if (!pen2.isOut) {
      if (
        pen2.x < minX ||
        pen2.x > maxX ||
        pen2.y < minY ||
        pen2.y > maxY
      ) {
        pen2.isOut = true;
        pen2.velocityX *= 0.5;
        pen2.velocityY *= 0.5;
        events.push({
          type: 'fall_off',
          x: pen2.x,
          y: pen2.y,
          intensity: 1,
          penId: 'player2',
        });
      }
    }

    const isMoving =
      (!pen1.isOut && (pen1.velocityX !== 0 || pen1.velocityY !== 0)) ||
      (!pen2.isOut && (pen2.velocityX !== 0 || pen2.velocityY !== 0));

    return { isMoving, events };
  }

  /**
   * Simulate a shot trajectory for aiming preview
   */
  static simulateTrajectory(
    startPen: PenState,
    targetPen: PenState,
    angle: number,
    power: number,
    arena: ArenaDimensions = DEFAULT_ARENA,
    maxSteps: number = 30
  ): { points: Vector2D[]; hitOpponent: boolean; leavesArena: boolean } {
    // Clone states
    const p1: PenState = { ...startPen };
    const p2: PenState = { ...targetPen };

    const vel = this.calculateShotVelocity(angle, power);
    p1.velocityX = vel.x;
    p1.velocityY = vel.y;

    const points: Vector2D[] = [{ x: p1.x, y: p1.y }];
    let hitOpponent = false;
    let leavesArena = false;

    const minX = arena.padding;
    const maxX = arena.width - arena.padding;
    const minY = arena.padding;
    const maxY = arena.height - arena.padding;

    for (let i = 0; i < maxSteps; i++) {
      const { events } = this.step(p1, p2, arena, 0.95);
      points.push({ x: p1.x, y: p1.y });

      for (const ev of events) {
        if (ev.type === 'pen_pen') hitOpponent = true;
        if (ev.type === 'fall_off') leavesArena = true;
      }

      if (
        (p1.velocityX === 0 && p1.velocityY === 0) ||
        p1.isOut ||
        p1.x < minX || p1.x > maxX || p1.y < minY || p1.y > maxY
      ) {
        if (p1.isOut) leavesArena = true;
        break;
      }
    }

    return { points, hitOpponent, leavesArena };
  }
}
