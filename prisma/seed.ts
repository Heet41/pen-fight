import { PrismaClient, GameMode, SeasonStatus, AchievementRarity, ItemType, ItemRarity } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

async function seedAchievements() {
  console.log('🏆 Seeding achievements...');

  const achievements = [
    {
      name: 'First Steps',
      description: 'Complete your first match.',
      icon: '✒️',
      requirementType: 'games_played',
      requirementValue: 1,
      rarity: AchievementRarity.COMMON,
      xpReward: 50,
    },
    {
      name: 'First Victory',
      description: 'Win your first match.',
      icon: '🏆',
      requirementType: 'games_won',
      requirementValue: 1,
      rarity: AchievementRarity.COMMON,
      xpReward: 100,
    },
    {
      name: 'First Online Match',
      description: 'Complete your first online match.',
      icon: '🌐',
      requirementType: 'online_matches',
      requirementValue: 1,
      rarity: AchievementRarity.COMMON,
      xpReward: 75,
    },
    {
      name: 'Hat Trick',
      description: 'Win 5 matches.',
      icon: '🎩',
      requirementType: 'games_won',
      requirementValue: 5,
      rarity: AchievementRarity.UNCOMMON,
      xpReward: 150,
    },
    {
      name: 'Veteran Fighter',
      description: 'Win 10 matches.',
      icon: '⚔️',
      requirementType: 'games_won',
      requirementValue: 10,
      rarity: AchievementRarity.UNCOMMON,
      xpReward: 250,
    },
    {
      name: 'Century',
      description: 'Play 10 matches.',
      icon: '💯',
      requirementType: 'games_played',
      requirementValue: 10,
      rarity: AchievementRarity.UNCOMMON,
      xpReward: 200,
    },
    {
      name: 'On Fire',
      description: 'Win 5 matches in a row.',
      icon: '🔥',
      requirementType: 'win_streak',
      requirementValue: 5,
      rarity: AchievementRarity.RARE,
      xpReward: 300,
    },
    {
      name: 'Untouchable',
      description: 'Win 10 matches in a row.',
      icon: '👑',
      requirementType: 'win_streak',
      requirementValue: 10,
      rarity: AchievementRarity.EPIC,
      xpReward: 500,
    },
    {
      name: 'AI Slayer',
      description: 'Beat the Hard AI 5 times.',
      icon: '🤖',
      requirementType: 'ai_hard_wins',
      requirementValue: 5,
      rarity: AchievementRarity.RARE,
      xpReward: 350,
    },
    {
      name: 'Ranked Veteran',
      description: 'Complete 25 ranked matches.',
      icon: '🎖️',
      requirementType: 'ranked_matches',
      requirementValue: 25,
      rarity: AchievementRarity.RARE,
      xpReward: 400,
    },
    {
      name: 'Golden Pen',
      description: 'Reach Gold rank.',
      icon: '✨',
      requirementType: 'reach_rank',
      requirementValue: 1400, // Gold min rating
      rarity: AchievementRarity.RARE,
      xpReward: 500,
    },
    {
      name: 'Diamond Tip',
      description: 'Reach Diamond rank.',
      icon: '💎',
      requirementType: 'reach_rank',
      requirementValue: 1800,
      rarity: AchievementRarity.EPIC,
      xpReward: 750,
    },
    {
      name: 'Master of Pen Fight',
      description: 'Reach Grandmaster rank.',
      icon: '🌟',
      requirementType: 'reach_rank',
      requirementValue: 2200,
      rarity: AchievementRarity.LEGENDARY,
      xpReward: 1000,
    },
    {
      name: 'Perfect Shot',
      description: 'Win a match in a single shot.',
      icon: '🎯',
      requirementType: 'one_shot_win',
      requirementValue: 1,
      rarity: AchievementRarity.EPIC,
      xpReward: 600,
    },
    {
      name: 'Social Butterfly',
      description: 'Add 5 friends.',
      icon: '🦋',
      requirementType: 'friends_count',
      requirementValue: 5,
      rarity: AchievementRarity.UNCOMMON,
      xpReward: 150,
    },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { name: ach.name },
      update: {},
      create: ach,
    });
  }

  console.log(`  ✓ ${achievements.length} achievements created`);
}

