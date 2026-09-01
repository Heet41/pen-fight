import { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/room.service';
import { AuthenticatedRequest } from '../middleware/auth';

export class RoomController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user?.userId;
      if (!hostId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      const room = await RoomService.createRoom(hostId, req.body);
      res.status(201).json({ success: true, data: { room } });
    } catch (error) {
      next(error);
    }
  }

  static async join(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const guestId = req.user?.userId;
      if (!guestId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      const { roomCode } = req.body;
      const room = await RoomService.joinRoom(roomCode, guestId);
      res.status(200).json({ success: true, data: { room } });
    } catch (error) {
      next(error);
    }
  }

  static async getPublic(_req: Request, res: Response, next: NextFunction) {
    try {
      const rooms = await RoomService.getPublicRooms();
      res.status(200).json({ success: true, data: { rooms } });
    } catch (error) {
      next(error);
    }
  }

  static async getByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const room = await RoomService.getRoomByCode(code);
      res.status(200).json({ success: true, data: { room } });
    } catch (error) {
      next(error);
    }
  }

  static async leave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      const { id } = req.params;
      const room = await RoomService.leaveRoom(id, userId);
      res.status(200).json({ success: true, data: { room } });
    } catch (error) {
      next(error);
    }
  }
}
