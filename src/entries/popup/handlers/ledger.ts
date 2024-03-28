import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Bytes, hexlify, joinSignature } from '@ethersproject/bytes';
import { TransactionRequest } from '@ethersproject/providers';
import { toUtf8Bytes } from '@ethersproject/strings';
import {
  UnsignedTransaction,
  parse,
  serialize,
} from '@ethersproject/transactions';
import AppEth, { ledgerService } from '@ledgerhq/hw-app-eth';
import type Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';
import { ChainId } from '@rainbow-me/swaps';
import { type Address } from 'viem';
import { getPublicClient } from 'wagmi/actions';

import { i18n } from '~/core/languages';
import { LEGACY_CHAINS_FOR_HW } from '~/core/references';
import { logger } from '~/logger';

import { walletAction } from './walletAction';

const getPath = async (address: Address) => {
  return (await walletAction('get_path', address)) as string;
};

export async function signTransactionFromLedger(
  transaction: TransactionRequest,
): Promise<string> {
  let transport;
  try {
    const { from: address } = transaction;
    try {
      transport = await TransportWebHID.openConnected();
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

    let forceLegacy = false;
    // Ledger doesn't support type 2 for these networks yet
    if (LEGACY_CHAINS_FOR_HW.includes(transaction.chainId as ChainId)) {
      forceLegacy = true;
    }

    if (transaction.gasPrice) {
      baseTx.gasPrice = transaction.gasPrice;
    } else if (!forceLegacy) {
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
    });

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
  const provider = getPublicClient({
    chainId: transaction.chainId,
  });

  return provider.sendTransaction(serializedTransaction);
}

export async function signMessageByTypeFromLedger(
  msgData: string | Bytes,
  address: Address,
  messageType: string,
): Promise<string> {
  let transport;
  try {
    transport = await TransportWebHID.openConnected();
  } catch (e) {
    transport = await TransportWebHID.create();
  }
  const appEth = new AppEth(transport as Transport);
  const path = await getPath(address);
  // Personal sign
  if (messageType === 'personal_sign') {
    if (typeof msgData === 'string') {
      try {
        // eslint-disable-next-line no-param-reassign
        msgData = toUtf8Bytes(msgData);
      } catch (e) {
        logger.info('the message is not a utf8 string, will sign as hex');
      }
    }

    const messageHex = hexlify(msgData).substring(2);

    const sig = await appEth.signPersonalMessage(path, messageHex);
    sig.r = '0x' + sig.r;
    sig.s = '0x' + sig.s;
    await (transport as TransportWebHID)?.close();
    return joinSignature(sig);
    // sign typed data
  } else if (messageType === 'sign_typed_data') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedData = msgData as any;
    const version = SignTypedDataVersion.V4;
    if (
      typeof msgData !== 'object' ||
      !(parsedData.types || parsedData.primaryType || parsedData.domain)
    ) {
      await (transport as TransportWebHID)?.close();
      throw new Error('unsupported typed data version');
    }

    const { domain, types, primaryType, message } =
      TypedDataUtils.sanitizeData(parsedData);

    const domainSeparatorHex = TypedDataUtils.hashStruct(
      'EIP712Domain',
      domain,
      types,
      version,
    ).toString('hex');

    const hashStructMessageHex = TypedDataUtils.hashStruct(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      primaryType,
      message,
      types,
      version,
    ).toString('hex');

    const sig = await appEth.signEIP712HashedMessage(
      path,
      domainSeparatorHex,
      hashStructMessageHex,
    );
    sig.r = '0x' + sig.r;
    sig.s = '0x' + sig.s;
    await (transport as TransportWebHID)?.close();
    return joinSignature(sig);
  } else {
    await (transport as TransportWebHID)?.close();
    throw new Error(`Message type ${messageType} not supported`);
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
