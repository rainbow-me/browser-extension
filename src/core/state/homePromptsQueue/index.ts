import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

type HomePrompt = 'app-connection' | 'wallet-backup';
export interface HomePromptsQueue {
  queue: HomePrompt[];
  getNextInQueue: () => HomePrompt | undefined;
  popQueue: () => void;
}

export const homePromptsQueueStore = createStore<HomePromptsQueue>(
  (set, get) => ({
    queue: ['wallet-backup', 'app-connection'],
    getNextInQueue: () => {
      const { queue } = get();
      return queue[0];
    },
    popQueue: () => {
      const { queue } = get();
      queue.splice(0, 1);
      set({ queue: [...queue] });
    },
  }),
);

export const useHomeQueueStackStore = create(homePromptsQueueStore);
