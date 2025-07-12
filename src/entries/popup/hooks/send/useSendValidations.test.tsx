import { renderHook } from '@testing-library/react';
import { Address } from 'viem';
import { expect, test } from 'vitest';

import { RAINBOW_TOKEN_LIST } from '~/core/network/rainbowTokenList';
import { GasFeeParams } from '~/core/types/gas';
import { TEST_ADDRESS_1, USDC_MAINNET_ASSET } from '~/test/utils';

import { useSendValidations } from './useSendValidations';

const GAS_PARAMS = {
  gasFee: { amount: '1', display: '1' },
} as unknown as GasFeeParams;

test('detects token contract address', () => {
  const { result } = renderHook(() =>
    useSendValidations({
      asset: USDC_MAINNET_ASSET,
      assetAmount: '1',
      selectedGas: GAS_PARAMS,
      toAddress: USDC_MAINNET_ASSET.address as Address,
    }),
  );
  expect(RAINBOW_TOKEN_LIST[USDC_MAINNET_ASSET.address.toLowerCase()]).toBe(
    true,
  );
  expect(result.current.isTokenContractAddress).toBe(true);
});

test('detects self send to token contract', () => {
  const { result } = renderHook(() =>
    useSendValidations({
      asset: USDC_MAINNET_ASSET,
      assetAmount: '1',
      selectedGas: GAS_PARAMS,
      toAddress: USDC_MAINNET_ASSET.address as Address,
    }),
  );
  expect(result.current.isSelfSend).toBe(true);
});

test('normal address passes validations', () => {
  const { result } = renderHook(() =>
    useSendValidations({
      asset: USDC_MAINNET_ASSET,
      assetAmount: '1',
      selectedGas: GAS_PARAMS,
      toAddress: TEST_ADDRESS_1 as Address,
    }),
  );
  expect(result.current.isTokenContractAddress).toBe(false);
  expect(result.current.isSelfSend).toBe(false);
});
