/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import {
  UnsignedTransaction,
  parse,
  serialize,
} from '@ethersproject/transactions';

import { LEGACY_CHAINS_FOR_HW } from '../references/index';
import { ChainId } from '../types/chains';

export async function signTransactionFromTrezor(
  transaction: TransactionRequest,
  path?: string,
  fromPopup?: boolean,
): Promise<string> {
  try {
    const { from: address } = transaction;

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

    console.log('1');

    // Trezor doesn't support type 2 for these networks yet
    if (LEGACY_CHAINS_FOR_HW.includes(transaction.chainId as ChainId)) {
      forceLegacy = true;
    }

    console.log('2');

    if (transaction.gasPrice) {
      baseTx.gasPrice = transaction.gasPrice;
    } else if (!forceLegacy) {
      baseTx.maxFeePerGas = transaction.maxFeePerGas;
      baseTx.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
    } else {
      baseTx.gasPrice = transaction.maxFeePerGas;
    }

    console.log('3');

    const nonceHex = BigNumber.from(transaction.nonce).toHexString();
    console.log('33');

    let response;

    if (!fromPopup) {
      response = await TrezorConnect.ethereumSignTransaction({
        path,
        transaction: {
          ...baseTx,
          nonce: nonceHex,
        },
      });
    } else {
      console.log('IN WINDOW FLOW');
      response = await window.TrezorConnect.ethereumSignTransaction({
        path,
        transaction: {
          ...baseTx,
          nonce: nonceHex,
        },
      });
    }

    console.log('4');

    if (response.payload) {
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
        console.log('6');
        throw new Error('Transaction was not signed by the right address');
      }

      return serializedTransaction;
    } else {
      console.log('trezor error', JSON.stringify(response, null, 2), baseTx);
      throw new Error('error signing transaction with trezor');
    }
  } catch (e: any) {
    console.log('trezor error', e);
    // bubble up the error
    throw e;
  }
}
