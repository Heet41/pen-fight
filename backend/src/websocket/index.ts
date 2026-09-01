import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { PhysicsEngine, DEFAULT_ARENA } from '../../../shared/src/physics';
import { PenState, PlayerSide, GAME_CONFIG } from '../../../shared/src';
import { prisma } from '../config/database';

interface RoomSession {
  roomCode: string;
  hostId: string;
  hostSocketId: string;
  guestId?: string;
  guestSocketId?: string;
  hostReady: boolean;
  guestReady: boolean;
  gameState?: {
    matchId?: string;
    currentTurn: PlayerSide;
    turnNumber: number;
    pen1: PenState;
    pen2: PenState;
    isSimulating: boolean;
    winner?: PlayerSide;
  };
}

const rooms = new Map<string, RoomSession>();
const userSockets = new Map<string, string>(); // userId -> socketId
const socketUsers = new Map<string, TokenPayload>(); // socketId -> TokenPayload
const lastReactionTimes = new Map<string, number>(); // socketId -> timestamp
const lastQuickChatTimes = new Map<string, number>(); // socketId -> timestamp

export function setupSocketIO(io: SocketIOServer): void {
  // Socket Auth Middleware
  io.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.cookie?.split('token=')[1]?.split(';')[0];

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        socketUsers.set(socket.id, payload);
        userSockets.set(payload.userId, socket.id);
      }
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user = socketUsers.get(socket.id);
    logger.info(`⚡ Socket connected: ${socket.id} (User: ${user?.username || 'Anonymous'})`);

    // Emit initial connection ACK
    socket.emit('server:connected', {
      socketId: socket.id,
      user: user || null,
      timestamp: new Date().toISOString(),
    });

    // ─── ROOM EVENTS ─────────────────────────────────────────────────────────

    // Create / Host Room
    socket.on('room:create', ({ roomCode, hostUserId }) => {
      socket.join(`room:${roomCode}`);
      rooms.set(roomCode, {
        roomCode,
        hostId: hostUserId,
        hostSocketId: socket.id,
        hostReady: false,
        guestReady: false,
      });

      logger.info(`Room created: ${roomCode} by ${hostUserId}`);
      socket.emit('room:updated', rooms.get(roomCode));
    });

    // Join Room
    socket.on('room:join', ({ roomCode, guestUserId }) => {
      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit('room:error', { message: 'Room not found on socket server' });
        return;
      }

      socket.join(`room:${roomCode}`);
      room.guestId = guestUserId;
      room.guestSocketId = socket.id;

      logger.info(`User ${guestUserId} joined room: ${roomCode}`);
      io.to(`room:${roomCode}`).emit('room:updated', room);
    });

    // Toggle Ready State
    socket.on('room:ready', ({ roomCode, side, isReady }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      if (side === 'player1') {
        room.hostReady = isReady;
      } else {
        room.guestReady = isReady;
      }

      io.to(`room:${roomCode}`).emit('room:updated', room);

      // Start game when both ready
      if (room.hostReady && room.guestReady) {
        room.gameState = {
          currentTurn: 'player1',
          turnNumber: 1,
          isSimulating: false,
          pen1: {
            id: 'player1',
            x: 180,
            y: 250,
            velocityX: 0,
            velocityY: 0,
            radius: 18,
            mass: 1.0,
            isOut: false,
          },
          pen2: {
            id: 'player2',
            x: 580,
            y: 250,
            velocityX: 0,
            velocityY: 0,
            radius: 18,
            mass: 1.0,
            isOut: false,
          },
        };

        io.to(`room:${roomCode}`).emit('game:start', {
          roomCode,
          gameState: room.gameState,
        });

        logger.info(`Game started in room ${roomCode}`);
      }
    });

    // ─── AUTHORITATIVE IN-GAME EVENTS ────────────────────────────────────────

    // Submit Shot
    socket.on('game:shot', async ({ roomCode, side, angle, power }) => {
      const room = rooms.get(roomCode);
      if (!room || !room.gameState) return;

      const state = room.gameState;

      // 1. Authoritative Validation
      if (state.isSimulating) {
        socket.emit('game:error', { message: 'Move in progress' });
        return;
      }

      if (state.currentTurn !== side) {
        socket.emit('game:error', { message: 'Not your turn!' });
        return;
      }

      const clampedPower = Math.max(
        GAME_CONFIG.MIN_POWER,
        Math.min(GAME_CONFIG.MAX_POWER, power)
      );

      // 2. Broadcast shot animation trigger
      io.to(`room:${roomCode}`).emit('game:shot', {
        side,
        angle,
        power: clampedPower,
      });

      // 3. Server-authoritative physics step simulation
      state.isSimulating = true;
      const vel = PhysicsEngine.calculateShotVelocity(angle, clampedPower);
      const activePen = side === 'player1' ? state.pen1 : state.pen2;
      activePen.velocityX = vel.x;
      activePen.velocityY = vel.y;

      let isMoving = true;
      let ticks = 0;
      const maxTicks = 120; // safety ceiling (2 seconds)

      while (isMoving && ticks < maxTicks) {
        const stepResult = PhysicsEngine.step(state.pen1, state.pen2, DEFAULT_ARENA);
        isMoving = stepResult.isMoving;
        ticks++;
      }

      state.isSimulating = false;

      // 4. Determine Winner / Turn Switch
      let winner: PlayerSide | undefined;
      if (state.pen1.isOut && state.pen2.isOut) {
        winner = side === 'player1' ? 'player2' : 'player1';
      } else if (state.pen1.isOut) {
        winner = 'player2';
      } else if (state.pen2.isOut) {
        winner = 'player1';
      }

      state.winner = winner;

      if (!winner) {
        state.currentTurn = state.currentTurn === 'player1' ? 'player2' : 'player1';
        state.turnNumber += 1;
      }

      // 5. Emit Authoritative Result & Sync State
      io.to(`room:${roomCode}`).emit('game:state', {
        gameState: state,
        winner,
      });

      // If match ended, update user stats & award XP in database
      if (winner) {
        io.to(`room:${roomCode}`).emit('game:ended', { winner });
        await handleMatchCompletion(room, winner);
      }
    });

    // Rematch
    socket.on('rematch:request', ({ roomCode }) => {
      io.to(`room:${roomCode}`).emit('rematch:requested', { requestedBy: socket.id });
    });

    socket.on('rematch:accept', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      room.gameState = {
        currentTurn: 'player1',
        turnNumber: 1,
        isSimulating: false,
        pen1: {
          id: 'player1',
          x: 180,
          y: 250,
          velocityX: 0,
          velocityY: 0,
          radius: 18,
          mass: 1.0,
          isOut: false,
        },
        pen2: {
          id: 'player2',
          x: 580,
          y: 250,
          velocityX: 0,
          velocityY: 0,
          radius: 18,
          mass: 1.0,
          isOut: false,
        },
      };

      io.to(`room:${roomCode}`).emit('game:start', {
        roomCode,
        gameState: room.gameState,
      });
    });

    // ─── SOCIAL REACTIONS & QUICK CHAT ───────────────────────────────────────

    socket.on('reaction:send', ({ roomCode, emoji, senderName }) => {
      const now = Date.now();
      const last = lastReactionTimes.get(socket.id) || 0;
      if (now - last < 1200) return; // 1.2s anti-spam cooldown

      lastReactionTimes.set(socket.id, now);
      io.to(`room:${roomCode}`).emit('reaction:receive', {
        emoji,
        senderName,
        socketId: socket.id,
      });
    });

    socket.on('quickchat:send', ({ roomCode, message, senderName }) => {
      const now = Date.now();
      const last = lastQuickChatTimes.get(socket.id) || 0;
      if (now - last < 1500) return; // 1.5s anti-spam cooldown

      lastQuickChatTimes.set(socket.id, now);
      io.to(`room:${roomCode}`).emit('quickchat:receive', {
        message,
        senderName,
        socketId: socket.id,
      });
    });

    // ─── DISCONNECT / CLEANUP ────────────────────────────────────────────────

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      socketUsers.delete(socket.id);
      lastReactionTimes.delete(socket.id);
      lastQuickChatTimes.delete(socket.id);

      // Clean up rooms
      rooms.forEach((room, code) => {
        if (room.hostSocketId === socket.id || room.guestSocketId === socket.id) {
          io.to(`room:${code}`).emit('player:disconnect', {
            socketId: socket.id,
            isHost: room.hostSocketId === socket.id,
          });
        }
      });
    });
  });

  logger.info('⚡ Authoritative Multiplayer Socket.IO Ready');
}

// ─── Helper to Award XP and Update Stats in Postgres on Match End ─────────────
async function handleMatchCompletion(room: RoomSession, winner: PlayerSide) {
  try {
    const winnerUserId = winner === 'player1' ? room.hostId : room.guestId;
    const loserUserId = winner === 'player1' ? room.guestId : room.hostId;

    if (winnerUserId && loserUserId) {
      // Award Winner Stats & XP
      await prisma.playerStats.updateMany({
        where: { userId: winnerUserId },
        data: {
          gamesPlayed: { increment: 1 },
          gamesWon: { increment: 1 },
          currentStreak: { increment: 1 },
        },
      });

      await prisma.playerXp.updateMany({
        where: { userId: winnerUserId },
        data: { totalXp: { increment: 150 } },
      });

      // Award Loser Stats & XP
      await prisma.playerStats.updateMany({
        where: { userId: loserUserId },
        data: {
          gamesPlayed: { increment: 1 },
          gamesLost: { increment: 1 },
          currentStreak: 0,
        },
      });

      await prisma.playerXp.updateMany({
        where: { userId: loserUserId },
        data: { totalXp: { increment: 50 } },
      });
    }
  } catch (err) {
    logger.error('Failed to update stats after match:', (err as Error).message);
  }
}
