import { renderHook } from '@testing-library/react';
import { Address } from 'viem';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import {
  DAI_MAINNET_ASSET,
  TEST_ADDRESS_1,
  USDC_MAINNET_ASSET,
} from '~/test/utils';

import { useSendValidations } from './useSendValidations';
vi.mock('../useUserNativeAsset', () => ({
  useUserNativeAsset: vi.fn().mockReturnValue({
    nativeAsset: { balance: { amount: '0' } },
  }),
}));

vi.mock('~/core/resources/assets', () => ({
  useUserAssets: vi.fn(),
}));

const USER_ASSETS = {
  [ChainId.mainnet]: {
    [DAI_MAINNET_ASSET.uniqueId]: DAI_MAINNET_ASSET,
    [USDC_MAINNET_ASSET.uniqueId]: USDC_MAINNET_ASSET,
  },
};

beforeEach(() => {
  vi.mocked(useUserAssets).mockReturnValue({ data: USER_ASSETS } as ReturnType<
    typeof useUserAssets
  >);
  useCurrentAddressStore.setState({
    currentAddress: TEST_ADDRESS_1 as Address,
  });
  useCurrentCurrencyStore.setState({ currentCurrency: 'USD' });
});

describe('validateToAddress', () => {
  test('detects sending to the token contract', () => {
    const { result } = renderHook(() =>
      useSendValidations({
        asset: DAI_MAINNET_ASSET,
        toAddress: DAI_MAINNET_ASSET.address as Address,
      }),
    );
    expect(result.current.validateToAddress()).toBe(true);
  });

  test('detects sending to a known token contract', () => {
    const { result } = renderHook(() =>
      useSendValidations({
        asset: DAI_MAINNET_ASSET,
        toAddress: USDC_MAINNET_ASSET.address as Address,
      }),
    );
    expect(result.current.validateToAddress()).toBe(true);
  });

  test('allows normal recipient', () => {
    const { result } = renderHook(() =>
      useSendValidations({
        asset: DAI_MAINNET_ASSET,
        toAddress: TEST_ADDRESS_1 as Address,
      }),
    );
    expect(result.current.validateToAddress()).toBe(false);
  });
});
