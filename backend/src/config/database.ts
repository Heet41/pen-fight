import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Singleton Prisma client
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env['NODE_ENV'] === 'development'
      ? ['error', 'warn']
      : ['error'],
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test DB connectivity on startup
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', (error as Error).message);
    logger.warn('⚠️  Running without database — some features will be unavailable');
    // Don't crash — allow health endpoint to still respond
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
