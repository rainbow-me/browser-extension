import { type Signer } from '@ethersproject/abstract-signer';
import type { BatchCall } from '@rainbow-me/delegation';
import {
  type CrosschainQuote,
  type Quote,
  SwapType,
  prepareFillCrosschainQuote,
} from '@rainbow-me/swaps';

import { REFERRER, type ReferrerType } from '~/core/references';
import { useGasStore } from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import { type NewTransaction } from '~/core/types/transactions';
import { isSameAssetInDiffChains } from '~/core/utils/assets';
import { logTransactionGasError } from '~/core/utils/gas-logging';
import { addNewTransaction } from '~/core/utils/transactions';
import { getProvider } from '~/core/viem/clientToProvider';
import { RainbowError, logger } from '~/logger';

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
  overrideWithFastSpeedIfNeeded,
} from '../utils';
import { requireAddress, requireHex } from '../validation';

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
    const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
    return chainGasUnits.basic.swap;
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
  referrer = REFERRER,
}: {
  gasLimit: string;
  gasParams: TransactionGasParams | TransactionLegacyGasParams;
  nonce?: number;
  quote: CrosschainQuote;
  wallet: Signer;
  referrer?: ReferrerType;
}): Promise<ReplayableExecution | null> => {
  if (!wallet || !quote || quote.swapType !== SwapType.crossChain) return null;

  const preparedCall = await prepareFillCrosschainQuote(quote, referrer);
  const transactionParams = {
    gasLimit: toHex(gasLimit) || undefined,
    nonce: nonce !== undefined ? toHex(String(nonce)) : undefined,
    ...gasParams,
  };
  return extractReplayableExecution(
    await wallet.sendTransaction({
      data: preparedCall.data,
      to: preparedCall.to,
      value: preparedCall.value,
      ...transactionParams,
    }),
    preparedCall,
  );
};

const REFERRER_BX = 'browser-extension';

/**
 * Build a crosschain swap transaction object (without hash) for tracking.
 */
function buildCrosschainSwapTransaction(
  parameters: RapSwapActionParameters<'crosschainSwap'>,
  gasParams: TransactionGasParams | TransactionLegacyGasParams,
  nonce?: number,
  gasLimit?: string,
): Omit<NewTransaction, 'hash'> {
  const { quote, assetToSell, assetToBuy } = parameters;
  const isBridge = isSameAssetInDiffChains(assetToBuy, assetToSell);

  return {
    data: quote.data,
    value: quote.value?.toString(),
    asset: assetToSell,
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
    from: requireAddress(quote.from, 'crosschain quote.from'),
    to: requireAddress(quote.to, 'crosschain quote.to'),
    chainId: assetToSell.chainId,
    nonce: nonce ?? 0,
    gasLimit,
    status: 'pending',
    type: isBridge ? 'bridge' : 'swap',
    ...gasParams,
  };
}

/**
 * Prepare a crosschain swap call for atomic execution.
 * Returns the BatchCall object and transaction metadata without executing.
 */
export const prepareCrosschainSwap = async ({
  parameters,
  quote,
}: PrepareActionProps<'crosschainSwap'>): Promise<{
  call: BatchCall;
  transaction: Omit<NewTransaction, 'hash'>;
}> => {
  if (!isCrosschainQuote(quote)) {
    throw new RainbowError('prepareCrosschainSwap: quote must be crossChain');
  }

  const { selectedGas } = useGasStore.getState();
  const gasParams = parameters.gasParams ?? selectedGas.transactionGasParams;

  const tx = await prepareFillCrosschainQuote(quote, REFERRER_BX);

  return {
    call: {
      to: requireAddress(tx.to, 'crosschain prepared tx.to'),
      value: toHex(BigInt(tx.value?.toString() ?? '0')),
      data: requireHex(tx.data, 'crosschain prepared tx.data'),
    },
    transaction: buildCrosschainSwapTransaction(parameters, gasParams),
  };
};

export const crosschainSwap = async ({
  wallet,
  currentRap,
  index,
  parameters,
  baseNonce,
}: ActionProps<'crosschainSwap'>): Promise<RapActionResult> => {
  const { quote, chainId, requiresApprove } = parameters;
  const { selectedGas, gasFeeParamsBySpeed } = useGasStore.getState();

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
        message: e instanceof Error ? e.message : String(e),
      },
    );
    throw e;
  }
  const nonce = typeof baseNonce === 'number' ? baseNonce + index : undefined;

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
    await logTransactionGasError({
      error: e,
      transactionRequest: gasParams
        ? {
            maxFeePerGas:
              'maxFeePerGas' in gasParams ? gasParams.maxFeePerGas : undefined,
            maxPriorityFeePerGas:
              'maxPriorityFeePerGas' in gasParams
                ? gasParams.maxPriorityFeePerGas
                : undefined,
            gasPrice: 'gasPrice' in gasParams ? gasParams.gasPrice : undefined,
            gasLimit: gasLimit?.toString(),
            chainId,
          }
        : undefined,
      chainId,
    });
    logger.error(
      new RainbowError('crosschainSwap: error executeCrosschainSwap'),
      { message: e instanceof Error ? e.message : String(e) },
    );
    throw e;
  }
  if (!swap)
    throw new RainbowError('crosschainSwap: error executeCrosschainSwap');

  const transaction: NewTransaction = {
    ...buildCrosschainSwapTransaction(
      parameters,
      gasParams,
      swap.nonce,
      gasLimit?.toString(),
    ),
    ...swap.replayableCall,
    hash: requireHex(swap.hash, 'crosschain swap hash'),
  };

  addNewTransaction({
    address: requireAddress(parameters.quote.from, 'crosschain quote.from'),
    chainId: parameters.chainId,
    transaction,
  });

  return {
    nonce: swap.nonce,
    hash: swap.hash,
  };
};

function isCrosschainQuote(
  quote: Quote | CrosschainQuote,
): quote is CrosschainQuote {
  return quote.swapType === SwapType.crossChain;
}
