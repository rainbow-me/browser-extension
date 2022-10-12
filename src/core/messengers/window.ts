import { createMessenger } from './internal/createMessenger';

/**
 * Creates a "window messenger" that can be used to communicate between
 * scripts where `window` is defined.
 *
 * Compatibile entries:
 * - ❌ Background
 * - ⚠️ Popup
 * - ✅ Content Script
 * - ✅ Inpage
 *
 * ⚠️ = The Popup & Content Script/Inpage entries have differing `window` instances!
 *
 * @see https://www.notion.so/rainbowdotme/Cross-script-Messaging-141de5115294435f95e31b87abcf4314#2af765a8378c4f08a1663d9bfcb60ad9
 */
export const windowMessenger = createMessenger({
  available: typeof window !== 'undefined',
  name: 'windowMessenger',
  async send(topic, payload) {
    // Since the window messenger cannot reply asynchronously, we must include the direction in our message ('> {topic}')...
    window.postMessage({ topic: `> ${topic}`, payload }, '*');
    // ... and also set up an event listener to listen for the response ('< {topic}').
    return new Promise((resolve, reject) => {
      const listener = (event: MessageEvent) => {
        if (event.source != window) return;
        if (event.data.topic !== `< ${topic}`) return;
        if (!event.data.payload) return;

        window.removeEventListener('message', listener);

        const { response, error } = event.data.payload;
        if (error) reject(new Error(error.message));
        resolve(response);
      };
      window.addEventListener('message', listener);
    });
  },
  reply(topic, callback) {
    const listener = async (event: MessageEvent) => {
      const sender = event.source;
      if (sender != window) return;
      if (!event.data.topic) return;
      if (topic !== '*' && event.data.topic !== `> ${topic}`) return;

      let error;
      let response;
      try {
        response = await callback(event.data.payload, {
          topic: event.data.topic,
          sender,
        });
      } catch (error_) {
        error = error_;
      }

      const repliedTopic = event.data.topic.replace('>', '<');
      window.postMessage({
        topic: repliedTopic,
        payload: { error, response },
      });
    };
    window.addEventListener('message', listener, false);
    return () => window.removeEventListener('message', listener);
  },
});
