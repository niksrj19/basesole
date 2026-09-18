import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware.ts';
import { addCartItem, clearCart, deleteCartItem, getCart, updateCartItem } from '../services/cart.service.ts';

const userId = (req: AuthenticatedRequest) => req.user!.id;
export async function getCartController(req: AuthenticatedRequest, res: Response) { res.json({ items: await getCart(userId(req)) }); }
export async function addCartItemController(req: AuthenticatedRequest, res: Response) { const { productId, size, color, quantity } = req.body; if (!productId || typeof size !== 'number' || !color || !Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ error: 'Product, size, color, and a positive quantity are required' }); try { const item = await addCartItem(userId(req), productId, size, color, quantity); res.status(201).json({ item, items: await getCart(userId(req)) }); } catch (error: any) { res.status(400).json({ error: error.message || 'Unable to add item to cart' }); } }
export async function updateCartItemController(req: AuthenticatedRequest, res: Response) { const quantity = Number(req.body.quantity); if (!Number.isInteger(quantity)) return res.status(400).json({ error: 'Quantity must be an integer' }); const item = await updateCartItem(userId(req), req.params.id, quantity); if (quantity > 0 && !item) return res.status(404).json({ error: 'Cart item not found' }); res.json({ items: await getCart(userId(req)) }); }
export async function deleteCartItemController(req: AuthenticatedRequest, res: Response) { if (!(await deleteCartItem(userId(req), req.params.id))) return res.status(404).json({ error: 'Cart item not found' }); res.json({ items: await getCart(userId(req)) }); }
export async function clearCartController(req: AuthenticatedRequest, res: Response) { await clearCart(userId(req)); res.json({ items: [] }); }
