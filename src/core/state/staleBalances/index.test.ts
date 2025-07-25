import { Address } from 'viem';
import { expect, test } from 'vitest';

import { DAI_ADDRESS, ETH_ADDRESS, OP_ADDRESS } from '~/core/references';
import { ChainId } from '~/core/types/chains';
import { TEST_ADDRESS_1, TEST_ADDRESS_2 } from '~/test/utils';

import { useStaleBalancesStore } from '.';

const THEN = Date.now() - 700000;
const WHEN = Date.now() + 60000;

test('should be able to add asset information to the staleBalances object', async () => {
  const { addStaleBalance, staleBalances } = useStaleBalancesStore.getState();
  expect(staleBalances).toStrictEqual({});
  addStaleBalance({
    address: TEST_ADDRESS_1,
    chainId: ChainId.mainnet,
    info: {
      address: DAI_ADDRESS,
      transactionHash: '0xFOOBAR',
      expirationTime: THEN,
    },
  });
  addStaleBalance({
    address: TEST_ADDRESS_1,
    chainId: ChainId.mainnet,
    info: {
      address: ETH_ADDRESS as Address,
      transactionHash: '0xFOOBAR',
      expirationTime: WHEN,
    },
  });
  const newStaleBalances = useStaleBalancesStore.getState().staleBalances;
  expect(newStaleBalances).toStrictEqual({
    [TEST_ADDRESS_1]: {
      [ChainId.mainnet]: {
        [DAI_ADDRESS]: {
          address: DAI_ADDRESS,
          transactionHash: '0xFOOBAR',
          expirationTime: THEN,
        },
        [ETH_ADDRESS]: {
          address: ETH_ADDRESS,
          transactionHash: '0xFOOBAR',
          expirationTime: WHEN,
        },
      },
    },
  });
});

test('should generate accurate stale balance query params and clear expired data - case #1', async () => {
  const { getStaleBalancesQueryParam, clearExpiredData } =
    useStaleBalancesStore.getState();
  clearExpiredData(TEST_ADDRESS_1);
  const queryParam = getStaleBalancesQueryParam(TEST_ADDRESS_1);
  expect(queryParam).toStrictEqual(`&tokens=${ChainId.mainnet}.${ETH_ADDRESS}`);
});

test('should be able to remove expired stale balance and preserve unexpired data', async () => {
  const { addStaleBalance, clearExpiredData } =
    useStaleBalancesStore.getState();
  addStaleBalance({
    address: TEST_ADDRESS_1,
    chainId: ChainId.mainnet,
    info: {
      address: DAI_ADDRESS,
      transactionHash: '0xFOOBAR',
      expirationTime: THEN,
    },
  });
  addStaleBalance({
    address: TEST_ADDRESS_1,
    chainId: ChainId.mainnet,
    info: {
      address: ETH_ADDRESS as Address,
      transactionHash: '0xFOOBAR',
      expirationTime: WHEN,
    },
  });
  clearExpiredData(TEST_ADDRESS_1);
  const newStaleBalances = useStaleBalancesStore.getState().staleBalances;
  expect(newStaleBalances).toStrictEqual({
    [TEST_ADDRESS_1]: {
      [ChainId.mainnet]: {
        [ETH_ADDRESS]: {
          address: ETH_ADDRESS,
          transactionHash: '0xFOOBAR',
          expirationTime: WHEN,
        },
      },
    },
  });
});

test('should preserve data from other addresses when clearing expired data', async () => {
  const { addStaleBalance, clearExpiredData } =
    useStaleBalancesStore.getState();
  addStaleBalance({
    address: TEST_ADDRESS_1,
    chainId: ChainId.mainnet,
    info: {
      address: DAI_ADDRESS,
      transactionHash: '0xFOOBAR',
      expirationTime: THEN,
    },
  });
  addStaleBalance({
    address: TEST_ADDRESS_2,
    chainId: ChainId.mainnet,
    info: {
      address: ETH_ADDRESS as Address,
      transactionHash: '0xFOOBAR',
      expirationTime: WHEN,
    },
  });
  clearExpiredData(TEST_ADDRESS_1);
  const newStaleBalances = useStaleBalancesStore.getState().staleBalances;
  expect(newStaleBalances).toStrictEqual({
    [TEST_ADDRESS_1]: {
      [ChainId.mainnet]: {
        [ETH_ADDRESS]: {
          address: ETH_ADDRESS,
          transactionHash: '0xFOOBAR',
          expirationTime: WHEN,
        },
      },
    },
    [TEST_ADDRESS_2]: {
      [ChainId.mainnet]: {
        [ETH_ADDRESS]: {
          address: ETH_ADDRESS,
          transactionHash: '0xFOOBAR',
          expirationTime: WHEN,
        },
      },
    },
  });
});

test('should generate accurate stale balance query params and clear expired data - case #2', async () => {
  const { getStaleBalancesQueryParam, clearExpiredData } =
    useStaleBalancesStore.getState();
  clearExpiredData(TEST_ADDRESS_2);
  const queryParam = getStaleBalancesQueryParam(TEST_ADDRESS_2);
  expect(queryParam).toStrictEqual(`&tokens=${ChainId.mainnet}.${ETH_ADDRESS}`);
});

test('should generate accurate stale balance query params and clear expired data - case #3', async () => {
  const { addStaleBalance, getStaleBalancesQueryParam, clearExpiredData } =
    useStaleBalancesStore.getState();
  addStaleBalance({
    address: TEST_ADDRESS_1,
    chainId: ChainId.optimism,
    info: {
      address: OP_ADDRESS,
      transactionHash: '0xFOOBAR',
      expirationTime: WHEN,
    },
  });

  clearExpiredData(TEST_ADDRESS_1);
  const queryParam = getStaleBalancesQueryParam(TEST_ADDRESS_1);
  expect(queryParam).toStrictEqual(
    `&tokens=${ChainId.mainnet}.${ETH_ADDRESS},${ChainId.optimism}.${OP_ADDRESS}`,
  );

  clearExpiredData(TEST_ADDRESS_2);
  const queryParam2 = getStaleBalancesQueryParam(TEST_ADDRESS_2);
  expect(queryParam2).toStrictEqual(
    `&tokens=${ChainId.mainnet}.${ETH_ADDRESS}`,
  );
});
