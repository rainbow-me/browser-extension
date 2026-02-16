import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import {
  Address,
  Hex,
  TransactionSerializableEIP1559,
  TransactionSerializableLegacy,
} from 'viem';
import {
  DeviceLockedError,
  DeviceNotFoundError,
  UserRejectedError,
} from 'viem-hw';
import { createTrezorAccount } from 'viem-hw/trezor';

import {
  SigningMessage,
  isPersonalSignMessage,
  isTypedDataMessage,
} from '~/core/types/messageSigning';
import { getProvider } from '~/core/viem/clientToProvider';
import { RainbowError, logger } from '~/logger';

import { popupClient } from './background';

const getPath = async (address: Address): Promise<`m/${string}`> => {
  const path = await popupClient.wallet.path(address);
  return path as `m/${string}`;
};

/**
 * Convert ethers TransactionRequest to viem TransactionSerializable
 */
function toViemTransaction(
  tx: TransactionRequest,
): TransactionSerializableLegacy | TransactionSerializableEIP1559 {
  const base = {
    chainId: tx.chainId ? Number(tx.chainId) : 1,
    data: tx.data as Hex | undefined,
    gas: tx.gasLimit ? BigInt(tx.gasLimit.toString()) : undefined,
    nonce: tx.nonce ? Number(tx.nonce) : undefined,
    to: tx.to as Address | undefined,
    value: tx.value ? BigInt(tx.value.toString()) : 0n,
  };

  if (tx.gasPrice) {
    return {
      ...base,
      type: 'legacy',
      gasPrice: BigInt(tx.gasPrice.toString()),
    };
  } else {
    return {
      ...base,
      type: 'eip1559',
      maxFeePerGas: tx.maxFeePerGas
        ? BigInt(tx.maxFeePerGas.toString())
        : undefined,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas
        ? BigInt(tx.maxPriorityFeePerGas.toString())
        : undefined,
    };
  }
}

export async function signTransactionFromTrezor(
  transaction: TransactionRequest,
): Promise<Hex> {
  try {
    const { from: address } = transaction;
    const path = await getPath(address as Address);

    const account = await createTrezorAccount({
      path,
      email: 'rainbow@rainbow.me',
      appUrl: 'https://rainbow.me',
    });

    const viemTx = toViemTransaction(transaction);
    // signTransaction returns the serialized signed transaction
    return account.signTransaction(viemTx);
  } catch (e) {
    handleTrezorError(e as Error);
    throw e;
  }
}

export async function sendTransactionFromTrezor(
  transaction: TransactionRequest,
): Promise<TransactionResponse> {
  const serializedTransaction = await signTransactionFromTrezor(transaction);
  const provider = getProvider({
    chainId: transaction.chainId,
  });
  return provider.sendTransaction(serializedTransaction);
}

export async function signMessageByTypeFromTrezor(
  message: SigningMessage,
  address: Address,
): Promise<Hex> {
  try {
    const path = await getPath(address);
    const account = await createTrezorAccount({
      path,
      email: 'rainbow@rainbow.me',
      appUrl: 'https://rainbow.me',
    });

    if (isPersonalSignMessage(message)) {
      return account.signMessage({ message: message.message });
    } else if (isTypedDataMessage(message)) {
      return account.signTypedData(message.data);
    } else {
      throw new Error('Unsupported message type');
    }
  } catch (e) {
    handleTrezorError(e as Error);
    throw e;
  }
}

function handleTrezorError(e: Error) {
  if (e instanceof DeviceLockedError) {
    logger.error(new RainbowError('trezor error', { cause: e }));
    alert('Please make sure your trezor is unlocked');
  } else if (e instanceof DeviceNotFoundError) {
    logger.error(new RainbowError('trezor error', { cause: e }));
    alert('Trezor device not found');
  } else if (e instanceof UserRejectedError) {
    // User rejected - don't show alert
  } else {
    logger.error(new RainbowError('trezor error', { cause: e }));
    alert('Error signing with Trezor');
  }
}
