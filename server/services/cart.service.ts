import { storeRepository } from '../repositories/store.repository.ts';

export const getCart = (userId: string) => storeRepository.getCart(userId);
export const addCartItem = (userId: string, productId: string, size: number, color: string, quantity: number) => storeRepository.addCartItem(userId, productId, size, color, quantity);
export const updateCartItem = (userId: string, itemId: string, quantity: number) => storeRepository.updateCartItem(userId, itemId, quantity);
export const deleteCartItem = (userId: string, itemId: string) => storeRepository.deleteCartItem(userId, itemId);
export const clearCart = (userId: string) => storeRepository.clearCart(userId);
