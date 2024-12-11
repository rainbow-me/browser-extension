import { Signer } from '@ethersproject/abstract-signer';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Transaction } from '@ethersproject/transactions';
import {
  CrosschainQuote,
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  Quote,
  ChainId as SwapChainId,
  SwapType,
  WRAPPED_ASSET,
  fillQuote,
  getQuoteExecutionDetails,
  getRainbowRouterContractAddress,
  getWrappedAssetMethod,
  unwrapNativeAsset,
  wrapNativeAsset,
} from '@rainbow-me/swaps';
import { Address } from 'viem';

import { metadataPostClient } from '~/core/graphql';
import { getChainGasUnits } from '~/core/references/chains';
import { ChainId } from '~/core/types/chains';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { add } from '~/core/utils/numbers';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { addNewTransaction } from '~/core/utils/transactions';
import { getProvider } from '~/core/wagmi/clientToProvider';
import { TransactionSimulationResponse } from '~/entries/popup/pages/messages/useSimulateTransaction';
import { RainbowError, logger } from '~/logger';

import { REFERRER } from '../../references';
import { gasStore } from '../../state';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '../../types/gas';
import { estimateGasWithPadding } from '../../utils/gas';
import { toHex } from '../../utils/hex';
import { ActionProps, RapActionResult } from '../references';
import {
  CHAIN_IDS_WITH_TRACE_SUPPORT,
  SWAP_GAS_PADDING,
  estimateSwapGasLimitWithFakeApproval,
  getDefaultGasLimitForTrade,
  overrideWithFastSpeedIfNeeded,
  populateSwap,
} from '../utils';

import { populateApprove } from './unlock';

const WRAP_GAS_PADDING = 1.002;

export const estimateSwapGasLimit = async ({
  chainId,
  requiresApprove,
  quote,
}: {
  chainId: ChainId;
  requiresApprove?: boolean;
  quote: Quote;
}): Promise<string> => {
  const provider = getProvider({ chainId });

  if (!provider || !quote) {
    return getChainGasUnits(chainId).basic.swap;
  }

  const { sellTokenAddress, buyTokenAddress } = quote;
  const isWrapNativeAsset =
    isLowerCaseMatch(sellTokenAddress, ETH_ADDRESS_AGGREGATORS) &&
    isLowerCaseMatch(buyTokenAddress, WRAPPED_ASSET[chainId]);

  const isUnwrapNativeAsset =
    isLowerCaseMatch(sellTokenAddress, WRAPPED_ASSET[chainId]) &&
    isLowerCaseMatch(buyTokenAddress, ETH_ADDRESS_AGGREGATORS);

  // Wrap / Unwrap Eth
  if (isWrapNativeAsset || isUnwrapNativeAsset) {
    const default_estimate = isWrapNativeAsset
      ? getChainGasUnits(chainId).wrapped.wrap
      : getChainGasUnits(chainId).wrapped.unwrap;
    try {
      const gasLimit = await estimateGasWithPadding({
        transactionRequest: {
          from: quote.from,
          value: isWrapNativeAsset ? quote.buyAmount.toString() : '0',
        },
        contractCallEstimateGas: getWrappedAssetMethod(
          isWrapNativeAsset ? 'deposit' : 'withdraw',
          provider as StaticJsonRpcProvider,
          chainId as unknown as SwapChainId,
        ),
        callArguments: isWrapNativeAsset ? [] : [quote.buyAmount.toString()],
        provider,
        paddingFactor: WRAP_GAS_PADDING,
      });

      return (
        gasLimit || String(quote?.defaultGasLimit) || String(default_estimate)
      );
    } catch (e) {
      return String(quote?.defaultGasLimit) || String(default_estimate);
    }
    // Swap
  } else {
    try {
      const { params, method, methodArgs } = getQuoteExecutionDetails(
        quote,
        { from: quote.from },
        provider as StaticJsonRpcProvider,
      );

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
            //
          }
        }

        return getDefaultGasLimitForTrade(quote, chainId);
      }

      const gasLimit = await estimateGasWithPadding({
        transactionRequest: params,
        contractCallEstimateGas: method,
        callArguments: methodArgs,
        provider,
        paddingFactor: SWAP_GAS_PADDING,
      });

      return gasLimit || getDefaultGasLimitForTrade(quote, chainId);
    } catch (error) {
      return getDefaultGasLimitForTrade(quote, chainId);
    }
  }
};

