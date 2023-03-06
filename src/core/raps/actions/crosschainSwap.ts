import { Wallet } from '@ethersproject/wallet';
import { CrosschainQuote, fillCrosschainQuote } from '@rainbow-me/swaps';
import { getProvider } from '@wagmi/core';

import { logger } from '~/logger';

import { gasStore } from '../../state';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '../../types/gas';
import { estimateGasWithPadding } from '../../utils/gas';
import { toHex } from '../../utils/numbers';
import { Rap, RapCrosschainSwapActionParameters } from '../references';
import {
  CHAIN_IDS_WITH_TRACE_SUPPORT,
  SWAP_GAS_PADDING,
  estimateSwapGasLimitWithFakeApproval,
  getBasicSwapGasLimit,
  getDefaultGasLimitForTrade,
  overrideWithFastSpeedIfNeeded,
} from '../utils';

const getCrosschainSwapDefaultGasLimit = (tradeDetails: CrosschainQuote) =>
  tradeDetails?.routes?.[0]?.userTxs?.[0]?.gasFees?.gasLimit;

export const estimateCrosschainSwapGasLimit = async ({
  chainId,
  requiresApprove,
  tradeDetails,
}: {
  chainId: number;
  requiresApprove?: boolean;
  tradeDetails: CrosschainQuote;
}): Promise<string> => {
  const provider = await getProvider({ chainId });

  if (!provider || !tradeDetails) {
    return getBasicSwapGasLimit(chainId);
  }
  try {
    if (requiresApprove) {
      if (CHAIN_IDS_WITH_TRACE_SUPPORT.includes(chainId)) {
        try {
          const gasLimitWithFakeApproval =
            await estimateSwapGasLimitWithFakeApproval(
              chainId,
              provider,
              tradeDetails,
            );
          return gasLimitWithFakeApproval;
        } catch (e) {
          const routeGasLimit = getCrosschainSwapDefaultGasLimit(tradeDetails);
          if (routeGasLimit) return routeGasLimit;
        }
      }

      return (
        getCrosschainSwapDefaultGasLimit(tradeDetails) ||
        getDefaultGasLimitForTrade(tradeDetails, chainId)
      );
    }

    const gasLimit = await estimateGasWithPadding({
      transactionRequest: {
        data: tradeDetails.data,
        from: tradeDetails.from,
        to: tradeDetails.to,
        value: tradeDetails.value,
      },
      provider: provider,
      paddingFactor: SWAP_GAS_PADDING,
    });

    return gasLimit || getCrosschainSwapDefaultGasLimit(tradeDetails);
  } catch (error) {
    return getCrosschainSwapDefaultGasLimit(tradeDetails);
  }
};

export const executeCrosschainSwap = async ({
  gasLimit,
  transactionGasParams,
  nonce,
  tradeDetails,
  wallet,
}: {
  gasLimit: string;
  transactionGasParams: TransactionGasParams | TransactionLegacyGasParams;
  nonce?: number;
  tradeDetails: CrosschainQuote;
  wallet: Wallet | null;
}) => {
  if (!wallet || !tradeDetails) return null;

  const transactionParams = {
    gasLimit: toHex(gasLimit) || undefined,
    nonce: nonce ? toHex(String(nonce)) : undefined,
    ...transactionGasParams,
  };

  return fillCrosschainQuote(tradeDetails, transactionParams, wallet);
};

export const crosschainSwap = async (
  wallet: Wallet,
  currentRap: Rap,
  index: number,
  parameters: RapCrosschainSwapActionParameters,
  baseNonce?: number,
): Promise<number | undefined> => {
  const { tradeDetails, chainId, requiresApprove } = parameters;
  const { selectedGas, gasFeeParamsBySpeed } = gasStore.getState();

  let gasParams = selectedGas.transactionGasParams;
  if (currentRap.actions.length - 1 > index) {
    gasParams = overrideWithFastSpeedIfNeeded({
      selectedGas,
      chainId,
      gasFeeParamsBySpeed,
    });
  }

  let gasLimit;
  try {
    gasLimit = await estimateCrosschainSwapGasLimit({
      chainId,
      requiresApprove,
      tradeDetails,
    });
  } catch (e) {
    logger.error({
      name: 'crosschainSwap: error estimateCrosschainSwapGasLimit',
      message: (e as Error)?.message,
    });
    throw e;
  }

  const nonce = baseNonce ? baseNonce + index : undefined;

  const swapParams = {
    chainId,
    gasLimit,
    nonce,
    tradeDetails,
    wallet,
    transactionGasParams: gasParams,
  };

  let swap;
  try {
    swap = await executeCrosschainSwap(swapParams);
  } catch (e) {
    logger.error({
      name: 'crosschainSwap: error executeCrosschainSwap',
      message: (e as Error)?.message,
    });
    throw e;
  }

  return swap?.nonce;
};
