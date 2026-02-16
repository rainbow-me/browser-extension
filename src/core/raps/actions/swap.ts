import type { BatchCall } from '@rainbow-me/delegation';
import {
  CrosschainQuote,
  Quote,
  ChainId as SwapChainId,
  SwapType,
  fillQuote,
  getQuoteExecutionDetails,
  getWrappedAssetAddress,
  getWrappedAssetMethod,
  unwrapNativeAsset,
  wrapNativeAsset,
} from '@rainbow-me/swaps';
import { Address, Hash, WalletClient } from 'viem';

import { metadataPostClient } from '~/core/graphql';
import { useGasStore } from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { getErrorMessage } from '~/core/utils/errors';
import { addNewTransaction } from '~/core/utils/transactions';
import { getViemClient } from '~/core/viem/clients';
import { RainbowError, logger } from '~/logger';

import { REFERRER } from '../../references';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '../../types/gas';
import { estimateGasWithPadding } from '../../utils/gas';
import {
  ActionProps,
  RapActionResult,
  type RapSwapActionParameters,
} from '../references';
import {
  CHAIN_IDS_WITH_TRACE_SUPPORT,
  SWAP_GAS_PADDING,
  deserializeGasParams,
  estimateSwapGasLimitWithFakeApproval,
  getDefaultGasLimitForTrade,
  getTargetAddressForQuote,
  isValidGasParams,
  overrideWithFastSpeedIfNeeded,
  populateSwap,
  toTransactionOptions,
  waitForGasParams,
} from '../utils';

import { populateApprove } from './unlock';

const WRAP_GAS_PADDING = 1.002;

export const prepareSwap = async ({
  parameters,
  quote,
  gasParams,
}: {
  parameters: RapSwapActionParameters<'swap'>;
  wallet: WalletClient;
  chainId: number;
  quote: Quote;
  gasParams?: TransactionGasParams | TransactionLegacyGasParams;
}): Promise<{
  call: BatchCall;
  transaction: Omit<NewTransaction, 'hash'>;
}> => {
  const batchCall = await populateSwap({ quote });
  if (!batchCall) throw new RainbowError('prepareSwap: populateSwap failed');

  const call: BatchCall = {
    to: batchCall.to,
    value: (typeof batchCall.value === 'string'
      ? batchCall.value
      : `0x${BigInt(batchCall.value).toString(16)}`) as `0x${string}`,
    data: batchCall.data as `0x${string}`,
  };

  const { selectedGas } = useGasStore.getState();
  const gas = gasParams ?? selectedGas?.transactionGasParams;
  if (!gas || !isValidGasParams(gas)) {
    throw new RainbowError('prepareSwap: gas params required');
  }

  const transaction: Omit<NewTransaction, 'hash'> = {
    data: quote.data,
    from: quote.from,
    to: (quote.to ?? getTargetAddressForQuote(quote)) as Address,
    value: quote.value?.toString() ?? '0',
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
    chainId: parameters.chainId,
    nonce: 0,
    status: 'pending',
    type: 'swap',
    ...('gasPrice' in gas
      ? { gasPrice: gas.gasPrice.toString() }
      : {
          maxFeePerGas: gas.maxFeePerGas.toString(),
          maxPriorityFeePerGas: gas.maxPriorityFeePerGas.toString(),
        }),
  };

  return { call, transaction };
};

