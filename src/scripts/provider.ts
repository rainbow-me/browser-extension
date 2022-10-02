import { RainbowProvider } from '../core/RainbowProvider';

declare global {
  interface Window {
    ethereum?: RainbowProvider;
    rainbow?: boolean;
  }
}

const provider = new RainbowProvider();
window.addEventListener('message', (event) => {
  if (event.source != window) {
    return;
  }
  if (event.data.type === 'FROM_RAINBOW_PROVIDER') {
    if (event.data.id && provider._callbacks[event.data.id]) {
      provider._callbacks[event.data.id](event.data.payload);
      delete provider._callbacks[event.data.id];
    }
  }
});

window.rainbow = true;
window.ethereum = provider;

console.log('injection complete in window');
window.dispatchEvent(new Event('ethereum#initialized'));