async function seedItems() {
  console.log('🎨 Seeding cosmetic items...');

  const items = [
    // Default pen skin (everyone has this)
    {
      name: 'Classic Blue Pen',
      description: 'The classic pen. Simple and reliable.',
      type: ItemType.PEN_SKIN,
      rarity: ItemRarity.COMMON,
      icon: '✒️',
      isDefault: true,
      data: { color: '#00d4ff', strokeColor: '#0099cc' },
    },
    {
      name: 'Classic Red Pen',
      description: 'A fiery red pen for player 2.',
      type: ItemType.PEN_SKIN,
      rarity: ItemRarity.COMMON,
      icon: '✒️',
      isDefault: true,
      data: { color: '#ef4444', strokeColor: '#cc0000' },
    },
    // Unlockable pen skins
    {
      name: 'Neon Purple Pen',
      description: 'Glow like the night with this neon purple pen.',
      type: ItemType.PEN_SKIN,
      rarity: ItemRarity.UNCOMMON,
      icon: '✒️',
      isDefault: false,
      data: { color: '#a855f7', strokeColor: '#7c3aed', glow: true },
    },
    {
      name: 'Golden Pen',
      description: 'Only the best fighters wield the golden pen.',
      type: ItemType.PEN_SKIN,
      rarity: ItemRarity.RARE,
      icon: '✒️',
      isDefault: false,
      data: { color: '#ffd700', strokeColor: '#b8860b', glow: true },
    },
    {
      name: 'Diamond Pen',
      description: 'The rarest pen. Obtained by Diamond+ players.',
      type: ItemType.PEN_SKIN,
      rarity: ItemRarity.EPIC,
      icon: '💎',
      isDefault: false,
      data: { color: '#b9f2ff', strokeColor: '#7ecfff', glow: true, sparkle: true },
    },
    // Trail effects
    {
      name: 'Fire Trail',
      description: 'Leave a blazing trail as you shoot.',
      type: ItemType.TRAIL_EFFECT,
      rarity: ItemRarity.RARE,
      icon: '🔥',
      isDefault: false,
      data: { particles: 'fire', color: '#f97316' },
    },
    {
      name: 'Star Trail',
      description: 'Shoot for the stars.',
      type: ItemType.TRAIL_EFFECT,
      rarity: ItemRarity.UNCOMMON,
      icon: '⭐',
      isDefault: false,
      data: { particles: 'stars', color: '#ffd700' },
    },
    // Titles
    {
      name: 'Newbie',
      description: 'Starting out.',
      type: ItemType.TITLE,
      rarity: ItemRarity.COMMON,
      icon: '📝',
      isDefault: true,
      data: { text: 'Newbie', color: '#9ca3af' },
    },
    {
      name: 'Champion',
      description: 'For champions of the arena.',
      type: ItemType.TITLE,
      rarity: ItemRarity.RARE,
      icon: '🏆',
      isDefault: false,
      data: { text: 'Champion', color: '#ffd700' },
    },
    {
      name: 'Grandmaster',
      description: 'The pinnacle of Pen Fight.',
      type: ItemType.TITLE,
      rarity: ItemRarity.LEGENDARY,
      icon: '🌟',
      isDefault: false,
      data: { text: 'Grandmaster', color: '#f97316' },
    },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
  }

  console.log(`  ✓ ${items.length} items created`);
}

async function seedSeasons() {
  console.log('📅 Seeding seasons...');

  const now = new Date();

  // Season 1 — completed
  await prisma.season.upsert({
    where: { name: 'Season 1: The Beginning' },
    update: {},
    create: {
      name: 'Season 1: The Beginning',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      status: SeasonStatus.COMPLETED,
    },
  });

  // Season 2 — active
  await prisma.season.upsert({
    where: { name: 'Season 2: Ink Wars' },
    update: {},
    create: {
      name: 'Season 2: Ink Wars',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-09-30'),
      status: SeasonStatus.ACTIVE,
    },
  });

  // Season 3 — upcoming
  await prisma.season.upsert({
    where: { name: 'Season 3: Paper Storm' },
    update: {},
    create: {
      name: 'Season 3: Paper Storm',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-12-31'),
      status: SeasonStatus.UPCOMING,
    },
  });

  console.log('  ✓ 3 seasons created');
}

