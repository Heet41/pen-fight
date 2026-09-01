import { prisma } from '../config/database';
import { ItemType } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        playerStats: true,
        playerXp: true,
        equippedItems: {
          include: { item: true },
        },
        userAchievements: {
          include: { achievement: true },
        },
        rankedRatings: {
          include: { season: true },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      isGuest: user.isGuest,
      stats: user.playerStats,
      xp: user.playerXp,
      equipped: user.equippedItems,
      achievements: user.userAchievements,
      currentRank: user.rankedRatings[0] || null,
      createdAt: user.createdAt,
    };
  }

  static async getMatchHistory(userId: string) {
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ player1Id: userId }, { player2Id: userId }],
        status: 'COMPLETED',
      },
      include: {
        player1: { select: { id: true, username: true, avatar: true } },
        player2: { select: { id: true, username: true, avatar: true } },
        winner: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return matches.map((m) => {
      const isPlayer1 = m.player1Id === userId;
      const opponent = isPlayer1 ? m.player2 : m.player1;
      const isWinner = m.winnerId === userId;

      return {
        id: m.id,
        mode: m.mode,
        opponentName: opponent?.username || 'Opponent',
        opponentAvatar: opponent?.avatar,
        result: isWinner ? 'WIN' : 'LOSS',
        ratingBefore: isPlayer1 ? m.p1RatingBefore : m.p2RatingBefore,
        ratingAfter: isPlayer1 ? m.p1RatingAfter : m.p2RatingAfter,
        ratingChange: isPlayer1
          ? (m.p1RatingAfter ?? 0) - (m.p1RatingBefore ?? 0)
          : (m.p2RatingAfter ?? 0) - (m.p2RatingBefore ?? 0),
        arena: m.arena,
        createdAt: m.createdAt,
      };
    });
  }

  static async getAchievements(userId: string) {
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { xpReward: 'asc' },
    });

    const userUnlocked = await prisma.userAchievement.findMany({
      where: { userId },
    });

    const unlockedSet = new Set(userUnlocked.map((u) => u.achievementId));

    return allAchievements.map((ach) => ({
      ...ach,
      isUnlocked: unlockedSet.has(ach.id),
      unlockedAt: userUnlocked.find((u) => u.achievementId === ach.id)?.unlockedAt || null,
    }));
  }

  static async getInventory(userId: string) {
    const inventory = await prisma.userInventory.findMany({
      where: { userId },
      include: { item: true },
    });

    const equipped = await prisma.equippedItem.findMany({
      where: { userId },
    });

    const equippedSet = new Set(equipped.map((e) => e.itemId));

    return inventory.map((inv) => ({
      ...inv.item,
      isEquipped: equippedSet.has(inv.itemId),
      obtainedAt: inv.obtainedAt,
    }));
  }

  static async equipItem(userId: string, itemId: string) {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) throw new AppError(404, 'Item not found');

    // Verify user owns the item
    const owns = await prisma.userInventory.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });
    if (!owns) throw new AppError(403, 'You do not own this item');

    const result = await prisma.equippedItem.upsert({
      where: { userId_slot: { userId, slot: item.type } },
      update: { itemId: item.id },
      create: { userId, slot: item.type, itemId: item.id },
      include: { item: true },
    });

    return result;
  }

  static async recordMatchResult(
    userId: string,
    input: { mode: string; isWin: boolean; shots: number }
  ) {
    const { mode, isWin, shots } = input;

    // 1. Calculate XP reward
    let xpGain = 15;
    if (isWin) {
      if (mode === 'ai_easy') xpGain = 30;
      else if (mode === 'ai_medium') xpGain = 60;
      else if (mode === 'ai_hard') xpGain = 90;
      else xpGain = 50;
    }

    return await prisma.$transaction(async (tx) => {
      // 2. Update Player Stats
      const stats = await tx.playerStats.findUnique({ where: { userId } });
      const currentWon = (stats?.gamesWon ?? 0) + (isWin ? 1 : 0);
      const currentPlayed = (stats?.gamesPlayed ?? 0) + 1;
      const currentLost = (stats?.gamesLost ?? 0) + (isWin ? 0 : 1);
      const newStreak = isWin ? (stats?.currentStreak ?? 0) + 1 : 0;
      const bestStreak = Math.max(stats?.bestWinStreak ?? 0, newStreak);
      const winRate = (currentWon / currentPlayed) * 100;

      const updatedStats = await tx.playerStats.update({
        where: { userId },
        data: {
          gamesPlayed: currentPlayed,
          gamesWon: currentWon,
          gamesLost: currentLost,
          winRate,
          currentStreak: newStreak,
          bestWinStreak: bestStreak,
          totalShots: { increment: shots || 4 },
        },
      });

      // 3. Update XP & Check Level Up
      const playerXp = await tx.playerXp.findUnique({ where: { userId } });
      const oldXp = playerXp?.totalXp ?? 0;
      const oldLevel = playerXp?.currentLevel ?? 1;
      const newXp = oldXp + xpGain;
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
      const leveledUp = newLevel > oldLevel;

      await tx.playerXp.update({
        where: { userId },
        data: {
          totalXp: newXp,
          currentLevel: newLevel,
        },
      });

      // 4. Record XP transaction
      await tx.xpTransaction.create({
        data: {
          userId,
          amount: xpGain,
          reason: isWin ? `Victory in ${mode}` : `Match in ${mode}`,
        },
      });

      // 5. Check and unlock achievements
      const unlockedAchievements: string[] = [];
      const userAchs = await tx.userAchievement.findMany({ where: { userId } });
      const unlockedIds = new Set(userAchs.map((u) => u.achievementId));

      const checkAchievement = async (name: string) => {
        const ach = await tx.achievement.findUnique({ where: { name } });
        if (ach && !unlockedIds.has(ach.id)) {
          await tx.userAchievement.create({
            data: { userId, achievementId: ach.id },
          });
          unlockedAchievements.push(ach.name);
        }
      };

      if (currentPlayed >= 1) await checkAchievement('First Steps');
      if (isWin && currentWon >= 1) await checkAchievement('First Victory');
      if (currentWon >= 5) await checkAchievement('Hat Trick');
      if (currentWon >= 10) await checkAchievement('Veteran Fighter');
      if (bestStreak >= 5) await checkAchievement('On Fire');
      if (isWin && mode === 'ai_hard') await checkAchievement('AI Slayer');

      // 6. Record completed match record
      const modeMapping: Record<string, any> = {
        ai_easy: 'AI_EASY',
        ai_medium: 'AI_MEDIUM',
        ai_hard: 'AI_HARD',
        local: 'LOCAL',
      };
      const dbMode = modeMapping[mode] || 'LOCAL';

      await tx.match.create({
        data: {
          mode: dbMode,
          status: 'COMPLETED',
          player1Id: userId,
          winnerId: isWin ? userId : undefined,
          completedAt: new Date(),
        },
      });

      return {
        xpGained: xpGain,
        totalXp: newXp,
        currentLevel: newLevel,
        leveledUp,
        unlockedAchievements,
        stats: updatedStats,
      };
    });
  }

  static async getFriends(userId: string) {
    const sent = await prisma.friend.findMany({
      where: { senderId: userId },
      include: {
        receiver: { select: { id: true, username: true, avatar: true, playerStats: true, playerPresence: true } },
      },
    });

    const received = await prisma.friend.findMany({
      where: { receiverId: userId },
      include: {
        sender: { select: { id: true, username: true, avatar: true, playerStats: true, playerPresence: true } },
      },
    });

    const acceptedFriends = [
      ...sent.filter((f) => f.status === 'ACCEPTED').map((f) => ({ friend: f.receiver, relationId: f.id, status: 'ACCEPTED' })),
      ...received.filter((f) => f.status === 'ACCEPTED').map((f) => ({ friend: f.sender, relationId: f.id, status: 'ACCEPTED' })),
    ];

    const pendingRequests = received.filter((f) => f.status === 'PENDING').map((f) => ({
      sender: f.sender,
      relationId: f.id,
      createdAt: f.createdAt,
    }));

    return { friends: acceptedFriends, pending: pendingRequests };
  }

  static async sendFriendRequest(senderId: string, targetUsername: string) {
    const target = await prisma.user.findUnique({ where: { username: targetUsername } });
    if (!target) throw new AppError(404, 'User not found');
    if (target.id === senderId) throw new AppError(400, 'Cannot add yourself as a friend');

    const existing = await prisma.friend.findFirst({
      where: {
        OR: [
          { senderId, receiverId: target.id },
          { senderId: target.id, receiverId: senderId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') throw new AppError(400, 'Already friends');
      throw new AppError(400, 'Friend request already pending');
    }

    const friend = await prisma.friend.create({
      data: {
        senderId,
        receiverId: target.id,
        status: 'PENDING',
      },
    });

    return friend;
  }

  static async acceptFriendRequest(userId: string, relationId: string) {
    const request = await prisma.friend.findUnique({ where: { id: relationId } });
    if (!request || request.receiverId !== userId) {
      throw new AppError(404, 'Friend request not found');
    }

    const updated = await prisma.friend.update({
      where: { id: relationId },
      data: { status: 'ACCEPTED' },
    });

    return updated;
  }
}
