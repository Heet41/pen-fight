import { Request, Response, NextFunction } from 'express';
import { RankedService } from '../services/ranked.service';

export class LeaderboardController {
  static async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.query.type as 'rating' | 'winrate' | 'streak') || 'rating';
      const limit = parseInt(req.query.limit as string, 10) || 50;

      const leaderboard = await RankedService.getLeaderboard(limit, type);
      const activeSeason = await RankedService.getActiveSeason();

      res.status(200).json({
        success: true,
        data: {
          leaderboard,
          season: activeSeason,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
