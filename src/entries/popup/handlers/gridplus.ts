import { Common, Hardfork } from '@ethereumjs/common';
import { TransactionFactory, TypedTxData } from '@ethereumjs/tx';
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Bytes, hexlify, joinSignature } from '@ethersproject/bytes';
import {
  UnsignedTransaction,
  parse,
  serialize,
} from '@ethersproject/transactions';
import { TypedDataUtils } from '@metamask/eth-sig-util';
import { getProvider } from '@wagmi/core';
import {
  Constants,
  sign as gridPlusSign,
  signMessage as gridPlusSignMessage,
} from 'gridplus-sdk';
import { encode } from 'rlp';
import { Address } from 'wagmi';

import { getPath } from '~/core/keychain';
import { LocalStorage } from '~/core/storage';
import { addHexPrefix } from '~/core/utils/hex';

const LOCAL_STORAGE_CLIENT_NAME = 'storedClient';

export const getStoredGridPlusClient = () =>
  LocalStorage.get(LOCAL_STORAGE_CLIENT_NAME) ?? '';

export const setStoredGridPlusClient = (storedClient: string | null) => {
  if (!storedClient) return;
  LocalStorage.set(LOCAL_STORAGE_CLIENT_NAME, storedClient);
};

export const removeStoredGridPlusClient = () =>
  LocalStorage.remove(LOCAL_STORAGE_CLIENT_NAME);

export async function signTransactionFromGridPlus(
  transaction: TransactionRequest,
) {
  try {
    const { from: address } = transaction;
    const path = await getPath(address as Address);
    const addressIndex = parseInt(path.split('/')[5]);
    const signerPath = [
      0x80000000 + 44,
      0x80000000 + 60,
      0x80000000,
      0,
      addressIndex,
    ];
    const baseTx: UnsignedTransaction = {
      chainId: transaction.chainId,
      data: transaction.data,
      gasLimit: transaction.gasLimit
        ? BigNumber.from(transaction.gasLimit).toHexString()
        : undefined,
      nonce: transaction.nonce
        ? BigNumber.from(transaction.nonce).toNumber()
        : undefined,
      to: transaction.to,
      value: transaction.value
        ? BigNumber.from(transaction.value).toHexString()
        : undefined,
    };

    if (transaction.gasPrice) {
      baseTx.gasPrice = transaction.gasPrice;
    } else {
      if (transaction.maxFeePerGas && transaction.maxPriorityFeePerGas) {
        baseTx.maxFeePerGas = transaction.maxFeePerGas;
        baseTx.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
        baseTx.type = 2;
      } else {
        baseTx.gasPrice = transaction.maxFeePerGas;
      }
    }

    const common = Common.custom({
      chainId: transaction.chainId,
      defaultHardfork: Hardfork.London,
    });

    const txPayload = TransactionFactory.fromTxData(baseTx as TypedTxData, {
      common,
    });

    const signPayload = {
      data: {
        signerPath,
        chain: transaction.chainId,
        curveType: Constants.SIGNING.CURVES.SECP256K1,
        hashType: Constants.SIGNING.HASHES.KECCAK256,
        encodingType: Constants.SIGNING.ENCODINGS.EVM,
        payload:
          baseTx.type === 2
            ? txPayload.getMessageToSign()
            : encode(txPayload.getMessageToSign()),
      },
    };

    const response = await gridPlusSign([], signPayload);

    const r = addHexPrefix(response.sig.r.toString('hex'));
    const s = addHexPrefix(response.sig.s.toString('hex'));
    const v = BigNumber.from(
      addHexPrefix(response.sig.v.toString('hex')),
    ).toNumber();

    if (response.pubkey) {
      const serializedTransaction = serialize(baseTx, {
        r,
        s,
        v,
      });

      const parsedTx = parse(serializedTransaction);
      if (parsedTx.from?.toLowerCase() !== address?.toLowerCase()) {
        throw new Error(
          'Address not found on this wallet. Try another SafeCard or remove the SafeCard to use the wallet on your device.',
        );
      }

      return serializedTransaction;
    } else {
      alert('error signing transaction with gridplus');
      throw new Error('error signing transaction with gridplus');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    alert('Please make sure your gridplus is unlocked');
    // bubble up the error
    throw e;
  }
}

export async function sendTransactionFromGridPlus(
  transaction: TransactionRequest,
): Promise<TransactionResponse> {
  const serializedTransaction = await signTransactionFromGridPlus(transaction);
  const provider = getProvider({
    chainId: transaction.chainId,
  });
  return provider.sendTransaction(serializedTransaction as string);
}

export async function signMessageByTypeFromGridPlus(
  msgData: string | Bytes,
  address: Address,
  messageType: string,
): Promise<string> {
  const path = await getPath(address as Address);
  const addressIndex = parseInt(path.split('/')[5]);
  const signerPath = [
    0x80000000 + 44,
    0x80000000 + 60,
    0x80000000,
    0,
    addressIndex,
  ];
  // Personal sign
  if (messageType === 'personal_sign') {
    const response = await gridPlusSignMessage(msgData, {
      signerPath,
      payload: msgData,
      protocol: 'signPersonal',
    });

    const responseAddress = hexlify(response.signer);

    if (responseAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error(
        'GridPlus returned a different address than the one requested',
      );
    }

    if (!response.sig) {
      throw new Error('GridPlus returned an error');
    }

    const signature = joinSignature({
      r: addHexPrefix(response.sig.r.toString('hex')),
      s: addHexPrefix(response.sig.s.toString('hex')),
      v: BigNumber.from(
        addHexPrefix(response.sig.v.toString('hex')),
      ).toNumber(),
    });

    return signature;
    // sign typed data
  } else if (messageType === 'sign_typed_data') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedData = msgData as any;
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

    const response = await gridPlusSignMessage(eip712Data, {
      signerPath,
      protocol: 'eip712',
      payload: eip712Data,
    });

    const responseAddress = hexlify(response.signer);

    if (responseAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error(
        'Address not found on this wallet. Try another SafeCard or remove the SafeCard to use the wallet on your device.',
      );
    }

    if (!response.sig) {
      throw new Error('GridPlus returned an error');
    }

    const signature = joinSignature({
      r: addHexPrefix(response.sig.r.toString('hex')),
      s: addHexPrefix(response.sig.s.toString('hex')),
      v: BigNumber.from(
        addHexPrefix(response.sig.v.toString('hex')),
      ).toNumber(),
    });

    return signature;
  } else {
    throw new Error(`Message type ${messageType} not supported`);
  }
}
