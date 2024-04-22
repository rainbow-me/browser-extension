/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { Bytes, hexlify } from '@ethersproject/bytes';
import { toUtf8Bytes } from '@ethersproject/strings';
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';
import transformTypedDataPlugin from '@trezor/connect-plugin-ethereum';
import { getProvider } from '@wagmi/core';
import { Address } from 'wagmi';

import { signTransactionFromTrezor } from '~/core/trezor/actions';
import { addHexPrefix } from '~/core/utils/hex';
import { logger } from '~/logger';

import { walletAction } from './walletAction';

const getPath = async (address: Address) => {
  return (await walletAction('get_path', address)) as string;
};

export async function sendTransactionFromTrezor(
  transaction: TransactionRequest,
): Promise<TransactionResponse> {
  const path = await getPath(transaction.from as Address);
  const serializedTransaction = await signTransactionFromTrezor(
    transaction,
    path,
  );
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
