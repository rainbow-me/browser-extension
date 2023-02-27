/* eslint-disable @typescript-eslint/no-unused-vars */
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';
import transformTypedDataPlugin from '@trezor/connect-plugin-ethereum';
import { EthereumTransactionEIP1559 } from '@trezor/connect/lib/types';
import { getProvider } from '@wagmi/core';
import { Bytes, UnsignedTransaction, ethers } from 'ethers';
import { Address } from 'wagmi';

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

export async function sendTransactionFromTrezor(
  transaction: ethers.providers.TransactionRequest,
): Promise<TransactionResponse> {
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
      gasPrice: transaction.gasPrice || undefined,
      maxFeePerGas: transaction.maxFeePerGas || undefined,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas || undefined,
      nonce: ethers.BigNumber.from(transaction.nonce).toNumber(),
      to: transaction.to || undefined,
      type: transaction.gasPrice ? 1 : 2,
      value: transaction.value || undefined,
    };

    console.log('TX OBJ TO SIGN', baseTx);
    console.log('path to use', path);
    console.log('address to use', address);

    const response = await window.TrezorConnect.ethereumSignTransaction({
      path,
      transaction: {
        ...baseTx,
        nonce: ethers.BigNumber.from(transaction.nonce).toString(),
      } as unknown as EthereumTransactionEIP1559,
    });

    console.log("Trezor's response", response);

    if (response.success) {
      // TODO - Verify that it was signed by the right address
      const serializedTransaction = ethers.utils.serializeTransaction(baseTx, {
        r: response.payload.r,
        s: response.payload.s,
        v: ethers.BigNumber.from(response.payload.v).toNumber(),
      });

      console.log('serializedTransaction', serializedTransaction);

      const parsedTx = ethers.utils.parseTransaction(serializedTransaction);
      if (parsedTx.from?.toLowerCase() !== address?.toLowerCase()) {
        console.log('actual signer', parsedTx.from?.toLowerCase());
        console.log('expected signer', address?.toLowerCase());
        throw new Error('Transaction was not signed by the right address');
      }

      return provider.sendTransaction(serializedTransaction);
    } else {
      alert('error signing transaction with trezor');
      console.log('error signing transaction with trezor', response);
      throw new Error('error signing transaction with trezor');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    alert('Please make sure your trezor is unlocked');
    console.log('error signing transaction with trezor', e);

    // bubble up the error
    throw e;
  }
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

    console.log('response', response);

    if (response.payload.address.toLowerCase() !== address.toLowerCase()) {
      throw new Error(
        'Trezor returned a different address than the one requested',
      );
    }

    if (!response.success) {
      throw new Error('Trezor returned an error');
    }

    return response.payload.signature;

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
    return response.payload.signature;
  } else {
    throw new Error(`Message type ${messageType} not supported`);
  }
}
