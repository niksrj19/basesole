import { Request, Response } from 'express';
import { getSettings, updateSettings } from '../services/settings.service.ts';
export async function settings(_req: Request, res: Response) { const value = await getSettings(); res.json({ settings: value, ...value }); }
export async function updateSettingsController(req: Request, res: Response) { try { const value = await updateSettings(req.body); res.json({ settings: value, ...value, message: 'Store payment settings updated successfully' }); } catch (error: any) { res.status(500).json({ error: error.message || 'Failed to update store payment settings' }); } }