async function seedUsers() {
  console.log('👤 Seeding users...');

  const activeSeason = await prisma.season.findFirst({
    where: { status: SeasonStatus.ACTIVE },
  });

  const defaultPen = await prisma.item.findFirst({
    where: { name: 'Classic Blue Pen' },
  });

  const testUsers = [
    {
      username: 'admin',
      email: 'admin@penfight.gg',
      password: 'Admin@12345',
      isAdmin: true,
      rating: 1800,
      rankedRating: 1750,
      gamesWon: 120,
      gamesPlayed: 150,
    },
    {
      username: 'alice',
      email: 'alice@penfight.gg',
      password: 'Alice@12345',
      isAdmin: false,
      rating: 1600,
      rankedRating: 1620,
      gamesWon: 85,
      gamesPlayed: 120,
    },
    {
      username: 'bob',
      email: 'bob@penfight.gg',
      password: 'Bob@12345',
      isAdmin: false,
      rating: 1400,
      rankedRating: 1380,
      gamesWon: 55,
      gamesPlayed: 90,
    },
    {
      username: 'charlie',
      email: 'charlie@penfight.gg',
      password: 'Charlie@12345',
      isAdmin: false,
      rating: 1200,
      rankedRating: 1150,
      gamesWon: 30,
      gamesPlayed: 60,
    },
    {
      username: 'diana',
      email: 'diana@penfight.gg',
      password: 'Diana@12345',
      isAdmin: false,
      rating: 2100,
      rankedRating: 2050,
      gamesWon: 200,
      gamesPlayed: 250,
    },
    {
      username: 'eve',
      email: 'eve@penfight.gg',
      password: 'Eve@12345',
      isAdmin: false,
      rating: 1050,
      rankedRating: 1000,
      gamesWon: 10,
      gamesPlayed: 25,
    },
  ];

  for (const u of testUsers) {
    const passwordHash = await hashPassword(u.password);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        username: u.username,
        email: u.email,
        passwordHash,
        isAdmin: u.isAdmin,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
      },
    });

    // PlayerStats
    const winRate = u.gamesPlayed > 0 ? (u.gamesWon / u.gamesPlayed) * 100 : 0;
    await prisma.playerStats.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        gamesPlayed: u.gamesPlayed,
        gamesWon: u.gamesWon,
        gamesLost: u.gamesPlayed - u.gamesWon,
        winRate,
        rating: u.rating,
        totalShots: u.gamesPlayed * 8,
        bestWinStreak: Math.floor(u.gamesWon / 5),
        currentStreak: 0,
      },
    });

    // PlayerXP
    const totalXp = u.gamesWon * 150 + (u.gamesPlayed - u.gamesWon) * 50;
    const level = Math.floor(Math.sqrt(totalXp / 100)) + 1;
    await prisma.playerXp.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        totalXp,
        currentLevel: level,
      },
    });

    // PlayerPresence
    await prisma.playerPresence.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        status: 'OFFLINE',
        lastSeen: new Date(),
      },
    });

    // Ranked Rating for active season
    if (activeSeason) {
      const rankName = getRankName(u.rankedRating);
      await prisma.rankedRating.upsert({
        where: { userId_seasonId: { userId: user.id, seasonId: activeSeason.id } },
        update: {},
        create: {
          userId: user.id,
          seasonId: activeSeason.id,
          rating: u.rankedRating,
          rank: rankName,
          division: 1,
          peakRating: u.rankedRating,
          peakRank: rankName,
          wins: u.gamesWon,
          losses: u.gamesPlayed - u.gamesWon,
          isPlacement: false,
        },
      });
    }

    // Give default items
    if (defaultPen) {
      await prisma.userInventory.upsert({
        where: { userId_itemId: { userId: user.id, itemId: defaultPen.id } },
        update: {},
        create: { userId: user.id, itemId: defaultPen.id },
      });

      await prisma.equippedItem.upsert({
        where: { userId_slot: { userId: user.id, slot: 'PEN_SKIN' } },
        update: {},
        create: { userId: user.id, slot: 'PEN_SKIN', itemId: defaultPen.id },
      });
    }

    console.log(`  ✓ User: ${u.username} (${u.email}) — Rating: ${u.rating}`);
  }

  // Seed a friend relationship (alice ↔ bob)
  const alice = await prisma.user.findUnique({ where: { email: 'alice@penfight.gg' } });
  const bob = await prisma.user.findUnique({ where: { email: 'bob@penfight.gg' } });
  if (alice && bob) {
    await prisma.friend.upsert({
      where: { senderId_receiverId: { senderId: alice.id, receiverId: bob.id } },
      update: {},
      create: { senderId: alice.id, receiverId: bob.id, status: 'ACCEPTED' },
    });
  }

  console.log(`  ✓ ${testUsers.length} users seeded`);
}

