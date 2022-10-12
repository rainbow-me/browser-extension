import { RainbowProvider } from '~/core/providers';

declare global {
  interface Window {
    ethereum?: RainbowProvider;
  }
}

const provider = new RainbowProvider();
window.ethereum = provider;

console.log('injection complete in window');
window.dispatchEvent(new Event('ethereum#initialized'));
