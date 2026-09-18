import { Role } from '../../src/types.ts';
import { storeRepository } from '../repositories/store.repository.ts';
import { listOrders } from './order.service.ts';

export const getMetrics = () => storeRepository.getAdminMetrics();

export async function getUserStats() {
  const [users, orders] = await Promise.all([storeRepository.getUsers(), listOrders()]);
  return users.map((user) => ({ ...user, orderCount: orders.filter((order) => order.userId === user.id).length, totalSpent: Number(orders.filter((order) => order.userId === user.id).reduce((sum, order) => sum + order.total, 0).toFixed(2)) }));
}

export const updateUserRole = (id: string, role: Role) => storeRepository.updateUser(id, { role });
