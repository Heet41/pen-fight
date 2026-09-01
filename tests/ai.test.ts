import { AIBot } from '../shared/src/ai';
import { PenState } from '../shared/src';

console.log('🤖 Running AI Bot Test Suite...');

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${msg}`);
  }
}

const aiPen: PenState = {
  id: 'player2',
  x: 500,
  y: 250,
  velocityX: 0,
  velocityY: 0,
  radius: 18,
  mass: 1.0,
  isOut: false,
};

const oppPen: PenState = {
  id: 'player1',
  x: 200,
  y: 250,
  velocityX: 0,
  velocityY: 0,
  radius: 18,
  mass: 1.0,
  isOut: false,
};

// 1. Test Easy AI produces valid parameters
const easyShot = AIBot.calculateShot(aiPen, oppPen, 'easy');
assert(easyShot.power >= 10 && easyShot.power <= 100, 'Easy AI power is within valid 10-100 bounds');
assert(!isNaN(easyShot.angle), 'Easy AI angle is a valid number');

// 2. Test Medium AI aims towards opponent (negative X direction)
const mediumShot = AIBot.calculateShot(aiPen, oppPen, 'medium');
assert(mediumShot.power >= 10 && mediumShot.power <= 100, 'Medium AI power is within bounds');
// Direction from 500,250 to 200,250 is ~PI (pointing left)
assert(Math.abs(Math.cos(mediumShot.angle) - -1) < 0.5, 'Medium AI aims generally left towards opponent');

// 3. Test Hard AI generates strategic shot
const hardShot = AIBot.calculateShot(aiPen, oppPen, 'hard');
assert(hardShot.power >= 10 && hardShot.power <= 100, 'Hard AI power is within bounds');
assert(!isNaN(hardShot.angle), 'Hard AI angle is valid');

console.log('✅ All AI Bot Tests Passed!\n');
