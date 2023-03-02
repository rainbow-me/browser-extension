import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { Bytes, hexlify, joinSignature } from '@ethersproject/bytes';
import { TransactionRequest } from '@ethersproject/providers';
import { toUtf8Bytes } from '@ethersproject/strings';
import { UnsignedTransaction, serialize } from '@ethersproject/transactions';
import AppEth, { ledgerService } from '@ledgerhq/hw-app-eth';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';
import { getProvider } from '@wagmi/core';
import { Address } from 'wagmi';

import { walletAction } from './wallet';

const getPath = async (address: Address) => {
  return (await walletAction('get_path', address)) as string;
};

export async function sendTransactionFromLedger(
  transaction: TransactionRequest,
): Promise<TransactionResponse> {
  try {
    const { from: address } = transaction;
    const provider = getProvider({
      chainId: transaction.chainId,
    });

    const transport = await TransportWebUSB.create();
    const appEth = new AppEth(transport);
    const path = await getPath(address as Address);

    const baseTx: UnsignedTransaction = {
      chainId: transaction.chainId || undefined,
      data: transaction.data || undefined,
      gasLimit: transaction.gasLimit || undefined,
      gasPrice: transaction.gasPrice || undefined,
      maxFeePerGas: transaction.maxFeePerGas || undefined,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas || undefined,
      nonce: transaction.nonce
        ? BigNumber.from(transaction.nonce).toNumber()
        : undefined,
      to: transaction.to || undefined,
      type: transaction.gasPrice ? 1 : 2,
      value: transaction.value || undefined,
    };

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

    return provider.sendTransaction(serializedTransaction);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e?.name === 'TransportStatusError') {
      alert(
        'Please make sure your ledger is unlocked and open the Ethereum app',
      );
    }

    // bubble up the error
    throw e;
  }
}

export async function signMessageByTypeFromLedger(
  msgData: string | Bytes,
  address: Address,
  messageType: string,
): Promise<string> {
  const transport = await TransportWebUSB.create();
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
    return joinSignature(sig);
  } else {
    throw new Error(`Message type ${messageType} not supported`);
  }
}
