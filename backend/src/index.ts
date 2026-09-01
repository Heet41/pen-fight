import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';

import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import apiRouter from './routes';
import { setupSocketIO } from './websocket';
import { logger } from './utils/logger';
import { connectDatabase, disconnectDatabase } from './config/database';

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.IO Setup ─────────────────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 10000,
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.cookieSecret));

// Apply global rate limiter
app.use('/api', rateLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── Serve Frontend in Production ─────────────────────────────────────────────
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(frontendDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// Root health check endpoint for cloud platforms
app.get('/health', (_req, res) => {
  res.redirect('/api/health');
});

// ─── WebSocket Setup ─────────────────────────────────────────────────────────
setupSocketIO(io);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = config.port;
const HOST = config.host;

httpServer.listen(PORT, HOST, async () => {
  logger.info(`🚀 Pen Fight server running on ${HOST}:${PORT}`);
  logger.info(`📡 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 CORS origin: ${Array.isArray(config.corsOrigin) ? config.corsOrigin.join(', ') : config.corsOrigin}`);
  logger.info(`🏥 Health check: http://${HOST}:${PORT}/api/health`);
  await connectDatabase();
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await disconnectDatabase();
  httpServer.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await disconnectDatabase();
  httpServer.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

export { io };
