import { FCM_SENDER_ID } from '../references/FCM';

export const initFCM = () => {
  try {
    chrome.gcm.register([FCM_SENDER_ID], (registrationId: string) => {
      console.log('[SW] Token: ', registrationId);
      console.log('[SW] Now listening on the bg...');

      chrome.gcm.onMessage.addListener(
        (message: chrome.gcm.IncomingMessage) => {
          console.log('[SW] Incoming Message: ', message);
          chrome.notifications.create(
            {
              type: 'basic',
              iconUrl: 'images/icon-16@32x.png',
              title: 'TEST NOTIFICATION FROM BG',
              message: JSON.stringify(message, null, 2),
              priority: 2,
            },
            (notificationId: string) => {
              console.log('[SW] notification created with id', notificationId);
            },
          );
        },
      );
    });
  } catch (err) {
    // This only works on Google chrome
    console.log('FCM Init failed: ', err);
  }
};
