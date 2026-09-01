import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'Pen Fight API',
    version: '1.0.0',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    environment: process.env['NODE_ENV'] ?? 'development',
  });
});

export default router;
