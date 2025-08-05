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

    // Transform BigNumber properties to strings to match schema
    return {
      hash: toHex(response.hash),
      to: toHexOrUndefined(response.to),
      from: toHex(response.from),
      nonce: response.nonce,
      gasLimit: toHex(response.gasLimit),
      gasPrice: toHexOrUndefined(response.gasPrice),
      maxFeePerGas: toHexOrUndefined(response.maxFeePerGas),
      maxPriorityFeePerGas: toHexOrUndefined(response.maxPriorityFeePerGas),
      data: toHex(response.data),
      value: toHex(response.value),
      chainId: response.chainId,
      confirmations: response.confirmations,
    };
  },
);
