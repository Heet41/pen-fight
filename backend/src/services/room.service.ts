import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { GameMode, RoomStatus } from '@prisma/client';

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface CreateRoomInput {
  roomName?: string;
  isPrivate?: boolean;
  gameMode?: GameMode;
  arena?: string;
  turnDurationSecs?: number;
  allowSpectators?: boolean;
  allowRematch?: boolean;
  isFriendly?: boolean;
}

export class RoomService {
  static async createRoom(hostUserId: string, input: CreateRoomInput) {
    let roomCode = generateRoomCode();
    let isUnique = false;

    while (!isUnique) {
      const existing = await prisma.room.findUnique({ where: { roomCode } });
      if (!existing) {
        isUnique = true;
      } else {
        roomCode = generateRoomCode();
      }
    }

    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    const room = await prisma.room.create({
      data: {
        roomCode,
        hostUserId,
        roomName: input.roomName || `${roomCode} Arena`,
        isPrivate: input.isPrivate ?? false,
        gameMode: input.gameMode || GameMode.CASUAL_ONLINE,
        arena: input.arena || 'classic',
        turnDurationSecs: input.turnDurationSecs || 30,
        allowSpectators: input.allowSpectators ?? false,
        allowRematch: input.allowRematch ?? true,
        isFriendly: input.isFriendly ?? true,
        expiresAt,
        status: RoomStatus.WAITING,
      },
      include: {
        host: {
          select: { id: true, username: true, avatar: true, playerStats: true },
        },
      },
    });

    return room;
  }

  static async joinRoom(roomCode: string, guestUserId: string) {
    const room = await prisma.room.findUnique({
      where: { roomCode: roomCode.toUpperCase() },
      include: {
        host: { select: { id: true, username: true, avatar: true, playerStats: true } },
        guest: { select: { id: true, username: true, avatar: true, playerStats: true } },
      },
    });

    if (!room) {
      throw new AppError(404, 'Room not found. Please check the room code.');
    }

    if (room.status === RoomStatus.IN_PROGRESS) {
      throw new AppError(400, 'Game is already in progress');
    }

    if (room.isLocked) {
      throw new AppError(403, 'This room is currently locked by the host');
    }

    if (room.hostUserId === guestUserId) {
      return room; // Host reconnecting
    }

    if (room.guestUserId && room.guestUserId !== guestUserId) {
      throw new AppError(400, 'Room is already full (2/2 players)');
    }

    const updated = await prisma.room.update({
      where: { id: room.id },
      data: {
        guestUserId,
        status: RoomStatus.READY,
      },
      include: {
        host: { select: { id: true, username: true, avatar: true, playerStats: true } },
        guest: { select: { id: true, username: true, avatar: true, playerStats: true } },
      },
    });

    return updated;
  }

  static async getPublicRooms() {
    const rooms = await prisma.room.findMany({
      where: {
        isPrivate: false,
        status: { in: [RoomStatus.WAITING, RoomStatus.READY] },
        expiresAt: { gt: new Date() },
      },
      include: {
        host: { select: { id: true, username: true, avatar: true, playerStats: true } },
        guest: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return rooms;
  }

  static async getRoomByCode(code: string) {
    const room = await prisma.room.findUnique({
      where: { roomCode: code.toUpperCase() },
      include: {
        host: { select: { id: true, username: true, avatar: true, playerStats: true, playerXp: true } },
        guest: { select: { id: true, username: true, avatar: true, playerStats: true, playerXp: true } },
      },
    });

    if (!room) {
      throw new AppError(404, 'Room not found');
    }

    return room;
  }

  static async leaveRoom(roomId: string, userId: string) {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return null;

    if (room.hostUserId === userId) {
      // Host left -> cancel room
      return prisma.room.update({
        where: { id: roomId },
        data: { status: RoomStatus.ABANDONED },
      });
    } else if (room.guestUserId === userId) {
      // Guest left -> reset guest slot
      return prisma.room.update({
        where: { id: roomId },
        data: { guestUserId: null, status: RoomStatus.WAITING },
      });
    }

    return room;
  }
}
