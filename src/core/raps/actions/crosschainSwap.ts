import { Signer } from '@ethersproject/abstract-signer';
import {
  CrosschainQuote,
  SwapType,
  fillCrosschainQuote,
} from '@rainbow-me/swaps';
import { Address } from 'viem';

import { REFERRER, ReferrerType } from '~/core/references';
import { useGasStore } from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { isSameAssetInDiffChains } from '~/core/utils/assets';
import { addNewTransaction } from '~/core/utils/transactions';
import { getProvider } from '~/core/wagmi/clientToProvider';
import { RainbowError, logger } from '~/logger';

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
}) => {
  if (!wallet || !quote || quote.swapType !== SwapType.crossChain) return null;

  const transactionParams = {
    gasLimit: toHex(gasLimit) || undefined,
    nonce: nonce ? toHex(String(nonce)) : undefined,
    ...gasParams,
  };
  return fillCrosschainQuote(quote, transactionParams, wallet, referrer);
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
      { message: (e as Error)?.message },
    );
    throw e;
  }
  if (!swap)
    throw new RainbowError('crosschainSwap: error executeCrosschainSwap');

  const isBridge = isSameAssetInDiffChains(
    parameters.assetToBuy,
    parameters.assetToSell,
  );

  const transaction = {
    data: parameters.quote.data,
    value: parameters.quote.value?.toString(),
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
    from: parameters.quote.from as Address,
    to: parameters.quote.to as Address,
    hash: swap.hash as TxHash,
    chainId: parameters.chainId,
    nonce: swap.nonce,
    status: 'pending',
    type: isBridge ? 'bridge' : 'swap',
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
