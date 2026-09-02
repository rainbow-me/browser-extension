import { Provider, TransactionRequest } from '@ethersproject/abstract-provider';
import BigNumber from 'bignumber.js';

import { useGasStore } from '~/core/state/gas';
import { getProvider } from '~/core/wagmi/clientToProvider';
import { RainbowError, logger } from '~/logger';

import { ChainId } from '../types/chains';
import {
  GasFeeLegacyParams,
  GasFeeParams,
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '../types/gas';

import { add } from './numbers';

/**
 * Detects if an error is gas-related by checking error message for gas-related keywords
 */
const isGasRelatedError = (error: Error | unknown): boolean => {
  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();
  const gasKeywords = [
    'gas',
    'fee',
    'base fee',
    'max fee',
    'priority fee',
    'gas price',
    'gas limit',
    'intrinsic gas',
    'transaction rejected',
    'replacement transaction underpriced',
  ];
  return gasKeywords.some((keyword) => errorMessage.includes(keyword));
};

/**
 * Logs comprehensive gas information when a transaction fails, especially for gas-related errors.
 * Reports backend estimates and onchain values for debugging.
 */
export const logTransactionGasError = async ({
  error,
  transactionRequest,
  chainId,
  provider: providedProvider,
  selectedGas: providedSelectedGas,
}: {
  error: Error | unknown;
  transactionRequest?: TransactionRequest;
  chainId: ChainId;
  provider?: Provider;
  selectedGas?: GasFeeParams | GasFeeLegacyParams;
}): Promise<void> => {
  const isGasError = isGasRelatedError(error);
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Always log gas details for gas-related errors, or if transaction request has gas params
  if (
    isGasError ||
    transactionRequest?.maxFeePerGas ||
    transactionRequest?.gasPrice
  ) {
    try {
      // Get provider if not provided
      const provider = providedProvider || getProvider({ chainId });

      // Get selectedGas from store if not provided
      const selectedGas =
        providedSelectedGas || useGasStore.getState().selectedGas;

      // Get onchain base fee
      let onchainBaseFee: string | null = null;
      try {
        const latestBlock = await provider.getBlock('latest');
        onchainBaseFee = latestBlock?.baseFeePerGas?.toString() || null;
      } catch (e) {
        // Ignore errors fetching block
      }

      // Extract backend gas estimates
      const backendMaxBaseFee =
        selectedGas && 'maxBaseFee' in selectedGas
          ? selectedGas.maxBaseFee.amount
          : undefined;
      const backendMaxFeePerGas =
        selectedGas && 'transactionGasParams' in selectedGas
          ? (selectedGas.transactionGasParams as TransactionGasParams)
              .maxFeePerGas
          : undefined;
      const backendMaxPriorityFeePerGas =
        selectedGas && 'transactionGasParams' in selectedGas
          ? (selectedGas.transactionGasParams as TransactionGasParams)
              .maxPriorityFeePerGas
          : undefined;
      const backendGasPrice =
        selectedGas && 'transactionGasParams' in selectedGas
          ? (selectedGas.transactionGasParams as TransactionLegacyGasParams)
              .gasPrice
          : undefined;

      // Extract transaction gas params that were sent
      const sentMaxFeePerGas = transactionRequest?.maxFeePerGas?.toString();
      const sentMaxPriorityFeePerGas =
        transactionRequest?.maxPriorityFeePerGas?.toString();
      const sentGasPrice = transactionRequest?.gasPrice?.toString();
      const sentGasLimit = transactionRequest?.gasLimit?.toString();

      logger.error(
        new RainbowError(
          isGasError
            ? 'Transaction failed: Gas-related error detected'
            : 'Transaction failed: Error details',
        ),
        {
          errorMessage,
          chainId,
          isGasRelatedError: isGasError,
          // Backend estimates (from meteorology/selectedGas)
          backendEstimates: {
            maxBaseFee: backendMaxBaseFee,
            maxFeePerGas: backendMaxFeePerGas,
            maxPriorityFeePerGas: backendMaxPriorityFeePerGas,
            gasPrice: backendGasPrice,
          },
          // Onchain values (current block)
          onchainValues: {
            baseFeePerGas: onchainBaseFee,
          },
          // What was actually sent
          sentGasParams: {
            maxFeePerGas: sentMaxFeePerGas,
            maxPriorityFeePerGas: sentMaxPriorityFeePerGas,
            gasPrice: sentGasPrice,
            gasLimit: sentGasLimit,
          },
          // Expected minimum (for EIP-1559)
          expectedMinimum:
            onchainBaseFee && sentMaxPriorityFeePerGas
              ? {
                  minMaxFeePerGas: add(
                    onchainBaseFee,
                    sentMaxPriorityFeePerGas.startsWith('0x')
                      ? new BigNumber(sentMaxPriorityFeePerGas).toString()
                      : sentMaxPriorityFeePerGas,
                  ),
                  onchainBaseFee,
                  maxPriorityFeePerGas: sentMaxPriorityFeePerGas,
                }
              : undefined,
        },
      );
    } catch (loggingError) {
      // If logging itself fails, at least log the original error
      logger.error(
        new RainbowError('Failed to log transaction gas error details'),
        {
          originalError: errorMessage,
          loggingError: (loggingError as Error)?.message,
        },
      );
    }
  }
};
