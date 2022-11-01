import { expect, test } from 'vitest';
import { chain } from 'wagmi';

import { appSessionsStore } from '.';

const UNISWAP_HOST = 'uniswap.org';
const OPENSEA_HOST = 'opensea.io';
const ADDRESS_1 = '0x123';
const ADDRESS_2 = '0x321';

test('should be able to add session but not duplicate it', async () => {
  const { appSessions, addSession } = appSessionsStore.getState();
  expect(appSessions).toStrictEqual({});
  addSession({
    host: UNISWAP_HOST,
    address: ADDRESS_1,
    chainId: chain.mainnet.id,
  });
  expect(appSessionsStore.getState().appSessions).toStrictEqual({
    [UNISWAP_HOST]: {
      host: UNISWAP_HOST,
      address: ADDRESS_1,
      chainId: chain.mainnet.id,
    },
  });
  addSession({
    host: UNISWAP_HOST,
    address: ADDRESS_2,
    chainId: chain.arbitrum.id,
  });
  expect(appSessionsStore.getState().appSessions).toStrictEqual({
    [UNISWAP_HOST]: {
      host: UNISWAP_HOST,
      address: ADDRESS_1,
      chainId: chain.mainnet.id,
    },
  });
  addSession({
    host: OPENSEA_HOST,
    address: ADDRESS_2,
    chainId: chain.arbitrum.id,
  });
  expect(appSessionsStore.getState().appSessions).toStrictEqual({
    [UNISWAP_HOST]: {
      host: UNISWAP_HOST,
      address: ADDRESS_1,
      chainId: chain.mainnet.id,
    },
    [OPENSEA_HOST]: {
      host: OPENSEA_HOST,
      address: ADDRESS_2,
      chainId: chain.arbitrum.id,
    },
  });
});

test('should be able to remove session', async () => {
  const { removeSession } = appSessionsStore.getState();
  removeSession({ host: OPENSEA_HOST });
  expect(appSessionsStore.getState().appSessions).toStrictEqual({
    [UNISWAP_HOST]: {
      host: UNISWAP_HOST,
      address: ADDRESS_1,
      chainId: chain.mainnet.id,
    },
  });
});

test('should be able to clear all sessions', async () => {
  const { clearSessions } = appSessionsStore.getState();
  clearSessions();
  expect(appSessionsStore.getState().appSessions).toStrictEqual({});
});

test('should be able to check if host has an active session', async () => {
  const { addSession, isActiveSession } = appSessionsStore.getState();
  expect(appSessionsStore.getState().appSessions).toStrictEqual({});
  addSession({
    host: UNISWAP_HOST,
    address: ADDRESS_1,
    chainId: chain.mainnet.id,
  });
  const activeSession = isActiveSession({ host: UNISWAP_HOST });
  expect(activeSession).toBe(true);
});

test('should be able to update session chain id', async () => {
  const { updateSessionChainId } = appSessionsStore.getState();
  updateSessionChainId({ host: UNISWAP_HOST, chainId: chain.arbitrum.id });
  expect(appSessionsStore.getState().appSessions).toStrictEqual({
    [UNISWAP_HOST]: {
      host: UNISWAP_HOST,
      address: ADDRESS_1,
      chainId: chain.arbitrum.id,
    },
  });
});

test('should be able to update session address', async () => {
  const { updateSessionAddress } = appSessionsStore.getState();
  updateSessionAddress({ host: UNISWAP_HOST, address: ADDRESS_2 });
  expect(appSessionsStore.getState().appSessions).toStrictEqual({
    [UNISWAP_HOST]: {
      host: UNISWAP_HOST,
      address: ADDRESS_2,
      chainId: chain.arbitrum.id,
    },
  });
});
