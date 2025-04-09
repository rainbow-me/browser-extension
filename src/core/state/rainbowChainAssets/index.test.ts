import { expect, test } from 'vitest';

import { RainbowChainAsset, useRainbowChainAssetsStore } from '.';

const TEST_CHAIN_ID_1 = 1;
const TEST_CHAIN_ID_2 = 2;

const TEST_ASSET_1: RainbowChainAsset = {
  name: 'Address1',
  address: '0xAddress1',
  decimals: 18,
  symbol: 'TOKEN1',
};

const TEST_ASSET_2: RainbowChainAsset = {
  name: 'Address2',
  address: '0xAddress2',
  decimals: 6,
  symbol: 'TOKEN2',
};

const TEST_ASSET_3: RainbowChainAsset = {
  name: 'Address3',
  address: '0xAddress3',
  decimals: 18,
  symbol: 'TOKEN3',
};

test('Add asset', async () => {
  useRainbowChainAssetsStore.getState().addRainbowChainAsset({
    chainId: TEST_CHAIN_ID_1,
    rainbowChainAsset: TEST_ASSET_1,
  });
  const assets = useRainbowChainAssetsStore.getState().rainbowChainAssets;
  expect(assets[TEST_CHAIN_ID_1]).toStrictEqual([TEST_ASSET_1]);
});

test('Add multiple assets to the same chainId', async () => {
  useRainbowChainAssetsStore.getState().addRainbowChainAsset({
    chainId: TEST_CHAIN_ID_1,
    rainbowChainAsset: TEST_ASSET_2,
  });
  useRainbowChainAssetsStore.getState().addRainbowChainAsset({
    chainId: TEST_CHAIN_ID_1,
    rainbowChainAsset: TEST_ASSET_3,
  });
  const assets = useRainbowChainAssetsStore.getState().rainbowChainAssets;
  expect(assets[TEST_CHAIN_ID_1]).toStrictEqual([
    TEST_ASSET_1,
    TEST_ASSET_2,
    TEST_ASSET_3,
  ]);
});

test('Add multiple assets to a different chainId', async () => {
  useRainbowChainAssetsStore.getState().addRainbowChainAsset({
    chainId: TEST_CHAIN_ID_2,
    rainbowChainAsset: TEST_ASSET_1,
  });
  useRainbowChainAssetsStore.getState().addRainbowChainAsset({
    chainId: TEST_CHAIN_ID_2,
    rainbowChainAsset: TEST_ASSET_2,
  });
  const assets = useRainbowChainAssetsStore.getState().rainbowChainAssets;
  expect(assets[TEST_CHAIN_ID_2]).toStrictEqual([TEST_ASSET_1, TEST_ASSET_2]);
});

test('Update an existing asset', async () => {
  const updatedAsset = { ...TEST_ASSET_1, symbol: 'TOKEN1-UPDATED' };
  useRainbowChainAssetsStore.getState().updateRainbowChainAsset({
    chainId: TEST_CHAIN_ID_1,
    rainbowChainAsset: updatedAsset,
  });
  const assets =
    useRainbowChainAssetsStore.getState().rainbowChainAssets[TEST_CHAIN_ID_1];
  const asset = assets.find((a) => a.address === TEST_ASSET_1.address);
  expect(asset).toStrictEqual(updatedAsset);
});

test('Remove an asset from a chain with multiple assets', async () => {
  useRainbowChainAssetsStore.getState().removeRainbowChainAsset({
    chainId: TEST_CHAIN_ID_1,
    address: TEST_ASSET_1.address,
  });
  const assets =
    useRainbowChainAssetsStore.getState().rainbowChainAssets[TEST_CHAIN_ID_1];
  expect(assets).not.toContain(TEST_ASSET_1);
  expect(assets).toStrictEqual([TEST_ASSET_2, TEST_ASSET_3]);
});

test('Remove the last asset from a chain', async () => {
  useRainbowChainAssetsStore.getState().removeRainbowChainAsset({
    chainId: TEST_CHAIN_ID_2,
    address: TEST_ASSET_1.address,
  });
  useRainbowChainAssetsStore.getState().removeRainbowChainAsset({
    chainId: TEST_CHAIN_ID_2,
    address: TEST_ASSET_2.address,
  });
  const assets = useRainbowChainAssetsStore.getState().rainbowChainAssets;
  expect(assets[TEST_CHAIN_ID_2]).toBeUndefined();
});
