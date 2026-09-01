import { PhysicsEngine, DEFAULT_ARENA } from '../shared/src/physics';
import { PenState } from '../shared/src';

console.log('🧪 Running Physics Engine Test Suite...');

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${msg}`);
  }
}

// 1. Test Shot Velocity calculation
const vel1 = PhysicsEngine.calculateShotVelocity(0, 50);
assert(vel1.x > 0 && Math.abs(vel1.y) < 0.0001, 'Angle 0 shoots horizontally right (positive X)');

const vel2 = PhysicsEngine.calculateShotVelocity(Math.PI / 2, 80);
assert(Math.abs(vel2.x) < 0.0001 && vel2.y > 0, 'Angle PI/2 shoots downwards (positive Y)');

// 2. Test Collision detection & momentum transfer
const p1: PenState = {
  id: 'player1',
  x: 200,
  y: 250,
  velocityX: 15,
  velocityY: 0,
  radius: 18,
  mass: 1.0,
  isOut: false,
};

const p2: PenState = {
  id: 'player2',
  x: 230,
  y: 250,
  velocityX: 0,
  velocityY: 0,
  radius: 18,
  mass: 1.0,
  isOut: false,
};

const step1 = PhysicsEngine.step(p1, p2, DEFAULT_ARENA);
assert(step1.events.some((e) => e.type === 'pen_pen'), 'Collision event detected on contact');
assert(p2.velocityX > 0, 'Opponent pen gains forward velocity from impact');

// 3. Test Out of Bounds / Fall off detection
const p3: PenState = {
  id: 'player1',
  x: DEFAULT_ARENA.width + 10,
  y: 250,
  velocityX: 10,
  velocityY: 0,
  radius: 18,
  mass: 1.0,
  isOut: false,
};
const p4: PenState = {
  id: 'player2',
  x: 300,
  y: 250,
  velocityX: 0,
  velocityY: 0,
  radius: 18,
  mass: 1.0,
  isOut: false,
};

const step2 = PhysicsEngine.step(p3, p4, DEFAULT_ARENA);
assert(p3.isOut === true, 'Pen outside arena padding is marked as isOut=true');
assert(step2.events.some((e) => e.type === 'fall_off'), 'Fall off event generated');

// 4. Test Trajectory simulation
const sim = PhysicsEngine.simulateTrajectory(p4, p2, 0, 80, DEFAULT_ARENA, 20);
assert(sim.points.length > 0, 'Trajectory produces valid array of path points');

console.log('✅ All Physics Engine Tests Passed!\n');
