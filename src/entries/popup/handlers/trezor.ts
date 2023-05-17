/* eslint-disable @typescript-eslint/no-unused-vars */
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';
import transformTypedDataPlugin from '@trezor/connect-plugin-ethereum';
import { getProvider } from '@wagmi/core';
import { Bytes, UnsignedTransaction, ethers } from 'ethers';
import { Address } from 'wagmi';

import { addHexPrefix } from '~/core/utils/ethereum';

import { walletAction } from './wallet';

export const TREZOR_CONFIG = {
  manifest: {
    email: 'support@rainbow.me',
    appUrl: 'https://rainbow.me',
  },
  lazyLoad: true,
};

const getPath = async (address: Address) => {
  return (await walletAction('get_path', address)) as string;
};

export async function signTransactionFromTrezor(
  transaction: ethers.providers.TransactionRequest,
): Promise<string> {
  try {
    window.TrezorConnect.init(TREZOR_CONFIG);
    const { from: address } = transaction;
    const provider = getProvider({
      chainId: transaction.chainId,
    });

    const path = await getPath(address as Address);

    const baseTx: UnsignedTransaction = {
      chainId: transaction.chainId || undefined,
      data: transaction.data || undefined,
      gasLimit: transaction.gasLimit || undefined,
      nonce: ethers.BigNumber.from(transaction.nonce).toNumber(),
      to: transaction.to || undefined,
      value:
        ethers.BigNumber.from(transaction.value).toHexString() || undefined,
    };

    if (transaction.gasPrice) {
      baseTx.gasPrice = transaction.gasPrice;
    } else {
      baseTx.maxFeePerGas = transaction.maxFeePerGas;
      baseTx.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
    }

    const nonceHex = ethers.BigNumber.from(transaction.nonce).toHexString();
    const response = await window.TrezorConnect.ethereumSignTransaction({
      path,
      transaction: {
        ...baseTx,
        nonce: nonceHex,
      },
    });

    if (response.success) {
      const serializedTransaction = ethers.utils.serializeTransaction(baseTx, {
        r: response.payload.r,
        s: response.payload.s,
        v: ethers.BigNumber.from(response.payload.v).toNumber(),
      });

      const parsedTx = ethers.utils.parseTransaction(serializedTransaction);
      if (parsedTx.from?.toLowerCase() !== address?.toLowerCase()) {
        throw new Error('Transaction was not signed by the right address');
      }

      return serializedTransaction;
    } else {
      alert('error signing transaction with trezor');
      throw new Error('error signing transaction with trezor');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    alert('Please make sure your trezor is unlocked');

    // bubble up the error
    throw e;
  }
}
export async function sendTransactionFromTrezor(
  transaction: ethers.providers.TransactionRequest,
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
  window.TrezorConnect.init(TREZOR_CONFIG);
  const path = await getPath(address);
  // Personal sign
  if (messageType === 'personal_sign') {
    if (typeof msgData === 'string') {
      // eslint-disable-next-line no-param-reassign
      msgData = ethers.utils.toUtf8Bytes(msgData);
    }

    const messageHex = ethers.utils.hexlify(msgData).substring(2);

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
