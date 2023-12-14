/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Bytes, hexlify } from '@ethersproject/bytes';
import { toUtf8Bytes } from '@ethersproject/strings';
import {
  UnsignedTransaction,
  parse,
  serialize,
} from '@ethersproject/transactions';
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';
import { ChainId } from '@rainbow-me/swaps';
import transformTypedDataPlugin from '@trezor/connect-plugin-ethereum';
import { Address, getProvider } from '@wagmi/core';

import { LEGACY_CHAINS_FOR_HW } from '~/core/references';
import { addHexPrefix } from '~/core/utils/hex';
import { logger } from '~/logger';

import { walletAction } from './walletAction';

const getPath = async (address: Address) => {
  return (await walletAction('get_path', address)) as string;
};

export async function signTransactionFromTrezor(
  transaction: TransactionRequest,
): Promise<string> {
  try {
    const { from: address } = transaction;
    const provider = getProvider({
      chainId: transaction.chainId,
    });

    const path = await getPath(address as Address);

    const baseTx: UnsignedTransaction = {
      chainId: transaction.chainId || undefined,
      data: transaction.data || undefined,
      gasLimit: transaction.gasLimit
        ? BigNumber.from(transaction.gasLimit).toHexString()
        : undefined,
      nonce: BigNumber.from(transaction.nonce).toNumber(),
      to: transaction.to || undefined,
      value: transaction?.value
        ? BigNumber.from(transaction.value).toHexString()
        : '0x0',
    };

    let forceLegacy = false;

    // Trezor doesn't support type 2 for these networks yet
    if (LEGACY_CHAINS_FOR_HW.includes(transaction.chainId as ChainId)) {
      forceLegacy = true;
    }

    if (transaction.gasPrice) {
      baseTx.gasPrice = transaction.gasPrice;
    } else if (!forceLegacy) {
      baseTx.maxFeePerGas = transaction.maxFeePerGas;
      baseTx.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
    } else {
      baseTx.gasPrice = transaction.maxFeePerGas;
    }

    const nonceHex = BigNumber.from(transaction.nonce).toHexString();
    const response = await window.TrezorConnect.ethereumSignTransaction({
      path,
      transaction: {
        ...baseTx,
        nonce: nonceHex,
      },
    });

    if (response.success) {
      if (baseTx.maxFeePerGas) {
        baseTx.type = 2;
      }
      const serializedTransaction = serialize(baseTx, {
        r: response.payload.r,
        s: response.payload.s,
        v: BigNumber.from(response.payload.v).toNumber(),
      });

      const parsedTx = parse(serializedTransaction);
      if (parsedTx.from?.toLowerCase() !== address?.toLowerCase()) {
        throw new Error('Transaction was not signed by the right address');
      }

      return serializedTransaction;
    } else {
      console.log('trezor error', JSON.stringify(response, null, 2), baseTx);
      alert('error signing transaction with trezor');
      throw new Error('error signing transaction with trezor');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log('trezor error', e);
    alert('Please make sure your trezor is unlocked');

    // bubble up the error
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
  msgData: string | Bytes,
  address: Address,
  messageType: string,
): Promise<string> {
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

    const response = await window.TrezorConnect.ethereumSignMessage({
      path,
      message: messageHex,
      hex: true,
    });

    if (response.payload.address.toLowerCase() !== address.toLowerCase()) {
      throw new Error(
        'Trezor returned a different address than the one requested',
      );
    }

    if (!response.success) {
      throw new Error('Trezor returned an error');
    }

    return addHexPrefix(response.payload.signature);

    // sign typed data
  } else if (messageType === 'sign_typed_data') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedData = msgData as any;
    const version = SignTypedDataVersion.V4;
    if (
      typeof msgData !== 'object' ||
      !(parsedData.types || parsedData.primaryType || parsedData.domain)
    ) {
      throw new Error('unsupported typed data version');
    }

    const { domain, types, primaryType, message } =
      TypedDataUtils.sanitizeData(parsedData);

    const eip712Data = {
      types,
      primaryType,
      domain,
      message,
    };

    const { domain_separator_hash, message_hash } = transformTypedDataPlugin(
      eip712Data,
      true,
    );

    const response = await window.TrezorConnect.ethereumSignTypedData({
      path,
      data: eip712Data,
      metamask_v4_compat: true,
      domain_separator_hash,
      message_hash,
    });

    if (!response.success) {
      throw new Error('Trezor returned an error');
    }

    if (response.payload.address.toLowerCase() !== address.toLowerCase()) {
      throw new Error(
        'Trezor returned a different address than the one requested',
      );
    }
    return addHexPrefix(response.payload.signature);
  } else {
    throw new Error(`Message type ${messageType} not supported`);
  }
}
