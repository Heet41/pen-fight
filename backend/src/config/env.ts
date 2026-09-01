import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root in development if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const rawCors = process.env['CORS_ORIGIN'] ?? 'http://localhost:5173';
const corsOrigins = rawCors.includes(',')
  ? rawCors.split(',').map((o) => o.trim())
  : rawCors;

export const config = {
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  host: process.env['HOST'] ?? '0.0.0.0',
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  databaseUrl: requireEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/penfight?schema=public'),
  jwtSecret: requireEnv('JWT_SECRET', 'dev-jwt-secret-change-in-production'),
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
  cookieSecret: requireEnv('COOKIE_SECRET', 'dev-cookie-secret-change-in-production'),
  corsOrigin: corsOrigins,
  frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
  rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '900000', 10),
  rateLimitMax: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] ?? '200', 10),
  authRateLimitMax: parseInt(process.env['AUTH_RATE_LIMIT_MAX'] ?? '20', 10),
  isProduction: (process.env['NODE_ENV'] ?? 'development') === 'production',
  isDevelopment: (process.env['NODE_ENV'] ?? 'development') === 'development',
};
