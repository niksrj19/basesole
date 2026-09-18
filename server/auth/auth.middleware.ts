import { NextFunction, Request, Response } from 'express';
import { User } from '../../src/types.ts';
import { storeRepository } from '../repositories/store.repository.ts';
import { verifyAccessToken } from './auth.service.ts';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed token' });
  }
  const payload = verifyAccessToken(authHeader.slice(7));
  if (!payload) return res.status(401).json({ error: 'Unauthorized: Invalid or expired access token' });
  const user = await storeRepository.getUserById(payload.userId);
  if (!user) return res.status(401).json({ error: 'Unauthorized: User does not exist' });
  req.user = user;
  next();
}

export async function optionalAuthMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const payload = verifyAccessToken(authHeader.slice(7));
    if (payload) req.user = (await storeRepository.getUserById(payload.userId)) || undefined;
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden: Admin access required' });
  next();
}
