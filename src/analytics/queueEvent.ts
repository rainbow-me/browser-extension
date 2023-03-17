// *********** IMPORTANT ************* //
// / It's REALLY important that no other code is imported here,
// as this code is used in the background script

export const queueEventTracking = async (eventName: string, meta = {}) => {
  const queuedEvents = await chrome.storage.session.get('queuedEvents');
  const events = queuedEvents?.queuedEvents || [];
  const newEvent = {
    eventName,
    meta: {
      ...meta,
      timestamp: Date.now(),
    },
  };
  events.push(newEvent);
  console.log('event queued', newEvent);
};
