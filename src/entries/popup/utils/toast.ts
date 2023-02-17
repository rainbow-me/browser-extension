import EventEmitter from 'events';

const eventEmitter = new EventEmitter();

export const listenToast = (
  callback: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => Promise<void>,
) => {
  eventEmitter.addListener('rainbow_toast', callback);
};

export const triggerToast = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  eventEmitter.emit('rainbow_toast', { title, description });
};

export const clearToastListener = () => {
  eventEmitter.removeAllListeners('rainbow_toast');
};
