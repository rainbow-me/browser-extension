import { ORPCError } from '@orpc/client';
import { Address, Hex } from 'viem';

import { sendTransaction } from '~/core/keychain';
import { toHex, toHexOrUndefined } from '~/core/utils/hex';
import { getProvider } from '~/core/viem/clientToProvider';

import { walletOs } from '../os';

export const sendTransactionHandler = walletOs.sendTransaction.handler(
  async ({ input: transactionRequest }) => {
    const provider = getProvider({
      chainId: transactionRequest.chainId,
    });
    const response = await sendTransaction(transactionRequest, provider).catch(
      (e) => {
        throw new ORPCError('SEND_TRANSACTION_FAILED', {
          message: 'Sending the transaction failed',
          cause: e,
        });
      },
    );

    // Transform BigNumber properties to strings to match schema
    return {
      hash: response.hash as `0x${string}`,
      to: response.to as Address | undefined,
      from: response.from as Address,
      nonce: response.nonce,
      gasLimit: toHexOrUndefined(response.gasLimit),
      gasPrice: toHexOrUndefined(response.gasPrice),
      maxFeePerGas: toHexOrUndefined(response.maxFeePerGas),
      maxPriorityFeePerGas: toHexOrUndefined(response.maxPriorityFeePerGas),
      data: response.data as Hex,
      value: toHex(response.value),
      chainId: response.chainId,
      confirmations: response.confirmations,
    };
  },
);
