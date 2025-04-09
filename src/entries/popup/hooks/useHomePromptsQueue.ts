import { useHomePromptsQueueStore } from '~/core/state';

export const useHomePromptQueue = () => {
  const { queue, popQueue } = useHomePromptsQueueStore();

  const nextInQueue = queue[0];

  return {
    nextInQueue,
    popQueue,
  };
};
