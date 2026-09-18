import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware.ts';
import { addAddress, deleteAddress, listAddresses, updateAddress, updateProfile } from '../services/user.service.ts';

export async function getAddresses(req: AuthenticatedRequest, res: Response) { res.json({ addresses: await listAddresses(req.user!.id) }); }
export async function createAddress(req: AuthenticatedRequest, res: Response) { const { recipientName, street, city, state, postalCode, country, phoneNumber } = req.body; if (!recipientName || !street || !city || !state || !postalCode || !country || !phoneNumber) return res.status(400).json({ error: 'Required address fields are missing' }); const address = await addAddress({ ...req.body, userId: req.user!.id, country: String(country).trim(), isDefault: !!req.body.isDefault }); res.status(201).json({ address }); }
export async function editAddress(req: AuthenticatedRequest, res: Response) { const address = await updateAddress(req.params.id, req.body); if (!address) return res.status(404).json({ error: 'Address not found' }); res.json({ address }); }
export async function removeAddress(req: AuthenticatedRequest, res: Response) { if (!(await deleteAddress(req.params.id))) return res.status(404).json({ error: 'Address not found' }); res.json({ success: true }); }
export async function editProfile(req: AuthenticatedRequest, res: Response) { const { name, phoneNumber, preferredSize, avatarUrl } = req.body; res.json({ user: await updateProfile(req.user!.id, { name, phoneNumber, preferredSize: preferredSize ? Number(preferredSize) : undefined, avatarUrl }) }); }
