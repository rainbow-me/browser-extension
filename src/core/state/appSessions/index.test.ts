import { expect, test } from 'vitest';

import { ChainId } from '~/core/types/chains';

import { appSessionsStore } from '.';

const UNISWAP_HOST = 'uniswap.org';
const UNISWAP_URL = 'www.uniswap.org';
const OPENSEA_HOST = 'opensea.io';
const OPENSEA_URL = 'www.opensea.io';
const ADDRESS_1 = '0x123';
const ADDRESS_2 = '0x321';

test('should be able to add session but not duplicate it', async () => {
  const { appSessions, addSession } = appSessionsStore.getState();
  expect(appSessions).toStrictEqual({});
  addSession({
    url: UNISWAP_URL,
    host: UNISWAP_HOST,
    address: ADDRESS_1,
    chainId: ChainId.mainnet,
  });
  expect(appSessionsStore.getState().appSessions).toStrictEqual({
    [UNISWAP_HOST]: {
      url: UNISWAP_URL,
      host: UNISWAP_HOST,
      sessions: { [ADDRESS_1]: ChainId.mainnet },
      activeSession: ADDRESS_1,
    },
  });
  addSession({
    url: UNISWAP_URL,
    host: UNISWAP_HOST,
    address: ADDRESS_2,
    chainId: ChainId.arbitrum,
  });
  expect(appSessionsStore.getState().appSessions).toStrictEqual({
    [UNISWAP_HOST]: {
      url: UNISWAP_URL,
      host: UNISWAP_HOST,
      sessions: { [ADDRESS_1]: ChainId.mainnet, [ADDRESS_2]: ChainId.arbitrum },
      activeSession: ADDRESS_2,
    },
  });
  addSession({
    url: OPENSEA_URL,
    host: OPENSEA_HOST,
    address: ADDRESS_2,
    chainId: ChainId.arbitrum,
  });
  expect(appSessionsStore.getState().appSessions).toStrictEqual({
    [UNISWAP_HOST]: {
      url: UNISWAP_URL,
      host: UNISWAP_HOST,
      sessions: { [ADDRESS_1]: ChainId.mainnet, [ADDRESS_2]: ChainId.arbitrum },
      activeSession: ADDRESS_2,
    },
    [OPENSEA_HOST]: {
      url: OPENSEA_URL,
      host: OPENSEA_HOST,
      sessions: { [ADDRESS_2]: ChainId.arbitrum },
      activeSession: ADDRESS_2,
    },
  });
});

test('should be able to remove session', async () => {
  const { removeAppSession } = appSessionsStore.getState();
  removeAppSession({ host: OPENSEA_HOST });
  expect(appSessionsStore.getState().appSessions).toStrictEqual({
    [UNISWAP_HOST]: {
      url: UNISWAP_URL,
      host: UNISWAP_HOST,
      sessions: { [ADDRESS_1]: ChainId.mainnet, [ADDRESS_2]: ChainId.arbitrum },
      activeSession: ADDRESS_2,
    },
  });
});

test('should be able to clear all sessions', async () => {
  const { clearSessions } = appSessionsStore.getState();
  clearSessions();
  expect(appSessionsStore.getState().appSessions).toStrictEqual({});
});

test('should be able to check if host has an active session', async () => {
  const { addSession, getActiveSession } = appSessionsStore.getState();
  expect(appSessionsStore.getState().appSessions).toStrictEqual({});
  addSession({
    url: UNISWAP_URL,
    host: UNISWAP_HOST,
    address: ADDRESS_1,
    chainId: ChainId.mainnet,
  });
  const activeSession = getActiveSession({ host: UNISWAP_HOST });
  expect(activeSession).toStrictEqual({
    address: ADDRESS_1,
    chainId: ChainId.mainnet,
  });
});

test('should be able to update session chain id', async () => {
  const { updateSessionChainId } = appSessionsStore.getState();
  updateSessionChainId({
    host: UNISWAP_HOST,
    address: ADDRESS_1,
    chainId: ChainId.arbitrum,
  });
  expect(appSessionsStore.getState().appSessions).toStrictEqual({
    [UNISWAP_HOST]: {
      url: UNISWAP_URL,
      host: UNISWAP_HOST,
      sessions: { [ADDRESS_1]: ChainId.arbitrum },
      activeSession: ADDRESS_1,
    },
  });
});

test.skip('should be able to update session address', async () => {
  const { updateActiveSession } = appSessionsStore.getState();
  updateActiveSession({ host: UNISWAP_HOST, address: ADDRESS_2 });
  expect(appSessionsStore.getState().appSessions).toStrictEqual({
    [UNISWAP_HOST]: {
      url: UNISWAP_URL,
      host: UNISWAP_HOST,
      sessions: {
        [ADDRESS_1]: ChainId.arbitrum,
      },
      activeSession: ADDRESS_2,
    },
  });
});
