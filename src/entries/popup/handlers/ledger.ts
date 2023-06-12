import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Bytes, hexlify, joinSignature } from '@ethersproject/bytes';
import { TransactionRequest } from '@ethersproject/providers';
import { toUtf8Bytes } from '@ethersproject/strings';
import { UnsignedTransaction, serialize } from '@ethersproject/transactions';
import AppEth, { ledgerService } from '@ledgerhq/hw-app-eth';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';
import { getProvider } from '@wagmi/core';
import { ethers } from 'ethers';
import { Address } from 'wagmi';

import { ChainId } from '~/core/types/chains';

import { walletAction } from './wallet';

const getPath = async (address: Address) => {
  return (await walletAction('get_path', address)) as string;
};

export async function signTransactionFromLedger(
  transaction: TransactionRequest,
): Promise<string> {
  let transport;
  try {
    const { from: address } = transaction;
    transport = await TransportWebHID.create();
    const appEth = new AppEth(transport);
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
    } else {
      baseTx.maxFeePerGas = transaction.maxFeePerGas || undefined;
      baseTx.maxPriorityFeePerGas =
        transaction.maxPriorityFeePerGas || undefined;
      if (transaction.chainId === ChainId.mainnet) {
        baseTx.type = 2;
      }
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

    const parsedTx = ethers.utils.parseTransaction(serializedTransaction);
    if (parsedTx.from?.toLowerCase() !== address?.toLowerCase()) {
      throw new Error('Transaction was not signed by the right address');
    }

    transport?.close();
    return serializedTransaction;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e?.name === 'TransportStatusError') {
      alert(
        'Please make sure your ledger is unlocked and open the Ethereum app',
      );
    }
    transport?.close();
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
  msgData: string | Bytes,
  address: Address,
  messageType: string,
): Promise<string> {
  const transport = await TransportWebHID.create();
  const appEth = new AppEth(transport);
  const path = await getPath(address);
  // Personal sign
  if (messageType === 'personal_sign') {
    if (typeof msgData === 'string') {
      // eslint-disable-next-line no-param-reassign
      msgData = toUtf8Bytes(msgData);
    }

    const messageHex = hexlify(msgData).substring(2);

    const sig = await appEth.signPersonalMessage(path, messageHex);
    sig.r = '0x' + sig.r;
    sig.s = '0x' + sig.s;
    transport?.close();
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
      transport?.close();
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
    transport?.close();
    return joinSignature(sig);
  } else {
    transport?.close();
    throw new Error(`Message type ${messageType} not supported`);
  }
}
