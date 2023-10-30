import { SessionStorage } from '~/core/storage';

import { analytics } from '.';

export const flushQueuedEvents = async () => {
  const queuedEvents = await SessionStorage.get('queuedEvents');
  const events = queuedEvents?.queuedEvents || [];
  for (const event of events) {
    analytics.track(event.eventName, event.meta);
  }
  SessionStorage.set('queuedEvents', []);
};
