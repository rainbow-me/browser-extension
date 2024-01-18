import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { TransactionFactory, TypedTxData } from '@ethereumjs/tx';
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Bytes, hexlify, joinSignature } from '@ethersproject/bytes';
import { toUtf8Bytes } from '@ethersproject/strings';
import {
  UnsignedTransaction,
  parse,
  serialize,
} from '@ethersproject/transactions';
import { TypedDataUtils } from '@metamask/eth-sig-util';
import { ChainId } from '@rainbow-me/swaps';
import { getProvider } from '@wagmi/core';
import {
  sign as gridPlusSign,
  signMessage as gridPlusSignMessage,
} from 'gridplus-sdk';
import { Address } from 'wagmi';

import { getPath } from '~/core/keychain';
import { LEGACY_CHAINS_FOR_HW } from '~/core/references';
import { addHexPrefix } from '~/core/utils/hex';
import { logger } from '~/logger';

export async function signTransactionFromGridPlus(
  transaction: TransactionRequest,
) {
  try {
    const { from: address } = transaction;
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
    // HW doesn't support type 2 for these networks yet
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

    const common = new Common({
      chain: Chain.Mainnet,
      hardfork: Hardfork.London,
    });

    const txPayload = TransactionFactory.fromTxData(baseTx as TypedTxData, {
      common,
    });

    const response = await gridPlusSign(txPayload.getMessageToSign() as Buffer);

    const r = addHexPrefix(response.sig.r.toString('hex'));
    const s = addHexPrefix(response.sig.s.toString('hex'));
    const v = BigNumber.from(
      addHexPrefix(response.sig.v.toString('hex')),
    ).toNumber();

    if (response.pubkey) {
      if (baseTx.gasLimit) {
        baseTx.type = 2;
      }
      const serializedTransaction = serialize(baseTx, {
        r,
        s,
        v,
      });

      const parsedTx = parse(serializedTransaction);
      if (parsedTx.from?.toLowerCase() !== address?.toLowerCase()) {
        throw new Error('Transaction was not signed by the right address');
      }

      return serializedTransaction;
    } else {
      console.log('gridplus error', JSON.stringify(response, null, 2), baseTx);
      alert('error signing transaction with gridplus');
      throw new Error('error signing transaction with gridplus');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log('gridplus error', e);
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
  const path = await getPath(address.toLowerCase() as Address);
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
    if (typeof msgData === 'string') {
      try {
        // eslint-disable-next-line no-param-reassign
        msgData = toUtf8Bytes(msgData);
      } catch (e) {
        logger.info('the message is not a utf8 string, will sign as hex');
      }
    }

    const messageHex = hexlify(msgData).substring(2);

    const response = await gridPlusSignMessage(messageHex, {
      signerPath,
      payload: messageHex,
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
  } else {
    throw new Error(`Message type ${messageType} not supported`);
  }
}
