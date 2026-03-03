import { ORPCError } from '@orpc/client';
import { Address, Hex } from 'viem';

import { sendTransaction } from '~/core/keychain';
import { TransactionRequest } from '~/core/types/transactions';

import { walletOs } from '../os';

const hexToBigInt = (v: Hex | undefined): bigint | undefined =>
  v != null ? BigInt(v) : undefined;

export const sendTransactionHandler = walletOs.sendTransaction.handler(
  async ({ input }) => {
    const transactionRequest: TransactionRequest = {
      to: input.to as Address | undefined,
      from: input.from,
      nonce: input.nonce,
      gasLimit: hexToBigInt(input.gasLimit),
      gasPrice: hexToBigInt(input.gasPrice),
      maxFeePerGas: hexToBigInt(input.maxFeePerGas),
      maxPriorityFeePerGas: hexToBigInt(input.maxPriorityFeePerGas),
      data: input.data,
      value: hexToBigInt(input.value),
      chainId: input.chainId,
      type: input.type,
    };
    return sendTransaction(transactionRequest).catch((e) => {
      throw new ORPCError('SEND_TRANSACTION_FAILED', {
        message: 'Sending the transaction failed',
        cause: e,
      });
    });
  },
);
