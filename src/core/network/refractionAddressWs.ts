import { createWebSocketClient } from '~/core/network/internal/createWebSocketClient';

export const refractionAddressMessages = {
  ADDRESS_ASSETS: {
    APPENDED: 'appended address assets',
    CHANGED: 'changed address assets',
    RECEIVED: 'received address assets',
    RECEIVED_ARBITRUM: 'received address arbitrum-assets',
    RECEIVED_OPTIMISM: 'received address optimism-assets',
    RECEIVED_BASE: 'received address base-assets',
    RECEIVED_ZORA: 'received address zora-assets',
    RECEIVED_POLYGON: 'received address polygon-assets',
    REMOVED: 'removed address assets',
  },
  ADDRESS_TRANSACTIONS: {
    APPENDED: 'appended address transactions',
    CHANGED: 'changed address transactions',
    RECEIVED: 'received address transactions',
    RECEIVED_ARBITRUM: 'received address arbitrum-transactions',
    RECEIVED_OPTIMISM: 'received address optimism-transactions',
    RECEIVED_BASE: 'received address base-transactions',
    RECEIVED_ZORA: 'received address zora-transactions',
    RECEIVED_POLYGON: 'received address polygon-transactions',
    REMOVED: 'removed address transactions',
  },
};

export const refractionAddressWs = createWebSocketClient({
  baseUrl: `${process.env.DATA_ENDPOINT}/address`,
  query: {
    api_token: process.env.DATA_API_KEY,
  },
});
