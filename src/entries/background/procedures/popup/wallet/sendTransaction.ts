import { Address, Hex } from 'viem';

import { sendTransaction } from '~/core/keychain';
import { toHex, toHexOrUndefined } from '~/core/utils/hex';
import { getProvider } from '~/core/wagmi/clientToProvider';

import { popupOs } from '../os';

export const sendTransactionHandler = popupOs.wallet.sendTransaction.handler(
  async ({ input: transactionRequest }) => {
    const provider = getProvider({
      chainId: transactionRequest.chainId,
    });
    const response = await sendTransaction(transactionRequest, provider);
    console.log(response);
    // Transform BigNumber properties to strings to match schema
    return {
      hash: toHex(response.hash),
      to: response.to as Address | undefined,
      from: response.from as Address,
      nonce: response.nonce,
      gasLimit: toHex(response.gasLimit),
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
