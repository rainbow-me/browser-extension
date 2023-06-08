import EventEmitter from 'events';

export interface AlertProps {
  text: string;
  callback?: () => void;
}

const eventEmitter = new EventEmitter();

export const listenAlert = (
  callback: ({ text, callback }: AlertProps) => void,
) => {
  eventEmitter.addListener('rainbow_alert', callback);
  return () => {
    eventEmitter.removeListener('rainbow_alert', callback);
  };
};

export const triggerAlert = ({ text, callback }: AlertProps) => {
  eventEmitter.emit('rainbow_alert', { text, callback });
};
