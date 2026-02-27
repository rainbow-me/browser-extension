import {
  type TransactionGasOptions,
  executeRevokeDelegation as sdkExecuteRevokeDelegation,
} from '@rainbow-me/delegation';
import { BaseError, IntrinsicGasTooLowError } from 'viem';

import { getNextNonce } from '~/core/utils/transactions';
import { getViemClient } from '~/core/viem/clients';
import {
  canUseDelegation,
  getViemWalletClient,
} from '~/core/viem/walletClient';
import { RainbowError, logger } from '~/logger';

import { walletOs } from '../os';

const REVOKE_ESTIMATE_FALLBACK_GAS_LIMIT = 96_000n;

export const revokeDelegationHandler = walletOs.revokeDelegation.handler(
  async ({ input: { chainId, userAddress, transactionOptions } }) => {
    try {
      // Check if wallet can use delegation
      const canUse = await canUseDelegation(userAddress);
      if (!canUse) {
        return {
          error: 'Hardware wallets cannot revoke delegation',
        };
      }

      // Get wallet client for signing
      const walletClient = await getViemWalletClient({
        address: userAddress,
        chainId,
      });

      if (!walletClient) {
        return {
          error: 'Failed to get wallet client',
        };
      }

      // Get public client for the chain
      const publicClient = getViemClient({ chainId });

      // Convert hex strings to BigInt for SDK
      // Hex strings come in as "0x..." format, BigInt can parse them directly
      const transactionOptionsForSdk: TransactionGasOptions = {
        maxFeePerGas: BigInt(transactionOptions.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(transactionOptions.maxPriorityFeePerGas),
        gasLimit:
          transactionOptions.gasLimit === null
            ? null
            : BigInt(transactionOptions.gasLimit),
      };

      // Get nonce for the transaction
      const nonce = await getNextNonce({
        address: userAddress,
        chainId,
      });

      // Execute revoke delegation via SDK
      let result;
      try {
        result = await sdkExecuteRevokeDelegation({
          walletClient,
          publicClient,
          chainId,
          nonce,
          transactionOptions: transactionOptionsForSdk,
        });
      } catch (error) {
        if (!isIntrinsicEstimateGasFailure(error)) throw error;

        logger.warn(
          'Revoke gas estimate failed, retrying with fallback gas limit',
          {
            chainId,
            gasLimit: REVOKE_ESTIMATE_FALLBACK_GAS_LIMIT.toString(),
          },
        );

        result = await sdkExecuteRevokeDelegation({
          walletClient,
          publicClient,
          chainId,
          nonce,
          transactionOptions: {
            ...transactionOptionsForSdk,
            gasLimit: REVOKE_ESTIMATE_FALLBACK_GAS_LIMIT,
          },
        });
      }

      return {
        txHash: result.hash ?? undefined,
        nonce,
        error: null,
      };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      logger.error(new RainbowError('Failed to revoke delegation'), {
        message: errorMessage,
      });
      return {
        error: errorMessage || 'Unknown error revoking delegation',
      };
    }
  },
);

function isIntrinsicEstimateGasFailure(error: unknown): boolean {
  if (!(error instanceof BaseError)) return false;
  return (
    error.walk((cause) => cause instanceof IntrinsicGasTooLowError) !== null
  );
}
