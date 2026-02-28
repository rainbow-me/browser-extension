/**
 * Provider module - viem-inpage based provider
 */

export { createEip1193Provider, Eip1193Provider } from 'viem-inpage';

export * from './types';

export { createPortalHost } from './handleProviderPortal';
export type { PortalHostConfig } from './handleProviderPortal';
