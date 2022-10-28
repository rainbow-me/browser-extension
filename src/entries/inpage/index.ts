import { initializeMessenger } from '~/core/messengers';
import { RainbowProvider } from '~/core/providers';

declare global {
  interface Window {
    ethereum?: RainbowProvider;
  }
}
const messenger = initializeMessenger({ connect: 'popup' });
const provider = new RainbowProvider({ messenger });
window.ethereum = provider;

console.log('injection complete in window');
window.dispatchEvent(new Event('ethereum#initialized'));
