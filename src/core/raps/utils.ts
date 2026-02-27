import { Provider } from '@ethersproject/abstract-provider';
import { PopulatedTransaction } from '@ethersproject/contracts';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import {
  CrosschainQuote,
  Quote,
  getQuoteExecutionDetails,
  getTargetAddress,
} from '@rainbow-me/swaps';

import { useNetworkStore } from '~/core/state/networks/networks';

import { ChainId } from '../types/chains';
import {
  GasFeeLegacyParams,
  GasFeeLegacyParamsBySpeed,
  GasFeeParams,
  GasFeeParamsBySpeed,
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '../types/gas';
import { greaterThan, multiply } from '../utils/numbers';

import { requireAddress } from './validation';
export const SWAP_GAS_PADDING = 1.1;

const EXTRA_GAS_PADDING = 1.5;

/**
 * If gas price is not defined, override with fast speed
 */
export const overrideWithFastSpeedIfNeeded = ({
  selectedGas,
  chainId,
  gasFeeParamsBySpeed,
}: {
  selectedGas: GasFeeParams | GasFeeLegacyParams;
  chainId: ChainId;
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed;
}) => {
  const gasParams = selectedGas.transactionGasParams ?? {};
  // approvals should always use fast gas or custom (whatever is faster)
  if (chainId === ChainId.mainnet) {
    const transactionGasParams = gasParams as TransactionGasParams;
    if (
      !transactionGasParams.maxFeePerGas ||
      !transactionGasParams.maxPriorityFeePerGas
    ) {
      const fastTransactionGasParams = gasFeeParamsBySpeed?.fast
        ?.transactionGasParams as TransactionGasParams;

      if (
        greaterThan(
          fastTransactionGasParams.maxFeePerGas,
          transactionGasParams?.maxFeePerGas || 0,
        )
      ) {
        (gasParams as TransactionGasParams).maxFeePerGas =
          fastTransactionGasParams.maxFeePerGas;
      }
      if (
        greaterThan(
          fastTransactionGasParams.maxPriorityFeePerGas,
          transactionGasParams?.maxPriorityFeePerGas || 0,
        )
      ) {
        (gasParams as TransactionGasParams).maxPriorityFeePerGas =
          fastTransactionGasParams.maxPriorityFeePerGas;
      }
    }
  } else if (chainId === ChainId.polygon) {
    const transactionGasParams = gasParams as TransactionLegacyGasParams;
    if (!transactionGasParams.gasPrice) {
      const fastGasPrice = (
        gasFeeParamsBySpeed?.fast
          ?.transactionGasParams as TransactionLegacyGasParams
      ).gasPrice;

      if (greaterThan(fastGasPrice, transactionGasParams?.gasPrice || 0)) {
        (gasParams as TransactionLegacyGasParams).gasPrice = fastGasPrice;
      }
    }
  }
  return gasParams;
};

export const getDefaultGasLimitForTrade = (
  quote: Quote | CrosschainQuote,
  chainId: ChainId,
): string => {
  const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
  return (
    quote?.defaultGasLimit ||
    multiply(chainGasUnits.basic.swap, EXTRA_GAS_PADDING)
  );
};

export const populateSwap = async ({
  provider,
  quote,
}: {
  provider: Provider;
  quote: Quote | CrosschainQuote;
}): Promise<PopulatedTransaction | null> => {
  try {
    const { router, methodName, params, methodArgs } = getQuoteExecutionDetails(
      quote,
      { from: quote.from },
      provider as StaticJsonRpcProvider,
    );
    const swapTransaction = await router.populateTransaction[methodName](
      ...(methodArgs ?? []),
      params,
    );
    return swapTransaction;
  } catch (e) {
    return null;
  }
};

export const getTargetAddressForQuote = (quote: Quote | CrosschainQuote) => {
  const targetAddress = getTargetAddress(quote);
  if (!targetAddress) {
    throw new Error('Target address not found for quote');
  }
  return requireAddress(targetAddress, 'quote target address');
};