export const estimateSwapGasLimit = async ({
  chainId,
  requiresApprove,
  quote,
}: {
  chainId: ChainId;
  requiresApprove?: boolean;
  quote: Quote;
}): Promise<bigint> => {
  const client = getViemClient({ chainId });

  if (!quote) {
    const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
    return BigInt(chainGasUnits.basic.swap);
  }

  const isWrapNativeAsset = quote.swapType === SwapType.wrap;
  const isUnwrapNativeAsset = quote.swapType === SwapType.unwrap;

  if (isWrapNativeAsset || isUnwrapNativeAsset) {
    const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);

    const default_estimate = isWrapNativeAsset
      ? chainGasUnits.wrapped.wrap
      : chainGasUnits.wrapped.unwrap;
    try {
      const wrappedMethod = getWrappedAssetMethod(
        isWrapNativeAsset ? 'deposit' : 'withdraw',
        client,
        getWrappedAssetAddress(quote),
      );
      const gasLimit = await estimateGasWithPadding({
        transactionRequest: {
          from: quote.from,
          value: isWrapNativeAsset ? BigInt(quote.buyAmount) : 0n,
        },
        contractCallEstimateGas: () =>
          wrappedMethod({
            value: isWrapNativeAsset ? BigInt(quote.buyAmount) : undefined,
            args: isWrapNativeAsset ? [] : [BigInt(quote.sellAmount)],
          }),
        client,
        paddingFactor: WRAP_GAS_PADDING,
      });

      return gasLimit ?? BigInt(quote?.defaultGasLimit ?? default_estimate);
    } catch (e) {
      return BigInt(quote?.defaultGasLimit ?? default_estimate);
    }
  } else {
    try {
      const { params, method } = getQuoteExecutionDetails(
        quote,
        { from: quote.from },
        client,
      );

      if (requiresApprove) {
        if (CHAIN_IDS_WITH_TRACE_SUPPORT.includes(chainId)) {
          try {
            const gasLimitWithFakeApproval =
              await estimateSwapGasLimitWithFakeApproval(
                chainId,
                client,
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
        transactionRequest: {
          from: quote.from,
          to: quote.to ?? getTargetAddressForQuote(quote),
          value: params.value != null ? BigInt(params.value) : undefined,
        },
        contractCallEstimateGas: () => method(),
        client,
        paddingFactor: SWAP_GAS_PADDING,
      });

      return gasLimit ?? getDefaultGasLimitForTrade(quote, chainId);
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
      spender: getTargetAddressForQuote(quote),
      chainId,
    });
    const swapTransaction = await populateSwap({ quote });
    if (
      approveTransaction?.to &&
      approveTransaction?.data &&
      swapTransaction?.to &&
      swapTransaction?.data
    ) {
      const transactions = swapAssetNeedsUnlocking
        ? [
            {
              to: approveTransaction.to,
              data: approveTransaction.data || '0x0',
              from: accountAddress,
              value: approveTransaction.value?.toString() || '0x0',
            },
            {
              to: swapTransaction.to,
              data: (swapTransaction.data as string) || '0x0',
              from: accountAddress,
              value: swapTransaction.value?.toString() || '0x0',
            },
          ]
        : [
            {
              to: swapTransaction.to,
              data: (swapTransaction.data as string) || '0x0',
              from: accountAddress,
              value: swapTransaction.value?.toString() || '0x0',
            },
          ];

      const response = await metadataPostClient.simulateTransactions({
        chainId,
        transactions,
      });
      const gasLimit =
        response.simulateTransactions
          ?.flatMap((res) => {
            const estimate = res?.gas?.estimate;
            return estimate ? [BigInt(estimate)] : [];
          })
          .reduce((acc, limit) => acc + limit, 0n) ?? 0n;
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
  gasLimit: bigint;
  gasParams: TransactionGasParams | TransactionLegacyGasParams;
  nonce?: number;
  quote: Quote;
  wallet: WalletClient;
}): Promise<Hash | null> => {
  if (!wallet || !quote) return null;

  const txOptions = toTransactionOptions({ gasLimit, gasParams, nonce });

  if (quote.swapType === SwapType.wrap) {
    return wrapNativeAsset(
      quote.buyAmount,
      wallet,
      getWrappedAssetAddress(quote),
      txOptions,
    );
  } else if (quote.swapType === SwapType.unwrap) {
    return unwrapNativeAsset(
      quote.sellAmount,
      wallet,
      getWrappedAssetAddress(quote),
      txOptions,
    );
  } else if (quote.swapType === SwapType.normal) {
    return fillQuote(
      quote,
      txOptions,
      wallet,
      false,
      (quote.chainId ?? chainId) as SwapChainId,
      REFERRER,
    );
  }
  return null;
};

export const swap = async ({
  client,
  currentRap,
  wallet,
  index,
  parameters,
  baseNonce,
}: ActionProps<'swap'>): Promise<RapActionResult> => {
  const { quote, chainId, requiresApprove } = parameters;

  let gasParams = deserializeGasParams(parameters.serializedGasParams);

  if (!gasParams) {
    let { selectedGas, gasFeeParamsBySpeed } = useGasStore.getState();
    if (!selectedGas || !isValidGasParams(selectedGas.transactionGasParams)) {
      await waitForGasParams();
      ({ selectedGas, gasFeeParamsBySpeed } = useGasStore.getState());
    }

    gasParams = selectedGas!.transactionGasParams;
    if (currentRap.actions.length - 1 > index) {
      gasParams = overrideWithFastSpeedIfNeeded({
        selectedGas: selectedGas!,
        chainId,
        gasFeeParamsBySpeed,
      });
    }
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
      message: getErrorMessage(e),
    });

    throw e;
  }

  let txHash: Hash | null;
  const nonce = baseNonce ? baseNonce + index : undefined;
  try {
    const swapParams = {
      gasParams,
      chainId,
      gasLimit,
      nonce,
      quote,
      wallet,
    };
    txHash = await executeSwap(swapParams);
  } catch (e) {
    logger.error(new RainbowError('swap: error executeSwap'), {
      message: getErrorMessage(e),
    });
    throw e;
  }

  if (!txHash) throw new RainbowError('swap: error executeSwap');

  const tx = await client.getTransaction({ hash: txHash });

  const transaction = {
    data: quote.data,
    from: quote.from,
    to: quote.to ?? getTargetAddressForQuote(quote),
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
    hash: txHash as TxHash,
    chainId: parameters.chainId,
    nonce: tx.nonce,
    status: 'pending',
    type: 'swap',
    ...('gasPrice' in gasParams
      ? { gasPrice: gasParams.gasPrice.toString() }
      : {
          maxFeePerGas: gasParams.maxFeePerGas.toString(),
          maxPriorityFeePerGas: gasParams.maxPriorityFeePerGas.toString(),
        }),
  } satisfies NewTransaction;

  addNewTransaction({
    address: parameters.quote.from,
    chainId: parameters.chainId,
    transaction,
  });

  return {
    nonce: tx.nonce,
    hash: txHash,
  };
};
