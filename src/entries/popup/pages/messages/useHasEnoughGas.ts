import { useMemo } from 'react';
import { Hex, hexToBigInt } from 'viem';

import { hasEnoughNativeBalanceForSend } from '~/core/send/nativeSendBalance';
import { useGasStore } from '~/core/state';
import { ActiveSession } from '~/core/state/appSessions';
import { ChainId } from '~/core/types/chains';
import { toWei } from '~/core/utils/ethereum';

import { useUserNativeAsset } from '../../hooks/useUserNativeAsset';

/**
 * @param nativeValueHex — tx `value` (hex wei). When set, balance must cover
 * value + gas (same as `useSendValidations` / `hasEnoughNativeBalanceForSend`).
 */
export const useHasEnoughGas = (
  session: ActiveSession,
  options?: { nativeValueHex?: Hex },
) => {
  const chainId = session?.chainId || ChainId.mainnet;

  const { nativeAsset, isLoading: isNativeAssetLoading } = useUserNativeAsset({
    address: session?.address,
    chainId,
  });

  const selectedGas = useGasStore((state) => state.selectedGas);

  const hasEnough = useMemo(() => {
    // If balance is still loading, we don't know if user has enough gas yet
    if (isNativeAssetLoading) {
      return undefined; // Unknown state
    }

    const balanceWei = BigInt(toWei(nativeAsset?.balance?.amount || '0'));
    const gasFeeWei = BigInt(selectedGas?.gasFee?.amount || '0');
    const valueWei = options?.nativeValueHex
      ? hexToBigInt(options.nativeValueHex)
      : 0n;

    return hasEnoughNativeBalanceForSend({
      balanceWei,
      valueWei,
      gasFeeWei,
    });
  }, [
    selectedGas?.gasFee?.amount,
    nativeAsset?.balance?.amount,
    isNativeAssetLoading,
    options?.nativeValueHex,
  ]);

  return {
    hasEnough,
    isLoading: isNativeAssetLoading,
  };
};
