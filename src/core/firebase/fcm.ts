/* eslint-disable prettier/prettier */
import { getApp, initializeApp } from 'firebase/app';
import { MessagePayload, getToken } from 'firebase/messaging';
import {
  getMessaging as getMessagingSw,
  isSupported as isSwSupported,
  onBackgroundMessage,
} from 'firebase/messaging/sw';

import { RainbowError, logger } from '~/logger';

export const initFCM = async () => {
  try {
    const supported = await isSwSupported();
    if(supported){
      initializeApp({
        apiKey: process.env.FIREBASE_API_KEY_BX,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN_BX,
        projectId: process.env.FIREBASE_PROJECT_ID_BX,
        appId: process.env.FIREBASE_APP_ID_BX,
        messagingSenderId: process.env.FIREBASE_SENDER_ID_BX,
      });

      const app = getApp();

      const messaging = getMessagingSw(app);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scope = globalThis as any;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const token = await getToken(messaging, {
        serviceWorkerRegistration: scope.registration,
        vapidKey: process.env.FIREBASE_VAPID_BX,
      });

      // Whenever we want to start watching an address we need
      // to subscribe to the topic through our backend
      // Which requires us to send this token. 
      // See BX-732 for more info
      

      // This is the listener for when the app is in the bg
      onBackgroundMessage(getMessagingSw(getApp()), (payload: MessagePayload) => {
        logger.info('[SW] Incoming Message: ', {payload});
        chrome.notifications.create(
          {
            type: 'basic',
            iconUrl: 'images/icon-16@32x.png',
            title: 'TEST NOTIFICATION FROM BG',
            message: JSON.stringify(payload, null, 2),
            priority: 2,
          },
          (notificationId: string) => {
            logger.info('[SW] notification created with id', {notificationId});
          },
        );
      });
      }
    } catch (e) {
      logger.error(new RainbowError('SW: Error initiating FCM'), {
        message: (e as Error)?.message,
      });
    }
};
