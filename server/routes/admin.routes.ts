import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../auth/auth.middleware.ts';
import { metrics, role, users } from '../controllers/admin.controller.ts';
export const adminRoutes = Router();
adminRoutes.use(authMiddleware, requireAdmin);
adminRoutes.get('/metrics', metrics);
adminRoutes.get('/users', users);
adminRoutes.put('/users/:id/role', role);
