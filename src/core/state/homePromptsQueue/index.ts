import { createBaseStore } from '@storesjs/stores';

type HomePrompt = 'app-connection' | 'wallet-backup';
export interface HomePromptsQueue {
  queue: HomePrompt[];
  popQueue: () => void;
}

export const useHomePromptsQueueStore = createBaseStore<HomePromptsQueue>(
  (set, get) => ({
    queue: ['wallet-backup', 'app-connection'],
    popQueue: () => {
      const { queue } = get();
      queue.splice(0, 1);
      set({ queue: [...queue] });
    },
  }),
);