async function seedSampleMatch() {
  console.log('🎮 Seeding sample completed match...');

  const alice = await prisma.user.findUnique({ where: { email: 'alice@penfight.gg' } });
  const bob = await prisma.user.findUnique({ where: { email: 'bob@penfight.gg' } });
  const activeSeason = await prisma.season.findFirst({ where: { status: SeasonStatus.ACTIVE } });

  if (!alice || !bob || !activeSeason) return;

  const matchStart = new Date(Date.now() - 5 * 60 * 1000); // 5 min ago
  const matchEnd = new Date(Date.now() - 2 * 60 * 1000);   // 2 min ago

  const existingMatch = await prisma.match.findFirst({
    where: { player1Id: alice.id, player2Id: bob.id, status: 'COMPLETED' },
  });

  if (!existingMatch) {
    const match = await prisma.match.create({
      data: {
        mode: GameMode.RANKED,
        status: 'COMPLETED',
        player1Id: alice.id,
        player2Id: bob.id,
        winnerId: alice.id,
        seasonId: activeSeason.id,
        arena: 'classic',
        p1RatingBefore: 1600,
        p2RatingBefore: 1380,
        p1RatingAfter: 1620,
        p2RatingAfter: 1362,
        startedAt: matchStart,
        completedAt: matchEnd,
      },
    });

    await prisma.matchPlayer.createMany({
      data: [
        { matchId: match.id, userId: alice.id, side: 'PLAYER1', result: 'WIN', shots: 5 },
        { matchId: match.id, userId: bob.id, side: 'PLAYER2', result: 'LOSS', shots: 4 },
      ],
    });

    await prisma.matchEvent.createMany({
      data: [
        { matchId: match.id, playerId: alice.id, eventType: 'SHOT', eventData: { angle: 1.2, power: 80, turn: 1 } },
        { matchId: match.id, playerId: bob.id, eventType: 'SHOT', eventData: { angle: 2.5, power: 65, turn: 2 } },
        { matchId: match.id, playerId: alice.id, eventType: 'COLLISION', eventData: { pen1: 'p1', pen2: 'p2', turn: 2 } },
        { matchId: match.id, playerId: alice.id, eventType: 'MATCH_END', eventData: { winner: 'player1', reason: 'pen_out' } },
      ],
    });

    console.log('  ✓ Sample match created');
  } else {
    console.log('  → Sample match already exists, skipping');
  }
}

// ─── Rank helper ──────────────────────────────────────────────────────────────
function getRankName(rating: number): string {
  if (rating >= 2200) return 'GRANDMASTER';
  if (rating >= 2000) return 'MASTER';
  if (rating >= 1800) return 'DIAMOND';
  if (rating >= 1600) return 'PLATINUM';
  if (rating >= 1400) return 'GOLD';
  if (rating >= 1200) return 'SILVER';
  return 'BRONZE';
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌱 Starting Pen Fight database seed...\n');

  await seedAchievements();
  await seedItems();
  await seedSeasons();
  await seedUsers();
  await seedSampleMatch();

  console.log('\n✅ Database seeded successfully!\n');
  console.log('Test accounts:');
  console.log('  admin@penfight.gg   / Admin@12345  (admin)');
  console.log('  alice@penfight.gg   / Alice@12345  (Platinum, ~1600 rating)');
  console.log('  bob@penfight.gg     / Bob@12345    (Gold, ~1400 rating)');
  console.log('  charlie@penfight.gg / Charlie@12345 (Silver, ~1200 rating)');
  console.log('  diana@penfight.gg   / Diana@12345  (Master, ~2100 rating)');
  console.log('  eve@penfight.gg     / Eve@12345    (Bronze, ~1050 rating)');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
