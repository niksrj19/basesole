import { Address, User } from '../../src/types.ts';
import { storeRepository } from '../repositories/store.repository.ts';

export const listAddresses = (userId: string) => storeRepository.getUserAddresses(userId);
export const addAddress = (address: Omit<Address, 'id' | 'createdAt'>) => storeRepository.addAddress(address);
export const updateAddress = (id: string, updates: Partial<Address>) => storeRepository.updateAddress(id, updates);
export const deleteAddress = (id: string) => storeRepository.deleteAddress(id);
export const updateProfile = (id: string, updates: Partial<User>) => storeRepository.updateUser(id, updates);
export const listUsers = () => storeRepository.getUsers();
