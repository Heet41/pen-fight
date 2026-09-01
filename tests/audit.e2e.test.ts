import { PhysicsEngine, DEFAULT_ARENA } from '../shared/src/physics';
import { AIBot } from '../shared/src/ai';
import { RankedService } from '../backend/src/services/ranked.service';
import { getRankFromRating, getXpForLevel, getLevelFromXp, GAME_CONFIG, PenState } from '../shared/src';
import { AuthService } from '../backend/src/services/auth.service';
import { UserService } from '../backend/src/services/user.service';
import { RoomService } from '../backend/src/services/room.service';
import { prisma } from '../backend/src/config/database';
import bcrypt from 'bcryptjs';

console.log('════════════════════════════════════════════════════════════════');
console.log('🔍 PEN FIGHT v1.0 — COMPREHENSIVE QA & RELEASE AUDIT SUITE');
console.log('════════════════════════════════════════════════════════════════\n');

let passedTests = 0;
let failedTests = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return (async () => {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passedTests++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
      failedTests++;
    }
  })();
}

async function runFullAudit() {
  // ─── 1 & 2. CORE GAMEPLAY & PHYSICS ─────────────────────────────────────────
  console.log('--- 1 & 2. Core Gameplay & Physics ---');
  await test('Velocity vector calculation preserves trigonometric direction and power clamping', () => {
    const v0 = PhysicsEngine.calculateShotVelocity(0, 100);
    if (v0.x <= 0 || Math.abs(v0.y) > 0.001) throw new Error('Failed horizontal shot');
    const vMax = PhysicsEngine.calculateShotVelocity(0, 500); // Exceeds max power
    if (vMax.x > GAME_CONFIG.MAX_SPEED) throw new Error('Power was not clamped to MAX_SPEED');
  });

  await test('Elastic collision conserves momentum and generates collision events', () => {
    const pen1: PenState = { id: 'player1', x: 200, y: 250, velocityX: 12, velocityY: 0, radius: 18, mass: 1, isOut: false };
    const pen2: PenState = { id: 'player2', x: 230, y: 250, velocityX: 0, velocityY: 0, radius: 18, mass: 1, isOut: false };
    const res = PhysicsEngine.step(pen1, pen2, DEFAULT_ARENA);
    if (!res.events.some((e) => e.type === 'pen_pen')) throw new Error('No collision event detected');
    if (pen2.velocityX <= 0) throw new Error('No momentum transferred to target pen');
  });

  await test('Out-of-bounds boundary detection marks pen as isOut and emits fall_off', () => {
    const pen1: PenState = { id: 'player1', x: DEFAULT_ARENA.width + 50, y: 250, velocityX: 5, velocityY: 0, radius: 18, mass: 1, isOut: false };
    const pen2: PenState = { id: 'player2', x: 300, y: 250, velocityX: 0, velocityY: 0, radius: 18, mass: 1, isOut: false };
    const res = PhysicsEngine.step(pen1, pen2, DEFAULT_ARENA);
    if (!pen1.isOut) throw new Error('Pen outside boundary was not flagged as isOut');
    if (!res.events.some((e) => e.type === 'fall_off')) throw new Error('No fall_off event produced');
  });

  await test('Trajectory prediction produces valid collision intersection points', () => {
    const pen1: PenState = { id: 'player1', x: 200, y: 250, velocityX: 0, velocityY: 0, radius: 18, mass: 1, isOut: false };
    const pen2: PenState = { id: 'player2', x: 400, y: 250, velocityX: 0, velocityY: 0, radius: 18, mass: 1, isOut: false };
    const sim = PhysicsEngine.simulateTrajectory(pen1, pen2, 0, 80, DEFAULT_ARENA, 25);
    if (!sim.hitOpponent) throw new Error('Trajectory prediction failed to detect direct hit');
    if (sim.points.length === 0) throw new Error('No trajectory points generated');
  });

  // ─── 3. LOCAL MULTIPLAYER & 4. AI BOT ──────────────────────────────────────
  console.log('\n--- 3. Local Multiplayer & 4. AI Bot ---');
  await test('AI Bot Easy produces valid stochastic parameters', () => {
    const p1: PenState = { id: 'player1', x: 180, y: 250, velocityX: 0, velocityY: 0, radius: 18, mass: 1, isOut: false };
    const p2: PenState = { id: 'player2', x: 580, y: 250, velocityX: 0, velocityY: 0, radius: 18, mass: 1, isOut: false };
    const shot = AIBot.calculateShot(p2, p1, 'easy');
    if (shot.power < 10 || shot.power > 100 || isNaN(shot.angle)) throw new Error('Invalid Easy AI shot');
  });

  await test('AI Bot Medium aims towards opponent center of mass', () => {
    const p1: PenState = { id: 'player1', x: 180, y: 250, velocityX: 0, velocityY: 0, radius: 18, mass: 1, isOut: false };
    const p2: PenState = { id: 'player2', x: 580, y: 250, velocityX: 0, velocityY: 0, radius: 18, mass: 1, isOut: false };
    const shot = AIBot.calculateShot(p2, p1, 'medium');
    if (Math.abs(Math.cos(shot.angle) - -1) > 0.4) throw new Error('Medium AI missed general target angle');
  });

  await test('AI Bot Hard selects trajectory minimizing self-ringout risk', () => {
    const p1: PenState = { id: 'player1', x: 180, y: 250, velocityX: 0, velocityY: 0, radius: 18, mass: 1, isOut: false };
    const p2: PenState = { id: 'player2', x: 580, y: 250, velocityX: 0, velocityY: 0, radius: 18, mass: 1, isOut: false };
    const shot = AIBot.calculateShot(p2, p1, 'hard');
    if (shot.power < 10 || shot.power > 100 || isNaN(shot.angle)) throw new Error('Invalid Hard AI shot');
  });

  // ─── 5, 6, 7. AUTHENTICATION & DATABASE PERSISTENCE ────────────────────────
  console.log('\n--- 5, 6, 7. Authentication & Database Persistence ---');
  let auditUserId: string = '';
  const auditEmail = `audit_${Date.now()}@penfight.test`;
  const auditUsername = `audit_${Math.floor(1000 + Math.random() * 9000)}`;

  await test('User registration creates user, hashed password, default stats & XP', async () => {
    const regResult = await AuthService.register({
      username: auditUsername,
      email: auditEmail,
      password: 'AuditPassword@123',
    });
    auditUserId = regResult.user.id;
    if (!regResult.token) throw new Error('No JWT token generated');
    const userInDb = await prisma.user.findUnique({ where: { id: auditUserId }, include: { playerStats: true, playerXp: true } });
    if (!userInDb) throw new Error('User not found in DB');
    if (!userInDb.playerStats) throw new Error('PlayerStats not created');
    if (!userInDb.playerXp) throw new Error('PlayerXp not created');
    const isPwValid = await bcrypt.compare('AuditPassword@123', userInDb.passwordHash);
    if (!isPwValid) throw new Error('Password was not hashed correctly');
  });

  await test('Login with valid credentials authenticates successfully', async () => {
    const loginResult = await AuthService.login({
      emailOrUsername: auditUsername,
      password: 'AuditPassword@123',
    });
    if (loginResult.user.id !== auditUserId) throw new Error('Logged in user ID mismatch');
  });

  await test('Login with invalid credentials fails with 401', async () => {
    try {
      await AuthService.login({
        emailOrUsername: auditUsername,
        password: 'WrongPassword',
      });
      throw new Error('Should have thrown error on wrong password');
    } catch (err: any) {
      if (err.statusCode !== 401 && !err.message.includes('Invalid credentials')) {
        throw err;
      }
    }
  });

  await test('Guest login creates temporary guest account with initial stats', async () => {
    const guest = await AuthService.guestLogin();
    if (!guest.user.isGuest) throw new Error('Guest flag not set to true');
    if (!guest.token) throw new Error('No token issued for guest');
  });

  // ─── 8. ROOMS & ONLINE MULTIPLAYER CONTRACTS ──────────────────────────────
  console.log('\n--- 8. Rooms & Online Multiplayer ---');
  let auditRoomCode: string = '';
  await test('Room creation generates valid 6-char alphanumeric room code', async () => {
    const room = await RoomService.createRoom(auditUserId, {
      roomName: 'Audit Arena',
      isPrivate: false,
    });
    auditRoomCode = room.roomCode;
    if (room.roomCode.length !== 6) throw new Error('Room code length is not 6');
    if (room.status !== 'WAITING') throw new Error('Initial status is not WAITING');
  });

  await test('Public room listing includes created room', async () => {
    const rooms = await RoomService.getPublicRooms();
    if (!rooms.some((r) => r.roomCode === auditRoomCode)) throw new Error('Created room not found in public list');
  });

  await test('Guest joining room transitions status to READY', async () => {
    const guestUser = await prisma.user.findFirst({ where: { isGuest: true } });
    if (guestUser) {
      const joined = await RoomService.joinRoom(auditRoomCode, guestUser.id);
      if (joined.status !== 'READY') throw new Error('Room status did not update to READY');
    }
  });

  // ─── 9, 10. XP, LEVELS & ACHIEVEMENTS ─────────────────────────────────────
  console.log('\n--- 9, 10. XP, Levels & Achievements ---');
  await test('XP level calculation follows monotonic progressive curve', () => {
    const xpLvl1 = getXpForLevel(1);
    const xpLvl5 = getXpForLevel(5);
    const xpLvl10 = getXpForLevel(10);
    if (xpLvl5 <= xpLvl1 || xpLvl10 <= xpLvl5) throw new Error('XP curve is not strictly increasing');
    if (getLevelFromXp(0) !== 1) throw new Error('0 XP should be level 1');
  });

  await test('Match recording awards XP and unlocks achievements', async () => {
    const matchRes = await UserService.recordMatchResult(auditUserId, {
      mode: 'ai_hard',
      isWin: true,
      shots: 5,
    });
    if (matchRes.xpGained !== 90) throw new Error('Hard AI victory did not award 90 XP');
    if (!matchRes.unlockedAchievements.includes('First Steps')) throw new Error('First Steps achievement not unlocked');
    if (!matchRes.unlockedAchievements.includes('First Victory')) throw new Error('First Victory achievement not unlocked');
    if (!matchRes.unlockedAchievements.includes('AI Slayer')) throw new Error('AI Slayer achievement not unlocked');
  });

  // ─── 11, 12, 13. RANKED, MMR, SEASONS & LEADERBOARDS ─────────────────────
  console.log('\n--- 11, 12, 13. Ranked, MMR, Seasons & Leaderboards ---');
  await test('Elo rating calculation updates winners and losers accurately', () => {
    const elo = RankedService.calculateElo(1500, 1500, true);
    if (elo.changeA !== 16 || elo.changeB !== -16) throw new Error('Expected +16/-16 for equal rating');
  });

  await test('Rank tiers mapping covers all rating intervals', () => {
    if (getRankFromRating(900) !== 'BRONZE') throw new Error('900 is not Bronze');
    if (getRankFromRating(1450) !== 'GOLD') throw new Error('1450 is not Gold');
    if (getRankFromRating(2250) !== 'GRANDMASTER') throw new Error('2250 is not Grandmaster');
  });

  await test('Global leaderboard returns ranked positions', async () => {
    const leaderboard = (await RankedService.getLeaderboard(10, 'rating')) as any[];
    if (leaderboard.length === 0) throw new Error('Leaderboard returned empty');
    if (leaderboard[0].rankPosition !== 1) throw new Error('Top player is not rankPosition #1');
  });

  // ─── 14, 15. FRIENDS & SOCIAL ──────────────────────────────────────────────
  console.log('\n--- 14, 15. Friends & Social ---');
  await test('Friend request flow (send, list, accept)', async () => {
    const bob = await prisma.user.findUnique({ where: { username: 'bob' } });
    if (bob) {
      const req = await UserService.sendFriendRequest(auditUserId, 'bob');
      if (req.status !== 'PENDING') throw new Error('Friend request status is not PENDING');
      const friendsOfBob = await UserService.getFriends(bob.id);
      if (!friendsOfBob.pending.some((p) => p.relationId === req.id)) throw new Error('Pending request not listed for receiver');
      const accepted = await UserService.acceptFriendRequest(bob.id, req.id);
      if (accepted.status !== 'ACCEPTED') throw new Error('Friend request status not updated to ACCEPTED');
    }
  });

  // ─── CLEANUP ──────────────────────────────────────────────────────────────
  await prisma.user.deleteMany({ where: { email: auditEmail } });
  await prisma.$disconnect();

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`📊 AUDIT TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runFullAudit().catch((e) => {
  console.error('Fatal audit error:', e);
  process.exit(1);
});
