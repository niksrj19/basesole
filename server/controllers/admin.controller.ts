import { Request, Response } from 'express';
import { Role } from '../../src/types.ts';
import { getMetrics, getUserStats, updateUserRole } from '../services/admin.service.ts';
export async function metrics(_req: Request, res: Response) { res.json(await getMetrics()); }
export async function users(_req: Request, res: Response) { res.json({ users: await getUserStats() }); }
export async function role(req: Request, res: Response) { if (req.body.role !== 'CUSTOMER' && req.body.role !== 'ADMIN') return res.status(400).json({ error: 'Invalid role' }); const user = await updateUserRole(req.params.id, req.body.role as Role); if (!user) return res.status(404).json({ error: 'User not found' }); res.json({ user }); }
