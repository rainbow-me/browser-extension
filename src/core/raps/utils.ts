import { Chain, chain } from 'wagmi';

import {
  GasFeeLegacyParams,
  GasFeeLegacyParamsBySpeed,
  GasFeeParams,
  GasFeeParamsBySpeed,
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '../types/gas';
import { greaterThan } from '../utils/numbers';

/**
 * If gas price is not defined, override with fast speed
 */
export const overrideWithFastSpeedIfNeeded = ({
  selectedGas,
  chainId,
  gasFeeParamsBySpeed,
}: {
  selectedGas: GasFeeParams | GasFeeLegacyParams;
  chainId: Chain['id'];
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed;
}) => {
  const gasParams = selectedGas.transactionGasParams;
  // approvals should always use fast gas or custom (whatever is faster)
  if (chainId === chain.mainnet.id) {
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
  } else if (chainId === chain.polygon.id) {
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
