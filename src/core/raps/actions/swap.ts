import { type Signer } from '@ethersproject/abstract-signer';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import type { BatchCall } from '@rainbow-me/delegation';
import {
  type CrosschainQuote,
  type Quote,
  SwapType,
  getQuoteExecutionDetails,
  getWrappedAssetAddress,
  getWrappedAssetMethod,
  prepareFillQuote,
  unwrapNativeAsset,
  wrapNativeAsset,
} from '@rainbow-me/swaps';
import { type Address } from 'viem';

import { useGasStore } from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { type ChainId } from '~/core/types/chains';
import { type NewTransaction } from '~/core/types/transactions';
import { addNewTransaction } from '~/core/utils/transactions';
import { getProvider } from '~/core/viem/clientToProvider';
import { RainbowError, logger } from '~/logger';

import { REFERRER } from '../../references';
import { estimateTransactionsGasLimit } from '../../resources/transactions/simulation';
import {
  type TransactionGasParams,
  type TransactionLegacyGasParams,
} from '../../types/gas';
import { estimateGasWithPadding } from '../../utils/gas';
import { toHex } from '../../utils/hex';
import {
  type ActionProps,
  type PrepareActionProps,
  type RapActionResult,
  type RapSwapActionParameters,
} from '../references';
import {
  type ReplayableExecution,
  extractReplayableExecution,
} from '../replay';
import {
  CHAIN_IDS_WITH_TRACE_SUPPORT,
  SWAP_GAS_PADDING,
  estimateSwapGasLimitWithFakeApproval,
  getDefaultGasLimitForTrade,
  getQuoteAllowanceTargetAddress,
  overrideWithFastSpeedIfNeeded,
  populateSwap,
} from '../utils';
import { requireAddress, requireHex } from '../validation';

import { populateApprove } from './unlock';

