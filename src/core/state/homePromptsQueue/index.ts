import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

type HomePrompt = 'app-connection' | 'wallet-backup';
export interface HomePromptsQueue {
  queue: HomePrompt[];
  popQueue: () => void;
}

export const homePromptsQueueStore = createRainbowStore<HomePromptsQueue>(
  (set, get) => ({
    queue: ['wallet-backup', 'app-connection'],
    popQueue: () => {
      const { queue } = get();
      queue.splice(0, 1);
      set({ queue: [...queue] });
    },
  }),
);

export const useHomeQueueStackStore = homePromptsQueueStore;
