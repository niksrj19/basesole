import { StoreSettings } from '../../src/types.ts';
import { storeRepository } from '../repositories/store.repository.ts';

export const getSettings = () => storeRepository.getStoreSettings();
export const updateSettings = (updates: Partial<StoreSettings>) => storeRepository.updateStoreSettings(updates);
