import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
// Keep ethers imports for transaction signing - hardware wallets require ethers transaction format
import { TransactionRequest } from '@ethersproject/providers';
import {
  UnsignedTransaction,
  parse,
  serialize,
} from '@ethersproject/transactions';
import AppEth, { ledgerService } from '@ledgerhq/hw-app-eth';
import type Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import {
  Address,
  ByteArray,
  Hex,
  bytesToHex,
  hashDomain,
  hashStruct,
  hexToBytes,
  stringToBytes,
} from 'viem';

import { i18n } from '~/core/languages';
import {
  SigningMessage,
  isPersonalSignMessage,
  isTypedDataMessage,
} from '~/core/types/messageSigning';
import { sanitizeTypedData } from '~/core/utils/ethereum';
import { getProvider } from '~/core/viem/clientToProvider';
import { logger } from '~/logger';

import { popupClient } from './background';

const getPath = async (address: Address) => {
  return await popupClient.wallet.path(address);
};

export async function signTransactionFromLedger(
  transaction: TransactionRequest,
): Promise<Hex> {
  let transport;
  try {
    const { from: address } = transaction;
    try {
      transport = await TransportWebHID.openConnected();
      if (transport === null) {
        transport = await TransportWebHID.create();
      }
    } catch (e) {
      transport = await TransportWebHID.create();
    }
    const appEth = new AppEth(transport as Transport);

    const path = await getPath(address as Address);

    const baseTx: UnsignedTransaction = {
      chainId: transaction.chainId || undefined,
      data: transaction.data || undefined,
      gasLimit: transaction.gasLimit
        ? BigNumber.from(transaction.gasLimit).toHexString()
        : undefined,
      nonce: transaction.nonce
        ? BigNumber.from(transaction.nonce).toNumber()
        : undefined,
      to: transaction.to || undefined,
      value: transaction.value
        ? BigNumber.from(transaction.value).toHexString()
        : undefined,
    };

    if (transaction.gasPrice) {
      baseTx.gasPrice = transaction.gasPrice;
    } else if (transaction.maxFeePerGas || transaction.maxPriorityFeePerGas) {
      // eip-1559
      baseTx.maxFeePerGas = transaction.maxFeePerGas || undefined;
      baseTx.maxPriorityFeePerGas =
        transaction.maxPriorityFeePerGas || undefined;
      baseTx.type = 2;
    } else {
      baseTx.gasPrice = transaction.maxFeePerGas || undefined;
    }

    const unsignedTx = serialize(baseTx).substring(2);

    const resolution = await ledgerService.resolveTransaction(
      unsignedTx,
      appEth.loadConfig,
      {
        erc20: true,
        externalPlugins: true,
        nft: true,
      },
    );

    const sig = await appEth.signTransaction(path, unsignedTx, resolution);

    const serializedTransaction = serialize(baseTx, {
      r: '0x' + sig.r,
      s: '0x' + sig.s,
      v: BigNumber.from('0x' + sig.v).toNumber(),
    }) as Hex;

    const parsedTx = parse(serializedTransaction);

    if (parsedTx.from?.toLowerCase() !== address?.toLowerCase()) {
      throw new Error('Transaction was not signed by the right address');
    }

    await (transport as TransportWebHID)?.close();
    return serializedTransaction;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e?.name === 'TransportStatusError' || e?.name === 'LockedDeviceError') {
      alert(i18n.t('hw.ledger_locked_error'));
    } else if (
      e?.name === 'TransportOpenUserCancelled' &&
      e?.message === 'Access denied to use Ledger device'
    ) {
      alert(i18n.t('hw.check_ledger_disconnected'));
    } else if (e?.message) {
      alert(e.message);
    }
    await (transport as TransportWebHID)?.close();
    // bubble up the error
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
  let transport;
  try {
    transport = await TransportWebHID.openConnected();
    if (transport === null) {
      transport = await TransportWebHID.create();
    }
  } catch (e) {
    transport = await TransportWebHID.create();
  }
  const appEth = new AppEth(transport as Transport);
  const path = await getPath(address);

  // Personal sign
  if (isPersonalSignMessage(message)) {
    let messageBytes: ByteArray;
    try {
      messageBytes = stringToBytes(message.message);
    } catch (e) {
      logger.info('the message is not a utf8 string, will sign as hex');
      // If stringToBytes fails, treat as hex string and convert to bytes
      const hexMessage = message.message.startsWith('0x')
        ? (message.message as Hex)
        : (`0x${message.message}` as Hex);
      messageBytes = hexToBytes(hexMessage);
    }

    const messageHex = bytesToHex(messageBytes).slice(2);

    const sig = await appEth.signPersonalMessage(path, messageHex);
    sig.r = '0x' + sig.r;
    sig.s = '0x' + sig.s;
    await (transport as TransportWebHID)?.close();
    // Format signature from r, s, v components (viem doesn't have joinSignature equivalent)
    // sig.v from Ledger API can be string or number - handle both cases
    const vValue: string | number = sig.v as string | number;
    const vHex =
      typeof vValue === 'string'
        ? vValue.startsWith('0x')
          ? vValue.slice(2)
          : vValue
        : vValue.toString(16);
    return `0x${sig.r.slice(2)}${sig.s.slice(2)}${vHex.padStart(
      2,
      '0',
    )}` as Hex;
  }
  // sign typed data
  else if (isTypedDataMessage(message)) {
    // message.data is already TypedDataDefinition, no need for type assertion
    const typedData = message.data;

    // Type guard to ensure we have the required fields for v3/v4
    if (
      typeof typedData !== 'object' ||
      typedData === null ||
      !(
        'types' in typedData &&
        'primaryType' in typedData &&
        'domain' in typedData
      )
    ) {
      await (transport as TransportWebHID)?.close();
      throw new Error('unsupported typed data version');
    }

    const sanitizedData = sanitizeTypedData(typedData);
    const { domain, types, primaryType, message: messageData } = sanitizedData;

    // Use viem's hashDomain and hashStruct utilities
    // These return Hex strings (0x-prefixed), so we remove the prefix for Ledger
    // sanitizedData.message is guaranteed to exist after sanitization
    // Type assertions needed because viem's types are strict, but sanitizedData is compatible
    const messagePayload = messageData || {};
    const domainSeparatorHex = hashDomain({
      domain: domain as never,
      types: types as never,
    } as Parameters<typeof hashDomain>[0]).slice(2);
    const hashStructMessageHex = hashStruct({
      data: messagePayload as never,
      primaryType,
      types: types as never,
    } as Parameters<typeof hashStruct>[0]).slice(2);

    const sig = await appEth.signEIP712HashedMessage(
      path,
      domainSeparatorHex,
      hashStructMessageHex,
    );
    sig.r = '0x' + sig.r;
    sig.s = '0x' + sig.s;
    await (transport as TransportWebHID)?.close();
    // Format signature from r, s, v components (viem doesn't have joinSignature equivalent)
    // sig.v from Ledger API can be string or number - handle both cases
    const vValue: string | number = sig.v as string | number;
    const vHex =
      typeof vValue === 'string'
        ? vValue.startsWith('0x')
          ? vValue.slice(2)
          : vValue
        : vValue.toString(16);
    return `0x${sig.r.slice(2)}${sig.s.slice(2)}${vHex.padStart(
      2,
      '0',
    )}` as Hex;
  } else {
    await (transport as TransportWebHID)?.close();
    throw new Error(`Unsupported message type`);
  }
}

export const showLedgerDisconnectedAlertIfNeeded = (e: Error) => {
  if (
    e.name === 'TransportOpenUserCancelled' &&
    e.message === 'Access denied to use Ledger device'
  ) {
    alert(i18n.t('hw.check_ledger_disconnected'));
  }
};

export const isLedgerConnectionError = (e: Error) => {
  return [
    'TransportOpenUserCancelled',
    'TransportStatusError',
    'LockedDeviceError',
  ].includes(e?.name);
};
