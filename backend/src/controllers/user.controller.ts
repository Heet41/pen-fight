import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../middleware/auth';

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserService.getProfile(id);
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  static async getMatchHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const matches = await UserService.getMatchHistory(userId);
      res.status(200).json({ success: true, data: { matches } });
    } catch (error) {
      next(error);
    }
  }

  static async getAchievements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const achievements = await UserService.getAchievements(userId);
      res.status(200).json({ success: true, data: { achievements } });
    } catch (error) {
      next(error);
    }
  }

  static async getInventory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const inventory = await UserService.getInventory(userId);
      res.status(200).json({ success: true, data: { inventory } });
    } catch (error) {
      next(error);
    }
  }

  static async equip(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const { itemId } = req.body;
      const equipped = await UserService.equipItem(userId, itemId);
      res.status(200).json({ success: true, data: { equipped } });
    } catch (error) {
      next(error);
    }
  }

  static async recordMatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const result = await UserService.recordMatchResult(userId, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getFriends(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const data = await UserService.getFriends(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async sendFriendRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { username } = req.body;
      const data = await UserService.sendFriendRequest(userId, username);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async acceptFriendRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { relationId } = req.body;
      const data = await UserService.acceptFriendRequest(userId, relationId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
