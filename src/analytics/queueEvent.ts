// *********** IMPORTANT ************* //
// / It's REALLY important that no other code is imported here,
// as this code is used in the background script

import { SessionStorage } from '~/core/storage';

/**
 * This allows us to pass events from background script and content script
 * to the foreground app to be sent by the RudderStack client. We could
 * refactor this in the future to pass messages to the background worker
 * instead now that `@rudderstack/analytics-js-service-worker` supports
 * service worker architectures.
 * https://www.rudderstack.com/docs/sources/event-streams/sdks/rudderstack-javascript-sdk/service-worker/#usage-in-chrome-extensions
 */
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
