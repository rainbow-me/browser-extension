import { StateStorage } from 'zustand/middleware';
import { Storage } from '../storage';

export const persistStorage: StateStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return (await Storage.get(key)) || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await Storage.set(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await Storage.remove(key);
  },
};
