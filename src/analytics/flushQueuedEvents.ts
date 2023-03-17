import { analytics } from '.';

export const flushQueuedEvents = async () => {
  const queuedEvents = await chrome.storage.session.get('queuedEvents');
  const events = queuedEvents?.queuedEvents || [];
  for (const event of events) {
    analytics.track(event.eventName, event.meta);
  }
};
