// *********** IMPORTANT ************* //
// / It's REALLY important that no other code is imported here,
// as this code is used in the background script

import { SessionStorage } from '~/core/storage';

export const queueEventTracking = async (eventName: string, meta = {}) => {
  const queuedEvents = await SessionStorage.get('queuedEvents');
  const events = queuedEvents || [];
  const newEvent = {
    eventName,
    meta: {
      ...meta,
      timestamp: Date.now(),
    },
  };
  events.push(newEvent);
  await SessionStorage.set('queuedEvents', events);
};
