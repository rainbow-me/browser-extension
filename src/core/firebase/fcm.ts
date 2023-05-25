/* eslint-disable prettier/prettier */
import { getApp, initializeApp } from 'firebase/app';
import { MessagePayload, getToken } from 'firebase/messaging';
import {
  getMessaging as getMessagingSw,
  isSupported as isSwSupported,
  onBackgroundMessage,
} from 'firebase/messaging/sw';

export const initFCM = async () => {

  const supported = await isSwSupported();
  console.log('supported?', supported);
  if(supported){
    console.log('INIT FCM');
    initializeApp({
      apiKey: process.env.FIREBASE_API_KEY_BX,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN_BX,
      projectId: process.env.FIREBASE_PROJECT_ID_BX,
      appId: process.env.FIREBASE_APP_ID_BX,
      messagingSenderId: process.env.FIREBASE_SENDER_ID_BX,
    });

    const app = getApp();

    const messaging = getMessagingSw(app);

    console.log('app', app);
    console.log('messaging', messaging);

        const scope = globalThis as any;
        const token = await getToken(messaging, {
          serviceWorkerRegistration: scope.registration,
          vapidKey: process.env.FIREBASE_VAPID_BX,
        });
        console.log('Token', token); 
    

    onBackgroundMessage(getMessagingSw(getApp()), (payload: MessagePayload) => {
      console.log('[SW] Incoming Message: ', payload);
      chrome.notifications.create(
        {
          type: 'basic',
          iconUrl: 'images/icon-16@32x.png',
          title: 'TEST NOTIFICATION FROM BG',
          message: JSON.stringify(payload, null, 2),
          priority: 2,
        },
        (notificationId: string) => {
          console.log('[SW] notification created with id', notificationId);
        },
      );
    });
    }
};
