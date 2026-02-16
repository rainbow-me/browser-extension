import { TransactionResponse } from '@ethersproject/abstract-provider';
import { TransactionRequest } from '@ethersproject/providers';
import {
  Address,
  Hex,
  TransactionSerializableEIP1559,
  TransactionSerializableLegacy,
} from 'viem';
import {
  AppNotOpenError,
  DeviceLockedError,
  DeviceNotFoundError,
  UserRejectedError,
} from 'viem-hw';
import { createLedgerAccount } from 'viem-hw/ledger';

import { i18n } from '~/core/languages';
import {
  SigningMessage,
  isPersonalSignMessage,
  isTypedDataMessage,
} from '~/core/types/messageSigning';
import { getProvider } from '~/core/viem/clientToProvider';

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

export async function signTransactionFromLedger(
  transaction: TransactionRequest,
): Promise<Hex> {
  try {
    const { from: address } = transaction;
    const path = await getPath(address as Address);

    const account = await createLedgerAccount({ path });

    const viemTx = toViemTransaction(transaction);
    // signTransaction returns the serialized signed transaction
    return account.signTransaction(viemTx);
  } catch (e) {
    handleLedgerError(e as Error);
    throw e;
  }
}

export async function sendTransactionFromLedger(
  transaction: TransactionRequest,
): Promise<TransactionResponse> {
  const serializedTransaction = await signTransactionFromLedger(transaction);
  const provider = getProvider({
    chainId: transaction.chainId,
  });

  return provider.sendTransaction(serializedTransaction);
}

export async function signMessageByTypeFromLedger(
  message: SigningMessage,
  address: Address,
): Promise<Hex> {
  try {
    const path = await getPath(address);
    const account = await createLedgerAccount({ path });

    if (isPersonalSignMessage(message)) {
      return account.signMessage({ message: message.message });
    } else if (isTypedDataMessage(message)) {
      return account.signTypedData(message.data);
    } else {
      throw new Error('Unsupported message type');
    }
  } catch (e) {
    handleLedgerError(e as Error);
    throw e;
  }
}

function handleLedgerError(e: Error) {
  if (e instanceof DeviceLockedError) {
    alert(i18n.t('hw.ledger_locked_error'));
  } else if (e instanceof DeviceNotFoundError) {
    alert(i18n.t('hw.check_ledger_disconnected'));
  } else if (e instanceof AppNotOpenError) {
    alert(i18n.t('hw.open_ethereum_app'));
  } else if (e instanceof UserRejectedError) {
    // User rejected - don't show alert, let caller handle
  } else if (e?.message) {
    alert(e.message);
  }
}

export const showLedgerDisconnectedAlertIfNeeded = (e: Error) => {
  if (e instanceof DeviceNotFoundError) {
    alert(i18n.t('hw.check_ledger_disconnected'));
  }
};

export const isLedgerConnectionError = (e: Error) => {
  return (
    e instanceof DeviceNotFoundError ||
    e instanceof DeviceLockedError ||
    e instanceof AppNotOpenError
  );
};
