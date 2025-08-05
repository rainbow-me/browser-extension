import { popupOs } from '../os';

export const testSandboxHandler = popupOs.wallet.testSandbox.handler(
  async () => {
    try {
      console.log('about to leak...');
      const r = await fetch('https://api.ipify.org?format=json');
      const res = await r.json();
      console.log('response from server after leaking', res);
      return 'Background leaked!';
    } catch (e) {
      return 'Background sandboxed!';
    }
  },
);
