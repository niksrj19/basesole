import { store } from '../db.ts';

/**
 * Application repository boundary. The legacy Prisma-backed implementation
 * remains behind this adapter while domains are moved into services.
 */
export const storeRepository = store;
export type StoreRepository = typeof storeRepository;
