import type { BatchCall } from '@rainbow-me/delegation';
import {
  CrosschainQuote,
  SwapType,
  fillCrosschainQuote,
  prepareFillCrosschainQuote,
} from '@rainbow-me/swaps';
import { type Address, Hash, WalletClient } from 'viem';

import { REFERRER, type ReferrerType } from '~/core/references';
import { useGasStore } from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { isSameAssetInDiffChains } from '~/core/utils/assets';
import { getErrorMessage } from '~/core/utils/errors';
import { addNewTransaction } from '~/core/utils/transactions';
import { getViemClient } from '~/core/viem/clients';
import { RainbowError, logger } from '~/logger';

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
  isValidGasParams,
  overrideWithFastSpeedIfNeeded,
  toTransactionOptions,
  waitForGasParams,
} from '../utils';

export const prepareCrosschainSwap = async ({
  parameters,
  quote,
  gasParams,
}: {
  parameters: RapSwapActionParameters<'crosschainSwap'>;
  wallet: WalletClient;
  chainId: number;
  quote: CrosschainQuote;
  gasParams?: TransactionGasParams | TransactionLegacyGasParams;
}): Promise<{
  call: BatchCall;
  transaction: Omit<NewTransaction, 'hash'>;
}> => {
  const rawBatchCall = await prepareFillCrosschainQuote(quote, REFERRER);
  const batchCall: BatchCall = {
    to: rawBatchCall.to,
    value: (typeof rawBatchCall.value === 'string'
      ? rawBatchCall.value
      : `0x${BigInt(rawBatchCall.value).toString(16)}`) as `0x${string}`,
    data: rawBatchCall.data as `0x${string}`,
  };

  const { selectedGas } = useGasStore.getState();
  const gas = gasParams ?? selectedGas?.transactionGasParams;
  if (!gas || !isValidGasParams(gas)) {
    throw new RainbowError('prepareCrosschainSwap: gas params required');
  }

  const isBridge = isSameAssetInDiffChains(
    parameters.assetToBuy,
    parameters.assetToSell,
  );

  const transaction: Omit<NewTransaction, 'hash'> = {
    data: quote.data,
    value: quote.value?.toString() ?? '0',
    asset: parameters.assetToSell,
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
    from: quote.from,
    to: quote.to as Address,
    chainId: parameters.assetToSell.chainId,
    nonce: 0,
    status: 'pending',
    type: isBridge ? 'bridge' : 'swap',
    ...('gasPrice' in gas
      ? { gasPrice: gas.gasPrice.toString() }
      : {
          maxFeePerGas: gas.maxFeePerGas.toString(),
          maxPriorityFeePerGas: gas.maxPriorityFeePerGas.toString(),
        }),
  };

  return { call: batchCall, transaction };
};

const getCrosschainSwapDefaultGasLimit = (
  quote: CrosschainQuote,
): bigint | undefined => {
  const limit = quote?.routes?.[0]?.userTxs?.[0]?.gasFees?.gasLimit;
  return limit ? BigInt(limit) : undefined;
};

export const estimateCrosschainSwapGasLimit = async ({
  chainId,
  requiresApprove,
  quote,
}: {
  chainId: ChainId;
  requiresApprove?: boolean;
  quote: CrosschainQuote;
}): Promise<bigint> => {
  const client = getViemClient({ chainId });
  if (!quote) {
    const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
    return BigInt(chainGasUnits.basic.swap);
  }
  try {
    if (requiresApprove) {
      if (CHAIN_IDS_WITH_TRACE_SUPPORT.includes(chainId)) {
        try {
          const gasLimitWithFakeApproval =
            await estimateSwapGasLimitWithFakeApproval(chainId, client, quote);
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
        value: quote.value != null ? BigInt(quote.value) : undefined,
      },
      client,
      paddingFactor: SWAP_GAS_PADDING,
    });

    return (
      gasLimit ??
      getCrosschainSwapDefaultGasLimit(quote) ??
      getDefaultGasLimitForTrade(quote, chainId)
    );
  } catch (error) {
    return (
      getCrosschainSwapDefaultGasLimit(quote) ??
      getDefaultGasLimitForTrade(quote, chainId)
    );
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
  gasLimit: bigint;
  gasParams: TransactionGasParams | TransactionLegacyGasParams;
  nonce?: number;
  quote: CrosschainQuote;
  wallet: WalletClient;
  referrer?: ReferrerType;
}): Promise<Hash | null> => {
  if (!wallet || !quote || quote.swapType !== SwapType.crossChain) return null;

  const txOptions = toTransactionOptions({ gasLimit, gasParams, nonce });
  return fillCrosschainQuote(quote, txOptions, wallet, referrer);
};

export const crosschainSwap = async ({
  client,
  wallet,
  currentRap,
  index,
  parameters,
  baseNonce,
}: ActionProps<'crosschainSwap'>): Promise<RapActionResult> => {
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
    gasLimit = await estimateCrosschainSwapGasLimit({
      chainId,
      requiresApprove,
      quote,
    });
  } catch (e) {
    logger.error(
      new RainbowError('crosschainSwap: error estimateCrosschainSwapGasLimit'),
      {
        message: getErrorMessage(e),
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

  let txHash: Hash | null;
  try {
    txHash = await executeCrosschainSwap(swapParams);
  } catch (e) {
    logger.error(
      new RainbowError('crosschainSwap: error executeCrosschainSwap'),
      { message: getErrorMessage(e) },
    );
    throw e;
  }
  if (!txHash)
    throw new RainbowError('crosschainSwap: error executeCrosschainSwap');

  const tx = await client.getTransaction({ hash: txHash });

  const isBridge = isSameAssetInDiffChains(
    parameters.assetToBuy,
    parameters.assetToSell,
  );

  const transaction = {
    data: parameters.quote.data,
    value: parameters.quote.value?.toString(),
    asset: parameters.assetToSell,
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
    from: parameters.quote.from,
    to: parameters.quote.to,
    hash: txHash as TxHash,
    chainId: parameters.assetToSell.chainId,
    nonce: tx.nonce,
    status: 'pending',
    type: isBridge ? 'bridge' : 'swap',
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
