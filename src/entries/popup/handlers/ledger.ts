import { TransactionResponse } from '@ethersproject/abstract-provider';
import AppEth, { ledgerService } from '@ledgerhq/hw-app-eth';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';
import { getProvider } from '@wagmi/core';
import { Bytes, ethers } from 'ethers';
import { Address } from 'wagmi';

import { walletAction } from './wallet';

const getPath = async (address: Address) => {
  return (await walletAction('get_path', address)) as string;
};

export async function sendTransactionFromLedger(
  transaction: ethers.providers.TransactionRequest,
): Promise<TransactionResponse> {
  try {
    const { from: address } = transaction;
    console.log('sending transaction from ledger', transaction);
    console.log('from address', address);
    const provider = getProvider({
      chainId: transaction.chainId,
    });
    console.log('provider', provider);

    const transport = await TransportWebUSB.create();
    console.log('got transport');
    const appEth = new AppEth(transport);
    console.log('got appEth');
    const path = await getPath(address as Address);
    console.log('path', path);

    const baseTx: ethers.utils.UnsignedTransaction = {
      chainId: transaction.chainId || undefined,
      data: transaction.data || undefined,
      gasLimit: transaction.gasLimit || undefined,
      gasPrice: transaction.gasPrice || undefined,
      maxFeePerGas: transaction.maxFeePerGas || undefined,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas || undefined,
      nonce: transaction.nonce
        ? ethers.BigNumber.from(transaction.nonce).toNumber()
        : undefined,
      to: transaction.to || undefined,
      type: transaction.gasPrice ? 1 : 2,
      value: transaction.value || undefined,
    };

    const unsignedTx = ethers.utils.serializeTransaction(baseTx).substring(2);

    console.log('unsignedTx', unsignedTx);

    const resolution = await ledgerService.resolveTransaction(
      unsignedTx,
      appEth.loadConfig,
      {
        erc20: true,
        externalPlugins: true,
        nft: true,
      },
    );

    console.log('resolution', resolution);

    const sig = await appEth.signTransaction(path, unsignedTx, resolution);
    console.log('sig', sig);

    const serializedTransaction = ethers.utils.serializeTransaction(baseTx, {
      r: '0x' + sig.r,
      s: '0x' + sig.s,
      v: ethers.BigNumber.from('0x' + sig.v).toNumber(),
    });

    console.log('serializedTransaction', serializedTransaction);
    return provider.sendTransaction(serializedTransaction);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log('error with sendTransactionFromLedger', e);
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
      msgData = ethers.utils.toUtf8Bytes(msgData);
    }

    const messageHex = ethers.utils.hexlify(msgData).substring(2);

    const sig = await appEth.signPersonalMessage(path, messageHex);
    sig.r = '0x' + sig.r;
    sig.s = '0x' + sig.s;
    return ethers.utils.joinSignature(sig);
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
    return ethers.utils.joinSignature(sig);
  } else {
    throw new Error(`Message type ${messageType} not supported`);
  }
}
