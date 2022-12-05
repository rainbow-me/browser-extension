import { CrosschainQuote, fillCrosschainQuote } from '@rainbow-me/swaps';
import { getProvider } from '@wagmi/core';
import { Wallet } from 'ethers';

import { gasStore } from '../../state';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '../../types/gas';
import {
  ProtocolType,
  TransactionStatus,
  TransactionType,
} from '../../types/transactions';
import { estimateGasWithPadding } from '../../utils/gas';
import { toHex } from '../../utils/numbers';
import {
  CHAIN_IDS_WITH_TRACE_SUPPORT,
  SWAP_GAS_PADDING,
  estimateSwapGasLimitWithFakeApproval,
  getBasicSwapGasLimit,
  getDefaultGasLimitForTrade,
  overrideWithFastSpeedIfNeeded,
} from '../utils';

import { Rap, RapCrosschainSwapActionParameters } from './../common';

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
  const { inputAmount, tradeDetails, chainId, requiresApprove } = parameters;
  const { selectedGas, gasFeeParamsBySpeed } = gasStore.getState();

  let gasParams = selectedGas.transactionGasParams;
  if (currentRap.actions.length - 1 > index) {
    gasParams = overrideWithFastSpeedIfNeeded({
      selectedGas,
      chainId,
      gasFeeParamsBySpeed,
    });
  }

  const gasLimit = await estimateCrosschainSwapGasLimit({
    chainId,
    requiresApprove,
    tradeDetails,
  });

  const nonce = baseNonce ? baseNonce + index : undefined;

  const swapParams = {
    chainId,
    gasLimit,
    nonce,
    tradeDetails,
    wallet,
    transactionGasParams: gasParams,
  };

  const swap = await executeCrosschainSwap(swapParams);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const newTransaction = {
    ...gasParams,
    amount: inputAmount,
    data: swap?.data,
    from: tradeDetails.from,
    gasLimit,
    hash: swap?.hash ?? null,
    chainId,
    nonce: swap?.nonce ?? null,
    protocol: ProtocolType.rainbow,
    status: TransactionStatus.swapping,
    to: swap?.to ?? null,
    type: TransactionType.trade,
    value: (swap && toHex(swap.value.toString())) || undefined,
  };

  return swap?.nonce;
};
