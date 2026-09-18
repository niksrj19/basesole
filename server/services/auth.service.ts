import { User } from '../../src/types.ts';
import { storeRepository } from '../repositories/store.repository.ts';
import { generateTokens, verifyRefreshToken } from '../auth/auth.service.ts';

const GOOGLE_ADMIN_EMAILS = new Set(['niksrj.tak@gmail.com']);

export function getGoogleRedirectUri() {
  const configured = process.env.APP_URL?.trim();
  const appUrl = process.env.APP_URL?.trim()
  return `${appUrl}/api/auth/callback/google`;
}

function getGoogleUserRole(email: string): 'ADMIN' | 'CUSTOMER' {
  return GOOGLE_ADMIN_EMAILS.has(email) ? 'ADMIN' : 'CUSTOMER';
}

function assertGmail(email: string) {
  if (!email.endsWith('@gmail.com') && !email.endsWith('@googlemail.com')) {
    throw new Error('Only verified Google accounts (@gmail.com) are permitted to sign in to SoleVault.');
  }
}

export async function loginWithGoogleProfile(email: string, name?: string, avatarUrl?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  assertGmail(normalizedEmail);
  const role = getGoogleUserRole(normalizedEmail);
  let user = await storeRepository.getUserByEmail(normalizedEmail);
  if (!user) {
    user = await storeRepository.createUser({
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0].replace(/[._]/g, ' '),
      avatarUrl,
      role,
    });
  } else if (user.role !== role) {
    user = (await storeRepository.updateUser(user.id, { role })) || user;
  }
  return generateTokens(user);
}

export async function exchangeGoogleCode(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Google OAuth Client ID or Secret is not configured in .env');

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId.trim(), client_secret: clientSecret.trim(), redirect_uri: getGoogleRedirectUri(), grant_type: 'authorization_code' }),
  });
  if (!tokenResponse.ok) throw new Error(`Google OAuth token exchange failed: ${await tokenResponse.text()}`);
  const tokenData = await tokenResponse.json();
  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
  if (!profileResponse.ok) throw new Error('Failed to retrieve Google profile data');
  const profile = await profileResponse.json();
  return loginWithGoogleProfile(profile.email || '', profile.name, profile.picture);
}

export function getGoogleAuthUrl() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const redirectUri = getGoogleRedirectUri();
  if (!clientId) return { configured: false, redirectUri, message: 'GOOGLE_CLIENT_ID pending in environment. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env' };
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope: 'openid email profile', access_type: 'offline', prompt: 'select_account' });
  return { configured: true, url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, redirectUri };
}

export async function loginAsAdmin(email: string, password: string) {
  const configuredEmail = (process.env.ADMIN_EMAIL || 'admin@solevault.com').trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD || 'Admin@SoleVault2026!';
  if (email.trim().toLowerCase() !== configuredEmail || password !== configuredPassword) throw new Error('Invalid administrator credentials. Please check your credentials.');
  const user = await storeRepository.getOrCreateAdmin(configuredEmail, 'SoleVault Administrator');
  return generateTokens(user);
}

export async function refreshSession(refreshToken: string) {
  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) throw new Error('Invalid or expired refresh token');
  const user = await storeRepository.getUserById(payload.userId);
  if (!user) throw new Error('User associated with token not found');
  await storeRepository.deleteRefreshToken(refreshToken);
  return generateTokens(user);
}

export async function logout(refreshToken?: string) {
  if (refreshToken) await storeRepository.deleteRefreshToken(refreshToken);
}

export async function demoSwitch(role: 'ADMIN' | 'CUSTOMER') {
  const email = role === 'ADMIN' ? 'admin.solevault@gmail.com' : 'NIKKYRJ.TAK@gmail.com';
  let user = await storeRepository.getUserByEmail(email);
  if (!user) user = await storeRepository.createUser({ email, name: role === 'ADMIN' ? 'SoleVault Admin' : 'Nikky Tak', role });
  return generateTokens(user);
}
