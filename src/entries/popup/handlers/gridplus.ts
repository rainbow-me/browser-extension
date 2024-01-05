import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { TransactionFactory, TypedTxData } from '@ethereumjs/tx';
import {
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import {
  UnsignedTransaction,
  parse,
  serialize,
} from '@ethersproject/transactions';
import { ChainId } from '@rainbow-me/swaps';
import { getProvider } from '@wagmi/core';
import { sign as gridPlusSign, setup } from 'gridplus-sdk';

import { LEGACY_CHAINS_FOR_HW } from '~/core/references';

const getStoredClient = () => localStorage.getItem('storedClient') || '';

const setStoredClient = (storedClient: string | null) => {
  if (!storedClient) return;
  localStorage.setItem('storedClient', storedClient);
};

export async function signTransactionFromGridPlus(
  transaction: TransactionRequest,
) {
  try {
    await setup({ getStoredClient, setStoredClient, name: 'Rainbow' });
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

    const r = '0x' + response.sig.r.toString('hex');
    const s = '0x' + response.sig.s.toString('hex');
    const v = BigNumber.from('0x' + response.sig.v.toString('hex')).toNumber();

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
        console.log('>>>PARSED_TX', parsedTx);
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
