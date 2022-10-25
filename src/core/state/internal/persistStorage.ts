import { StateStorage } from 'zustand/middleware';
import { Storage } from '~/core/storage';

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

export const noopStorage: StateStorage = {
  getItem: async (): Promise<string | null> => null,
  setItem: async (): Promise<void> => undefined,
  removeItem: async (): Promise<void> => undefined,
};
