import EventEmitter from 'events';

import { useCallback, useEffect } from 'react';

const eventEmitter = new EventEmitter();

export const useToast = () => {
  const listenToast = useCallback(
    (
      callback: ({
        title,
        description,
      }: {
        title: string;
        description: string;
      }) => Promise<void>,
    ) => {
      eventEmitter.addListener('rainbow_toast', callback);
    },
    [],
  );

  const triggerToast = useCallback(
    ({ title, description }: { title: string; description: string }) => {
      eventEmitter.emit('rainbow_toast', { title, description });
    },
    [],
  );

  const clearToastListener = useCallback(() => {
    eventEmitter.removeAllListeners('rainbow_toast');
  }, []);

  useEffect(() => {
    return () => clearToastListener();
  }, [clearToastListener]);

  return { listenToast, triggerToast, clearToastListener };
};
