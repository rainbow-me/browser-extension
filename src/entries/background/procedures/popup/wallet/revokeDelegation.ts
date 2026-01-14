import { ORPCError } from '@orpc/client';
import {
  type TransactionGasOptions,
  executeRevokeDelegation as sdkExecuteRevokeDelegation,
} from '@rainbow-me/delegation';
import { Hex } from 'viem';

import { ChainId } from '~/core/types/chains';
import { toHex } from '~/core/utils/hex';
import { getNextNonce } from '~/core/utils/transactions';
import { getViemClient } from '~/core/viem/clients';
import {
  canUseDelegation,
  getViemWalletClient,
} from '~/core/viem/walletClient';
import { RainbowError, logger } from '~/logger';

import { walletOs } from '../os';

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
        chainId: chainId as ChainId,
      });

      if (!walletClient) {
        return {
          error: 'Failed to get wallet client',
        };
      }

      // Get public client for the chain
      const publicClient = getViemClient({ chainId: chainId as ChainId });

      // Convert hex strings to BigInt for SDK
      // Hex strings come in as "0x..." format, BigInt can parse them directly
      const transactionOptionsForSdk: TransactionGasOptions = {
        maxFeePerGas: BigInt(transactionOptions.maxFeePerGas as Hex),
        maxPriorityFeePerGas: BigInt(
          transactionOptions.maxPriorityFeePerGas as Hex,
        ),
        gasLimit: BigInt(transactionOptions.gasLimit as Hex),
      };

      // Get nonce for the transaction
      const nonce = await getNextNonce({
        address: userAddress,
        chainId: chainId as ChainId,
      });

      // Execute revoke delegation via SDK
      const result = await sdkExecuteRevokeDelegation({
        walletClient,
        publicClient,
        chainId: chainId as ChainId,
        nonce,
        transactionOptions: transactionOptionsForSdk,
      }).catch((e) => {
        throw new ORPCError('REVOKE_DELEGATION_FAILED', {
          message: 'Revoking delegation failed',
          cause: e,
        });
      });

      return {
        txHash: result.hash ? toHex(result.hash) : undefined,
        error: null,
      };
    } catch (e) {
      logger.error(new RainbowError('Failed to revoke delegation'), {
        message: e instanceof Error ? e.message : (e as string),
      });
      const errorMessage =
        e instanceof ORPCError
          ? e.message
          : (e as Error).message || 'Unknown error revoking delegation';
      return {
        error: errorMessage,
      };
    }
  },
);
