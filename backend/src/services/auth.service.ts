import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { signToken, TokenPayload } from '../utils/jwt';
import { registerSchema, loginSchema } from '../utils/validators';
import { ItemType } from '@prisma/client';

export class AuthService {
  static async register(input: unknown) {
    const validated = registerSchema.parse(input);

    // Check if user or email already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validated.email.toLowerCase() },
          { username: validated.username },
        ],
      },
    });

    if (existing) {
      if (existing.email === validated.email.toLowerCase()) {
        throw new AppError(400, 'Email is already registered');
      }
      throw new AppError(400, 'Username is already taken');
    }

    const passwordHash = await bcrypt.hash(validated.password, 12);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${validated.username}`;

    // Create user and initial relations in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: validated.username,
          email: validated.email.toLowerCase(),
          passwordHash,
          avatar,
          isAdmin: false,
          isGuest: false,
        },
      });

      // Initialize Player Stats
      await tx.playerStats.create({
        data: {
          userId: newUser.id,
          gamesPlayed: 0,
          gamesWon: 0,
          gamesLost: 0,
          winRate: 0,
          rating: 1000,
          totalShots: 0,
          bestWinStreak: 0,
          currentStreak: 0,
        },
      });

      // Initialize XP
      await tx.playerXp.create({
        data: {
          userId: newUser.id,
          totalXp: 0,
          currentLevel: 1,
        },
      });

      // Initialize Presence
      await tx.playerPresence.create({
        data: {
          userId: newUser.id,
          status: 'ONLINE',
          lastSeen: new Date(),
        },
      });

      // Give default cosmetic items if available
      const defaultItems = await tx.item.findMany({
        where: { isDefault: true },
      });

      const equippedSlots = new Set<string>();

      for (const item of defaultItems) {
        await tx.userInventory.create({
          data: {
            userId: newUser.id,
            itemId: item.id,
          },
        });

        if (!equippedSlots.has(item.type)) {
          await tx.equippedItem.create({
            data: {
              userId: newUser.id,
              slot: item.type,
              itemId: item.id,
            },
          });
          equippedSlots.add(item.type);
        }
      }

      return newUser;
    });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      isGuest: user.isGuest,
    };

    const token = signToken(tokenPayload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        isGuest: user.isGuest,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async login(input: unknown) {
    const validated = loginSchema.parse(input);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validated.emailOrUsername.toLowerCase() },
          { username: validated.emailOrUsername },
        ],
      },
      include: {
        playerStats: true,
        playerXp: true,
      },
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Update presence
    await prisma.playerPresence.upsert({
      where: { userId: user.id },
      update: { status: 'ONLINE', lastSeen: new Date() },
      create: { userId: user.id, status: 'ONLINE', lastSeen: new Date() },
    });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      isGuest: user.isGuest,
    };

    const token = signToken(tokenPayload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        isGuest: user.isGuest,
        stats: user.playerStats,
        xp: user.playerXp,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async guestLogin() {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const username = `Guest_${randomSuffix}`;
    const email = `guest_${randomSuffix}_${Date.now()}@penfight.local`;
    const passwordHash = await bcrypt.hash(`guest_pwd_${Date.now()}`, 8);
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

    const user = await prisma.$transaction(async (tx) => {
      const guest = await tx.user.create({
        data: {
          username,
          email,
          passwordHash,
          avatar,
          isGuest: true,
        },
      });

      await tx.playerStats.create({
        data: {
          userId: guest.id,
          rating: 1000,
        },
      });

      await tx.playerXp.create({
        data: {
          userId: guest.id,
          totalXp: 0,
          currentLevel: 1,
        },
      });

      return guest;
    });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      username: user.username,
      isAdmin: false,
      isGuest: true,
    };

    const token = signToken(tokenPayload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isAdmin: false,
        isGuest: true,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        playerStats: true,
        playerXp: true,
        equippedItems: {
          include: {
            item: true,
          },
        },
        rankedRatings: {
          include: {
            season: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
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
      currentRank: user.rankedRatings[0] || null,
      createdAt: user.createdAt,
    };
  }
}