export const estimateUnlockAndSwapFromMetadata = async ({
  swapAssetNeedsUnlocking,
  chainId,
  accountAddress,
  sellTokenAddress,
  quote,
}: {
  swapAssetNeedsUnlocking: boolean;
  chainId: ChainId;
  accountAddress: Address;
  sellTokenAddress: Address;
  quote: Quote | CrosschainQuote;
}) => {
  try {
    const approveTransaction = await populateApprove({
      owner: accountAddress,
      tokenAddress: sellTokenAddress,
      spender: getRainbowRouterContractAddress(chainId as number),
      chainId,
    });
    const swapTransaction = await populateSwap({
      provider: getProvider({ chainId }),
      quote,
    });
    if (
      approveTransaction?.to &&
      approveTransaction?.data &&
      approveTransaction?.from &&
      swapTransaction?.to &&
      swapTransaction?.data &&
      swapTransaction?.from
    ) {
      const transactions = swapAssetNeedsUnlocking
        ? [
            {
              to: approveTransaction?.to,
              data: approveTransaction?.data || '0x0',
              from: approveTransaction?.from,
              value: approveTransaction?.value?.toString() || '0x0',
            },
            {
              to: swapTransaction?.to,
              data: swapTransaction?.data || '0x0',
              from: swapTransaction?.from,
              value: swapTransaction?.value?.toString() || '0x0',
            },
          ]
        : [
            {
              to: swapTransaction?.to,
              data: swapTransaction?.data || '0x0',
              from: swapTransaction?.from,
              value: swapTransaction?.value?.toString() || '0x0',
            },
          ];

      const response = (await metadataPostClient.simulateTransactions({
        chainId,
        transactions,
      })) as TransactionSimulationResponse;
      const gasLimit = response.simulateTransactions
        .map((res) => res.gas.estimate)
        .reduce((acc, limit) => add(acc, limit), '0');
      return gasLimit;
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const executeSwap = async ({
  chainId,
  gasLimit,
  nonce,
  quote,
  gasParams,
  wallet,
}: {
  chainId: ChainId;
  gasLimit: string;
  gasParams: TransactionGasParams | TransactionLegacyGasParams;
  nonce?: number;
  quote: Quote;
  wallet: Signer;
}): Promise<Transaction | null> => {
  if (!wallet || !quote) return null;

  const transactionParams = {
    gasLimit: toHex(gasLimit) || undefined,
    nonce: nonce ? toHex(`${nonce}`) : undefined,
    ...gasParams,
  };

  // Wrap native
  if (quote.swapType === SwapType.wrap) {
    return wrapNativeAsset(
      quote.buyAmount,
      wallet,
      chainId as unknown as SwapChainId,
      transactionParams,
    );
    // Unwrap native
  } else if (quote.swapType === SwapType.unwrap) {
    return unwrapNativeAsset(
      quote.sellAmount,
      wallet,
      chainId as unknown as SwapChainId,
      transactionParams,
    );
    // Swap
  } else {
    return fillQuote(
      quote,
      transactionParams,
      wallet,
      false,
      chainId as unknown as SwapChainId,
      REFERRER,
    );
  }
};

export const swap = async ({
  currentRap,
  wallet,
  index,
  parameters,
  baseNonce,
}: ActionProps<'swap'>): Promise<RapActionResult> => {
  const { selectedGas, gasFeeParamsBySpeed } = gasStore.getState();

  const { quote, chainId, requiresApprove } = parameters;
  let gasParams = selectedGas.transactionGasParams;
  // if swap isn't the last action, use fast gas or custom (whatever is faster)

  if (currentRap.actions.length - 1 > index) {
    gasParams = overrideWithFastSpeedIfNeeded({
      selectedGas,
      chainId,
      gasFeeParamsBySpeed,
    });
  }

  let gasLimit;

  try {
    gasLimit = await estimateSwapGasLimit({
      chainId,
      requiresApprove,
      quote,
    });
  } catch (e) {
    logger.error(new RainbowError('swap: error estimateSwapGasLimit'), {
      message: (e as Error)?.message,
    });

    throw e;
  }

  let swap;
  try {
    const nonce = baseNonce ? baseNonce + index : undefined;
    const swapParams = {
      gasParams,
      chainId,
      gasLimit,
      nonce,
      quote,
      wallet,
    };
    swap = await executeSwap(swapParams);
  } catch (e) {
    logger.error(new RainbowError('swap: error executeSwap'), {
      message: (e as Error)?.message,
    });
    throw e;
  }

  if (!swap) throw new RainbowError('swap: error executeSwap');

  const transaction = {
    data: swap.data,
    from: swap.from as Address,
    to: swap.to as Address,
    value: quote.value?.toString(),
    asset: parameters.assetToBuy,
    changes: [
      {
        direction: 'out',
        asset: parameters.assetToSell,
        value: quote.sellAmount.toString(),
      },
      {
        direction: 'in',
        asset: parameters.assetToBuy,
        value: quote.buyAmount.toString(),
      },
    ],
    hash: swap.hash as TxHash,
    chainId: parameters.chainId,
    nonce: swap.nonce,
    status: 'pending',
    type: 'swap',
    flashbots: parameters.flashbots,
    ...gasParams,
  } satisfies NewTransaction;

  addNewTransaction({
    address: parameters.quote.from as Address,
    chainId: parameters.chainId as ChainId,
    transaction,
  });

  return {
    nonce: swap.nonce,
    hash: swap.hash,
  };
};
