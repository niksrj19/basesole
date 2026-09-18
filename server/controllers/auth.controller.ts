import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware.ts';
import { storeRepository } from '../repositories/store.repository.ts';
import { demoSwitch, exchangeGoogleCode, getGoogleAuthUrl, loginAsAdmin, loginWithGoogleProfile, logout, refreshSession } from '../services/auth.service.ts';

export const getGoogleUrl = (_req: Request, res: Response) => res.json(getGoogleAuthUrl());

export async function googleExchange(req: Request, res: Response) {
  if (!req.body.code) return res.status(400).json({ error: 'Authorization code is required' });
  try { return res.json(await exchangeGoogleCode(req.body.code)); } catch (error: any) { return res.status(400).json({ error: error.message }); }
}

export async function googleLogin(req: Request, res: Response) {
  if (!req.body.email || typeof req.body.email !== 'string') return res.status(400).json({ error: 'Valid Google email address is required' });
  try { return res.json(await loginWithGoogleProfile(req.body.email, req.body.name, req.body.avatarUrl)); } catch (error: any) { return res.status(400).json({ error: error.message }); }
}

export async function adminLogin(req: Request, res: Response) {
  if (!req.body.email || !req.body.password) return res.status(400).json({ error: 'Admin email and password are required.' });
  try { return res.json({ ...(await loginAsAdmin(String(req.body.email), String(req.body.password))), message: 'Admin authentication successful' }); } catch (error: any) { return res.status(401).json({ error: error.message }); }
}

export async function refresh(req: Request, res: Response) {
  if (!req.body.refreshToken) return res.status(400).json({ error: 'Refresh token is required' });
  try { return res.json(await refreshSession(req.body.refreshToken)); } catch (error: any) { return res.status(401).json({ error: error.message }); }
}

export const me = (req: AuthenticatedRequest, res: Response) => res.json({ user: req.user });
export async function logoutController(req: Request, res: Response) { await logout(req.body.refreshToken); res.json({ success: true, message: 'Logged out successfully' }); }

export async function demoSwitchController(req: Request, res: Response) {
  const role = req.body.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
  res.json(await demoSwitch(role));
}
