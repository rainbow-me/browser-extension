import { Signer } from '@ethersproject/abstract-signer';
import { CrosschainQuote, fillCrosschainQuote } from '@rainbow-me/swaps';
import { Address, getProvider } from '@wagmi/core';

import { gasUnits } from '~/core/references';
import { ChainId } from '~/core/types/chains';
import {
  NewTransaction,
  TransactionStatus,
  TransactionType,
} from '~/core/types/transactions';
import { addNewTransaction } from '~/core/utils/transactions';
import { RainbowError, logger } from '~/logger';

import { gasStore } from '../../state';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '../../types/gas';
import { estimateGasWithPadding } from '../../utils/gas';
import { toHex } from '../../utils/numbers';
import { ActionProps } from '../references';
import {
  CHAIN_IDS_WITH_TRACE_SUPPORT,
  SWAP_GAS_PADDING,
  estimateSwapGasLimitWithFakeApproval,
  getDefaultGasLimitForTrade,
  overrideWithFastSpeedIfNeeded,
} from '../utils';

const getCrosschainSwapDefaultGasLimit = (quote: CrosschainQuote) =>
  quote?.routes?.[0]?.userTxs?.[0]?.gasFees?.gasLimit;

export const estimateCrosschainSwapGasLimit = async ({
  chainId,
  requiresApprove,
  quote,
}: {
  chainId: ChainId;
  requiresApprove?: boolean;
  quote: CrosschainQuote;
}): Promise<string> => {
  const provider = getProvider({ chainId });
  if (!provider || !quote) {
    return gasUnits.basic_swap[chainId];
  }
  try {
    if (requiresApprove) {
      if (CHAIN_IDS_WITH_TRACE_SUPPORT.includes(chainId)) {
        try {
          const gasLimitWithFakeApproval =
            await estimateSwapGasLimitWithFakeApproval(
              chainId,
              provider,
              quote,
            );
          return gasLimitWithFakeApproval;
        } catch (e) {
          const routeGasLimit = getCrosschainSwapDefaultGasLimit(quote);
          if (routeGasLimit) return routeGasLimit;
        }
      }

      return (
        getCrosschainSwapDefaultGasLimit(quote) ||
        getDefaultGasLimitForTrade(quote, chainId)
      );
    }

    const gasLimit = await estimateGasWithPadding({
      transactionRequest: {
        data: quote.data,
        from: quote.from,
        to: quote.to,
        value: quote.value,
      },
      provider: provider,
      paddingFactor: SWAP_GAS_PADDING,
    });

    return gasLimit || getCrosschainSwapDefaultGasLimit(quote);
  } catch (error) {
    return getCrosschainSwapDefaultGasLimit(quote);
  }
};

export const executeCrosschainSwap = async ({
  gasLimit,
  gasParams,
  nonce,
  quote,
  wallet,
}: {
  gasLimit: string;
  gasParams: TransactionGasParams | TransactionLegacyGasParams;
  nonce?: number;
  quote: CrosschainQuote;
  wallet: Signer;
}) => {
  if (!wallet || !quote) return null;

  const transactionParams = {
    gasLimit: toHex(gasLimit) || undefined,
    nonce: nonce ? toHex(String(nonce)) : undefined,
    ...gasParams,
  };

  return fillCrosschainQuote(quote, transactionParams, wallet);
};

export const crosschainSwap = async ({
  wallet,
  currentRap,
  index,
  parameters,
  baseNonce,
}: ActionProps<'crosschainSwap'>): Promise<number | undefined> => {
  const { quote, chainId, requiresApprove } = parameters;
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
      quote,
    });
  } catch (e) {
    logger.error(
      new RainbowError('crosschainSwap: error estimateCrosschainSwapGasLimit'),
      {
        message: (e as Error)?.message,
      },
    );
    throw e;
  }

  const nonce = baseNonce ? baseNonce + index : undefined;

  const swapParams = {
    chainId,
    gasLimit,
    nonce,
    quote,
    wallet,
    gasParams,
  };

  let swap;
  try {
    swap = await executeCrosschainSwap(swapParams);
  } catch (e) {
    logger.error(
      new RainbowError('crosschainSwap: error executeCrosschainSwap'),
      {
        message: (e as Error)?.message,
      },
    );
    throw e;
  }

  const transaction: NewTransaction = {
    amount: parameters.quote.value?.toString(),
    asset: parameters.assetToSell,
    data: parameters.quote.data,
    value: parameters.quote.value,
    from: parameters.quote.from as Address,
    to: parameters.quote.to as Address,
    hash: swap?.hash,
    chainId: parameters.chainId,
    nonce: swap?.nonce,
    status: TransactionStatus.swapping,
    type: TransactionType.trade,
    flashbots: parameters.flashbots,
    gasPrice: (gasParams as TransactionLegacyGasParams).gasPrice,
    maxFeePerGas: (gasParams as TransactionGasParams).maxFeePerGas,
    maxPriorityFeePerGas: (gasParams as TransactionGasParams)
      .maxPriorityFeePerGas,
  };
  await addNewTransaction({
    address: parameters.quote.from as Address,
    chainId: parameters.chainId as ChainId,
    transaction,
  });

  return swap?.nonce;
};
