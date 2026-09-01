import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { AppError } from './errorHandler';
import { prisma } from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Check HTTP-only cookie or Authorization header
    let token = req.cookies?.['token'];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError(401, 'Authentication required');
    }

    const payload = verifyToken(token);
    if (!payload) {
      throw new AppError(401, 'Invalid or expired session. Please login again.');
    }

    // Verify user still exists
    const userExists = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new AppError(401, 'User account no longer exists');
    }

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token = req.cookies?.['token'];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        req.user = payload;
      }
    }
    next();
  } catch {
    next();
  }
}

export function requireAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user || !req.user.isAdmin) {
    return next(new AppError(403, 'Admin privileges required'));
  }
  next();
}
