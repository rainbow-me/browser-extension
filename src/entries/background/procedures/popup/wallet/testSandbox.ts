import { logger } from '~/logger';

import { walletOs } from '../os';

export const testSandboxHandler = walletOs.testSandbox.handler(async () => {
  try {
    logger.warn('about to leak...');
    const r = await fetch('https://api.ipify.org?format=json');
    const res = await r.json();
    logger.warn('response from server after leaking', res);
    return 'Background leaked!';
  } catch (e) {
    return 'Background sandboxed!';
  }
});
