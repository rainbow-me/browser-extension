import { configureSDK } from '@rainbow-me/swaps';

export function setupSwapsClient(): void {
  configureSDK({ apiBaseUrl: 'https://swap.s.rainbow.me' });
}
