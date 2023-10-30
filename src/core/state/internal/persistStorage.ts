import { StateStorage } from 'zustand/middleware';

import { LocalStorage } from '~/core/storage';

export const persistStorage: StateStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return (await LocalStorage.get(key)) || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await LocalStorage.set(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await LocalStorage.remove(key);
  },
};

export const noopStorage: StateStorage = {
  getItem: async (): Promise<string | null> => null,
  setItem: async (): Promise<void> => undefined,
  removeItem: async (): Promise<void> => undefined,
};
