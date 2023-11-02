import { expect, test } from 'vitest';

import { CustomRPCAsset, customRPCAssetsStore } from '.';

const TEST_CHAIN_ID_1 = 1;
const TEST_CHAIN_ID_2 = 2;

const TEST_ASSET_1: CustomRPCAsset = {
  name: 'Address1',
  address: '0xAddress1',
  decimals: 18,
  symbol: 'TOKEN1',
};

const TEST_ASSET_2: CustomRPCAsset = {
  name: 'Address2',
  address: '0xAddress2',
  decimals: 6,
  symbol: 'TOKEN2',
};

const TEST_ASSET_3: CustomRPCAsset = {
  name: 'Address3',
  address: '0xAddress3',
  decimals: 18,
  symbol: 'TOKEN3',
};

test('Add asset', async () => {
  customRPCAssetsStore.getState().addCustomRPCAsset({
    chainId: TEST_CHAIN_ID_1,
    customRPCAsset: TEST_ASSET_1,
  });
  const assets = customRPCAssetsStore.getState().customRPCAssets;
  expect(assets[TEST_CHAIN_ID_1]).toStrictEqual([TEST_ASSET_1]);
});

test('Add multiple assets to the same chainId', async () => {
  customRPCAssetsStore.getState().addCustomRPCAsset({
    chainId: TEST_CHAIN_ID_1,
    customRPCAsset: TEST_ASSET_2,
  });
  customRPCAssetsStore.getState().addCustomRPCAsset({
    chainId: TEST_CHAIN_ID_1,
    customRPCAsset: TEST_ASSET_3,
  });
  const assets = customRPCAssetsStore.getState().customRPCAssets;
  expect(assets[TEST_CHAIN_ID_1]).toStrictEqual([
    TEST_ASSET_1,
    TEST_ASSET_2,
    TEST_ASSET_3,
  ]);
});

test('Add multiple assets to a different chainId', async () => {
  customRPCAssetsStore.getState().addCustomRPCAsset({
    chainId: TEST_CHAIN_ID_2,
    customRPCAsset: TEST_ASSET_1,
  });
  customRPCAssetsStore.getState().addCustomRPCAsset({
    chainId: TEST_CHAIN_ID_2,
    customRPCAsset: TEST_ASSET_2,
  });
  const assets = customRPCAssetsStore.getState().customRPCAssets;
  expect(assets[TEST_CHAIN_ID_2]).toStrictEqual([TEST_ASSET_1, TEST_ASSET_2]);
});

test('Update an existing asset', async () => {
  const updatedAsset = { ...TEST_ASSET_1, symbol: 'TOKEN1-UPDATED' };
  customRPCAssetsStore.getState().updateCustomRPCAsset({
    chainId: TEST_CHAIN_ID_1,
    customRPCAsset: updatedAsset,
  });
  const assets =
    customRPCAssetsStore.getState().customRPCAssets[TEST_CHAIN_ID_1];
  const asset = assets.find((a) => a.address === TEST_ASSET_1.address);
  expect(asset).toStrictEqual(updatedAsset);
});

test('Remove an asset from a chain with multiple assets', async () => {
  customRPCAssetsStore.getState().removeCustomRPCAsset({
    chainId: TEST_CHAIN_ID_1,
    address: TEST_ASSET_1.address,
  });
  const assets =
    customRPCAssetsStore.getState().customRPCAssets[TEST_CHAIN_ID_1];
  expect(assets).not.toContain(TEST_ASSET_1);
  expect(assets).toStrictEqual([TEST_ASSET_2, TEST_ASSET_3]);
});

test('Remove the last asset from a chain', async () => {
  customRPCAssetsStore.getState().removeCustomRPCAsset({
    chainId: TEST_CHAIN_ID_2,
    address: TEST_ASSET_1.address,
  });
  customRPCAssetsStore.getState().removeCustomRPCAsset({
    chainId: TEST_CHAIN_ID_2,
    address: TEST_ASSET_2.address,
  });
  const assets = customRPCAssetsStore.getState().customRPCAssets;
  expect(assets[TEST_CHAIN_ID_2]).toBeUndefined();
});
