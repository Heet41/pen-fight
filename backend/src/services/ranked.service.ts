import { prisma } from '../config/database';
import { SeasonStatus } from '@prisma/client';
import { getRankFromRating, RANK_TIERS } from '../../../shared/src';

export class RankedService {
  /**
   * Calculate standard Elo rating update
   */
  static calculateElo(
    ratingA: number,
    ratingB: number,
    aWon: boolean,
    kFactor: number = 32
  ): { newRatingA: number; newRatingB: number; changeA: number; changeB: number } {
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));

    const actualA = aWon ? 1 : 0;
    const actualB = aWon ? 0 : 1;

    const changeA = Math.round(kFactor * (actualA - expectedA));
    const changeB = Math.round(kFactor * (actualB - expectedB));

    const newRatingA = Math.max(100, ratingA + changeA);
    const newRatingB = Math.max(100, ratingB + changeB);

    return { newRatingA, newRatingB, changeA, changeB };
  }

  /**
   * Get Global Ranked Leaderboard
   */
  static async getLeaderboard(limit: number = 50, type: 'rating' | 'winrate' | 'streak' = 'rating') {
    if (type === 'winrate') {
      return prisma.playerStats.findMany({
        where: { gamesPlayed: { gte: 5 } },
        include: {
          user: {
            select: { id: true, username: true, avatar: true, playerXp: true },
          },
        },
        orderBy: { winRate: 'desc' },
        take: limit,
      });
    }

    if (type === 'streak') {
      return prisma.playerStats.findMany({
        where: { bestWinStreak: { gte: 1 } },
        include: {
          user: {
            select: { id: true, username: true, avatar: true, playerXp: true },
          },
        },
        orderBy: { bestWinStreak: 'desc' },
        take: limit,
      });
    }

    // Default: By MMR Rating
    const stats = await prisma.playerStats.findMany({
      include: {
        user: {
          select: { id: true, username: true, avatar: true, playerXp: true },
        },
      },
      orderBy: { rating: 'desc' },
      take: limit,
    });

    return stats.map((s, idx) => ({
      rankPosition: idx + 1,
      id: s.id,
      userId: s.userId,
      username: s.user.username,
      avatar: s.user.avatar,
      level: s.user.playerXp?.currentLevel || 1,
      rating: s.rating,
      rankTier: getRankFromRating(s.rating),
      rankColor: RANK_TIERS[getRankFromRating(s.rating)].color,
      gamesPlayed: s.gamesPlayed,
      gamesWon: s.gamesWon,
      gamesLost: s.gamesLost,
      winRate: Math.round(s.winRate),
      bestStreak: s.bestWinStreak,
    }));
  }

  /**
   * Get Active Competitive Season details
   */
  static async getActiveSeason() {
    const active = await prisma.season.findFirst({
      where: { status: SeasonStatus.ACTIVE },
    });
    return active;
  }
}
