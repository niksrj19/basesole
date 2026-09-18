import jwt from 'jsonwebtoken';
import { Role, User } from '../../src/types.ts';
import { storeRepository } from '../repositories/store.repository.ts';

const ACCESS_SECRET = process.env.JWT_SECRET || 'solevault_access_jwt_secret_key_2026_xyz';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'solevault_refresh_jwt_secret_key_2026_xyz';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export async function generateTokens(user: User) {
  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30m' });
  await storeRepository.saveRefreshToken(
    refreshToken,
    user.id,
    new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  );
  return { accessToken, refreshToken, expiresIn: 15 * 60, user };
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload | null> {
  try {
    if (!(await storeRepository.findRefreshToken(token))) return null;
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
