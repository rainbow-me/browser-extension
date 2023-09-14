import { useHomeQueueStackStore } from '~/core/state/homePromptsQueue';

export const useHomePromptQueue = () => {
  const { queue, popQueue } = useHomeQueueStackStore();

  const nextInQueue = queue[0];

  return {
    nextInQueue,
    popQueue,
  };
};