const WRAP_GAS_PADDING = 1.002;
type SwapExecutionResult = {
  hash: string;
  nonce: number;
  replayableCall: ReplayableExecution['replayableCall'];
};

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
    const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
    return chainGasUnits.basic.swap;
  }

  const isWrapNativeAsset = quote.swapType === SwapType.wrap;
  const isUnwrapNativeAsset = quote.swapType === SwapType.unwrap;

  // Wrap / Unwrap Eth
  if (isWrapNativeAsset || isUnwrapNativeAsset) {
    const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);

    const default_estimate = isWrapNativeAsset
      ? chainGasUnits.wrapped.wrap
      : chainGasUnits.wrapped.unwrap;
    try {
      const gasLimit = await estimateGasWithPadding({
        transactionRequest: {
          from: quote.from,
          value: isWrapNativeAsset ? quote.buyAmount.toString() : '0',
        },
        contractCallEstimateGas: getWrappedAssetMethod(
          isWrapNativeAsset ? 'deposit' : 'withdraw',
          provider as StaticJsonRpcProvider,
          getWrappedAssetAddress(quote),
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

export const estimateUnlockAndSwap = async ({
  requiresApprove,
  chainId,
  accountAddress,
  sellTokenAddress,
  quote,
}: {
  requiresApprove: boolean;
  chainId: ChainId;
  accountAddress: Address;
  sellTokenAddress: Address;
  quote: Quote | CrosschainQuote;
}) => {
  const approveTransaction = requiresApprove
    ? await populateApprove({
        owner: accountAddress,
        tokenAddress: sellTokenAddress,
        spender: getQuoteAllowanceTargetAddress(quote),
        chainId,
      })
    : null;

  const swapTransaction = await populateSwap({
    provider: getProvider({ chainId }),
    quote,
  });

  const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);

  const steps = [
    ...(requiresApprove
      ? [
          {
            transaction:
              approveTransaction?.to &&
              approveTransaction?.data &&
              approveTransaction?.from
                ? {
                    to: approveTransaction.to,
                    data: approveTransaction.data || '0x0',
                    from: approveTransaction.from,
                    value: approveTransaction.value?.toString() || '0x0',
                  }
                : null,
            label: 'approve',
            fallbackEstimate: async () =>
              String(chainGasUnits.basic.approval) || undefined,
          },
        ]
      : []),
    {
      transaction:
        swapTransaction?.to && swapTransaction?.data && swapTransaction?.from
          ? {
              to: swapTransaction.to,
              data: swapTransaction.data || '0x0',
              from: swapTransaction.from,
              value: swapTransaction.value?.toString() || '0x0',
            }
          : null,
      label: 'swap',
      fallbackEstimate: async () =>
        getDefaultGasLimitForTrade(quote, chainId) || undefined,
    },
  ];

  return estimateTransactionsGasLimit({ chainId, steps });
};

export const executeSwap = async ({
  gasLimit,
  nonce,
  quote,
  gasParams,
  wallet,
}: {
  gasLimit: string;
  gasParams: TransactionGasParams | TransactionLegacyGasParams;
  nonce?: number;
  quote: Quote;
  wallet: Signer;
}): Promise<SwapExecutionResult | null> => {
  if (!wallet || !quote) return null;

  const transactionParams = {
    gasLimit: toHex(gasLimit) || undefined,
    nonce: nonce !== undefined ? toHex(`${nonce}`) : undefined,
    ...gasParams,
  };

  if (quote.swapType === SwapType.wrap) {
    return extractReplayableExecution(
      await wrapNativeAsset(
        quote.buyAmount,
        wallet,
        getWrappedAssetAddress(quote),
        transactionParams,
      ),
    );
  }

  if (quote.swapType === SwapType.unwrap) {
    return extractReplayableExecution(
      await unwrapNativeAsset(
        quote.sellAmount,
        wallet,
        getWrappedAssetAddress(quote),
        transactionParams,
      ),
    );
  }

  if (quote.swapType === SwapType.normal) {
    const preparedCall = await prepareFillQuote(
      quote,
      transactionParams,
      wallet,
      false,
      quote.chainId,
      REFERRER,
    );
    return extractReplayableExecution(
      await wallet.sendTransaction({
        data: preparedCall.data,
        to: preparedCall.to,
        value: preparedCall.value,
        ...transactionParams,
      }),
      preparedCall,
    );
  }

  return null;
};

const REFERRER_BX = 'browser-extension';

/**
 * Build a swap transaction object (without hash) for tracking.
 */
function buildSwapTransaction(
  parameters: RapSwapActionParameters<'swap'>,
  gasParams: TransactionGasParams | TransactionLegacyGasParams,
  nonce?: number,
  gasLimit?: string,
): Omit<NewTransaction, 'hash'> {
  const { quote, chainId, assetToSell, assetToBuy } = parameters;

  return {
    data: quote.data,
    from: requireAddress(quote.from, 'swap quote.from'),
    to: requireAddress(quote.to, 'swap quote.to'),
    value: quote.value?.toString(),
    nonce: nonce ?? 0,
    gasLimit,
    asset: assetToBuy,
    changes: [
      {
        direction: 'out',
        asset: assetToSell,
        value: quote.sellAmount.toString(),
      },
      {
        direction: 'in',
        asset: assetToBuy,
        value: quote.buyAmount.toString(),
      },
    ],
    chainId,
    status: 'pending',
    type: 'swap',
    ...gasParams,
  };
}

/**
 * Prepare a swap call for atomic execution.
 * Returns the BatchCall object and transaction metadata without executing.
 */
export const prepareSwap = async ({
  parameters,
  quote,
  wallet,
}: PrepareActionProps<'swap'>): Promise<{
  call: BatchCall;
  transaction: Omit<NewTransaction, 'hash'>;
}> => {
  const { selectedGas } = useGasStore.getState();
  const gasParams = parameters.gasParams ?? selectedGas.transactionGasParams;

  const tx = await prepareFillQuote(
    quote,
    {},
    wallet,
    false,
    quote.chainId,
    REFERRER_BX,
  );

  return {
    call: {
      to: requireAddress(tx.to, 'swap prepared tx.to'),
      value: toHex(BigInt(tx.value?.toString() ?? '0')),
      data: requireHex(tx.data, 'swap prepared tx.data'),
    },
    transaction: buildSwapTransaction(parameters, gasParams),
  };
};

export const swap = async ({
  currentRap,
  wallet,
  index,
  parameters,
  baseNonce,
}: ActionProps<'swap'>): Promise<RapActionResult> => {
  const { selectedGas, gasFeeParamsBySpeed } = useGasStore.getState();

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
      message: e instanceof Error ? e.message : String(e),
    });

    throw e;
  }

  let execution;
  try {
    const nonce = typeof baseNonce === 'number' ? baseNonce + index : undefined;
    const swapParams = {
      gasParams,
      gasLimit,
      nonce,
      quote,
      wallet,
    };
    execution = await executeSwap(swapParams);
  } catch (e) {
    logger.error(new RainbowError('swap: error executeSwap'), {
      message: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }

  if (!execution) throw new RainbowError('swap: error executeSwap');

  const transaction: NewTransaction = {
    ...buildSwapTransaction(
      parameters,
      gasParams,
      execution.nonce,
      gasLimit?.toString(),
    ),
    ...execution.replayableCall,
    hash: requireHex(execution.hash, 'swap tx hash'),
  };

  addNewTransaction({
    address: requireAddress(parameters.quote.from, 'swap quote.from'),
    chainId: parameters.chainId,
    transaction,
  });

  return {
    nonce: execution.nonce,
    hash: execution.hash,
  };
};
