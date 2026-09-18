import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware.ts';
import { adminLogin, demoSwitchController, getGoogleUrl, googleExchange, googleLogin, logoutController, me, refresh } from '../controllers/auth.controller.ts';

export const authRoutes = Router();
authRoutes.post('/admin-login', adminLogin);
authRoutes.get('/google/url', getGoogleUrl);
authRoutes.post('/google/exchange', googleExchange);
authRoutes.post('/login-google', googleLogin);
authRoutes.post('/login-gmail', googleLogin);
authRoutes.post('/refresh', refresh);
authRoutes.get('/me', authMiddleware, me);
authRoutes.post('/logout', logoutController);
authRoutes.post('/demo-switch', demoSwitchController);
