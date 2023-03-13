import EventEmitter from 'events';

import { useCallback } from 'react';

const eventEmitter = new EventEmitter();

export interface AlertProps {
  text: string;
  callback?: () => void;
}

export const useAlert = () => {
  const listenAlert = useCallback(
    (cb: ({ text, callback }: AlertProps) => Promise<void>) => {
      eventEmitter.addListener('rainbow_alert', cb);
    },
    [],
  );

  const triggerAlert = useCallback(({ text, callback }: AlertProps) => {
    eventEmitter.emit('rainbow_alert', { text, callback });
  }, []);

  const clearAlertListener = useCallback(() => {
    eventEmitter.removeAllListeners('rainbow_alert');
  }, []);

  return { listenAlert, triggerAlert, clearAlertListener };
};
