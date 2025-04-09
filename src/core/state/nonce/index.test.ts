import { expect, test } from 'vitest';

import { ChainId } from '~/core/types/chains';
import { TEST_ADDRESS_1, TEST_ADDRESS_2, TEST_ADDRESS_3 } from '~/test/utils';

import { useNonceStore } from '.';

test('should be able to set nonce for one wallet in one network', async () => {
  const { nonces, setNonce } = useNonceStore.getState();
  expect(nonces).toStrictEqual({});
  setNonce({
    address: TEST_ADDRESS_1,
    currentNonce: 1,
    latestConfirmedNonce: 1,
    chainId: ChainId.mainnet,
  });
  const newNonces = useNonceStore.getState().nonces;
  expect(newNonces).toStrictEqual({
    [TEST_ADDRESS_1]: {
      [ChainId.mainnet]: {
        currentNonce: 1,
        latestConfirmedNonce: 1,
      },
    },
  });
});

test('should be able to set nonce for same wallet in a different network', async () => {
  const { setNonce } = useNonceStore.getState();
  setNonce({
    address: TEST_ADDRESS_1,
    currentNonce: 4,
    latestConfirmedNonce: 4,
    chainId: ChainId.optimism,
  });
  const newNonces = useNonceStore.getState().nonces;
  expect(newNonces).toStrictEqual({
    [TEST_ADDRESS_1]: {
      [ChainId.mainnet]: {
        currentNonce: 1,
        latestConfirmedNonce: 1,
      },
      [ChainId.optimism]: {
        currentNonce: 4,
        latestConfirmedNonce: 4,
      },
    },
  });
});

test('should be able to set nonce for other wallet in one network', async () => {
  const { setNonce } = useNonceStore.getState();
  setNonce({
    address: TEST_ADDRESS_2,
    currentNonce: 2,
    latestConfirmedNonce: 2,
    chainId: ChainId.mainnet,
  });
  const newNonces = useNonceStore.getState().nonces;
  expect(newNonces).toStrictEqual({
    [TEST_ADDRESS_1]: {
      [ChainId.mainnet]: {
        currentNonce: 1,
        latestConfirmedNonce: 1,
      },
      [ChainId.optimism]: {
        currentNonce: 4,
        latestConfirmedNonce: 4,
      },
    },
    [TEST_ADDRESS_2]: {
      [ChainId.mainnet]: {
        currentNonce: 2,
        latestConfirmedNonce: 2,
      },
    },
  });
});

test('should be able to set nonce for other wallet in other network', async () => {
  const { setNonce } = useNonceStore.getState();
  setNonce({
    address: TEST_ADDRESS_3,
    currentNonce: 3,
    latestConfirmedNonce: 3,
    chainId: ChainId.arbitrum,
  });
  const newNonces = useNonceStore.getState().nonces;
  expect(newNonces).toStrictEqual({
    [TEST_ADDRESS_1]: {
      [ChainId.mainnet]: {
        currentNonce: 1,
        latestConfirmedNonce: 1,
      },
      [ChainId.optimism]: {
        currentNonce: 4,
        latestConfirmedNonce: 4,
      },
    },
    [TEST_ADDRESS_2]: {
      [ChainId.mainnet]: {
        currentNonce: 2,
        latestConfirmedNonce: 2,
      },
    },
    [TEST_ADDRESS_3]: {
      [ChainId.arbitrum]: {
        currentNonce: 3,
        latestConfirmedNonce: 3,
      },
    },
  });
});

test('should be able to set nonce nonce information correctly', async () => {
  const { setNonce, getNonce } = useNonceStore.getState();
  setNonce({
    address: TEST_ADDRESS_3,
    currentNonce: 3,
    latestConfirmedNonce: 3,
    chainId: ChainId.arbitrum,
  });
  const nonces11 = getNonce({
    address: TEST_ADDRESS_1,
    chainId: ChainId.mainnet,
  });
  const nonces12 = getNonce({
    address: TEST_ADDRESS_1,
    chainId: ChainId.optimism,
  });
  const nonces2 = getNonce({
    address: TEST_ADDRESS_2,
    chainId: ChainId.mainnet,
  });
  const nonces3 = getNonce({
    address: TEST_ADDRESS_3,
    chainId: ChainId.arbitrum,
  });
  expect(nonces11?.currentNonce).toEqual(1);
  expect(nonces11?.latestConfirmedNonce).toEqual(1);
  expect(nonces12?.currentNonce).toEqual(4);
  expect(nonces12?.latestConfirmedNonce).toEqual(4);
  expect(nonces2?.currentNonce).toEqual(2);
  expect(nonces2?.latestConfirmedNonce).toEqual(2);
  expect(nonces3?.currentNonce).toEqual(3);
  expect(nonces3?.latestConfirmedNonce).toEqual(3);
});

test('should be able to update nonce', async () => {
  const { setNonce, getNonce } = useNonceStore.getState();
  setNonce({
    address: TEST_ADDRESS_1,
    currentNonce: 30,
    latestConfirmedNonce: 30,
    chainId: ChainId.mainnet,
  });
  const updatedNonce = getNonce({
    address: TEST_ADDRESS_1,
    chainId: ChainId.mainnet,
  });
  const oldNonce = getNonce({
    address: TEST_ADDRESS_1,
    chainId: ChainId.optimism,
  });
  expect(updatedNonce?.currentNonce).toStrictEqual(30);
  expect(updatedNonce?.latestConfirmedNonce).toStrictEqual(30);
  expect(oldNonce?.currentNonce).toStrictEqual(4);
  expect(oldNonce?.latestConfirmedNonce).toStrictEqual(4);
  setNonce({
    address: TEST_ADDRESS_1,
    currentNonce: 31,
    latestConfirmedNonce: 30,
    chainId: ChainId.mainnet,
  });
  const updatedNonceSecondTime = getNonce({
    address: TEST_ADDRESS_1,
    chainId: ChainId.mainnet,
  });
  expect(updatedNonceSecondTime?.currentNonce).toStrictEqual(31);
  expect(updatedNonceSecondTime?.latestConfirmedNonce).toStrictEqual(30);
});
