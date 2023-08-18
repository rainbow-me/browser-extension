import { initializeMessenger } from '~/core/messengers';

const messenger = initializeMessenger({ connect: 'popup' });

/**
 * Handles wallet related requests
 */
export const handleKeepAlive = () => {
  messenger.reply('ping', async () => {
    return { payload: 'pong' };
  });
};
