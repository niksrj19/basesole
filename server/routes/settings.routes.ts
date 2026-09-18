import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../auth/auth.middleware.ts';
import { settings, updateSettingsController } from '../controllers/settings.controller.ts';
export const settingsRoutes = Router();
settingsRoutes.get('/', settings);
settingsRoutes.put('/', authMiddleware, requireAdmin, updateSettingsController);
