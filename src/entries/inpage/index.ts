import { RainbowProvider } from '~/core/providers';

declare global {
  interface Window {
    ethereum?: RainbowProvider;
    rainbow?: boolean;
  }
}

const provider = new RainbowProvider();

window.rainbow = true;
window.ethereum = provider;

console.log('injection complete in window');
window.dispatchEvent(new Event('ethereum#initialized'));
