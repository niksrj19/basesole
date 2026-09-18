import { Address, Order } from '../../src/types.ts';
import { storeRepository } from '../repositories/store.repository.ts';

export const createOrder = (params: { userId: string; shippingAddress: Address; items: Array<{ productId: string; quantity: number; size: number; color: string }>; deliveryNotes?: string }) => storeRepository.createOrder(params);
export const listOrders = (userId?: string) => storeRepository.getOrders(userId);
export const getOrder = (id: string) => storeRepository.getOrderById(id);
export const confirmPayment = (id: string, transactionRef?: string) => storeRepository.confirmPayment(id, transactionRef);
export const updateOrderStatus = (id: string, status: Order['status']) => storeRepository.updateOrderStatus(id, status);
export const listNotifications = (userId?: string) => storeRepository.getNotifications(userId);
