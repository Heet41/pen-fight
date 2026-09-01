import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth.routes';
import roomRouter from './room.routes';
import userRouter from './user.routes';
import leaderboardRouter from './leaderboard.routes';

const router = Router();

// Health check
router.use('/health', healthRouter);

// Authentication
router.use('/auth', authRouter);

// Rooms
router.use('/rooms', roomRouter);

// Users & Profile & Inventory
router.use('/users', userRouter);

// Competitive Leaderboard
router.use('/leaderboard', leaderboardRouter);

export default router;
