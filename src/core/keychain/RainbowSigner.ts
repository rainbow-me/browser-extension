import { Common } from '@ethereumjs/common';
import {
  FeeMarketEIP1559TxData,
  LegacyTxData,
  TransactionFactory,
} from '@ethereumjs/tx';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import { Bytes } from '@ethersproject/bytes';
import { defineReadOnly } from '@ethersproject/properties';
import { Provider } from '@ethersproject/providers';
import { personalSign } from '@metamask/eth-sig-util';
import { bytesToHex } from 'ethereum-cryptography/utils';
import { Address } from 'viem';

import { addHexPrefix } from '../utils/hex';

import { PrivateKey } from './IKeychain';

export class RainbowSigner extends Signer {
  readonly privateKey!: PrivateKey;
  readonly address!: Address;

  constructor(provider: Provider, privateKey: PrivateKey, address: Address) {
    super();
    defineReadOnly(this, 'provider', provider);
    defineReadOnly(this, 'privateKey', privateKey);
    defineReadOnly(this, 'address', address);
  }

  #getPrivateKeyBuffer = (): Buffer => {
    return Buffer.from(addHexPrefix(this.privateKey).substring(2), 'hex');
  };

  async getAddress(): Promise<Address> {
    return this.address as Address;
  }

  async signMessage(message: Bytes | string): Promise<string> {
    const data =
      typeof message === 'string' ? message : bytesToHex(message as Uint8Array);
    const pkey = this.#getPrivateKeyBuffer();

    const signature = personalSign({
      privateKey: pkey,
      data,
    });
    return signature;
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    // We're converting the ethers v5 transaction request to
    // an ethereum JS transaction object so all the crypto operations
    // are made using EthereumJS instead of ethers v5

    const txData: LegacyTxData | FeeMarketEIP1559TxData = {
      data: transaction.data?.toString(),
      to: transaction.to,
      accessList: [],
      gasLimit: transaction.gasLimit
        ? BigNumber.from(transaction.gasLimit).toHexString()
        : undefined,
      value: transaction.value
        ? BigNumber.from(transaction.value).toHexString()
        : undefined,
      nonce:
        transaction.nonce !== undefined
          ? BigNumber.from(transaction.nonce).toHexString()
          : undefined,
      chainId: transaction.chainId
        ? BigNumber.from(transaction.chainId).toHexString()
        : undefined,
      type: transaction.type
        ? BigNumber.from(transaction.type).toHexString()
        : undefined,
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: undefined,
      gasPrice: undefined,
    };

    // Legacy tx support
    if (transaction.gasPrice) {
      (txData as LegacyTxData).gasPrice = BigNumber.from(
        transaction.gasPrice,
      ).toHexString();
    } else {
      // EIP-1559 tx support
      if (transaction.maxFeePerGas) {
        txData.maxFeePerGas = BigNumber.from(
          transaction.maxFeePerGas,
        ).toHexString();
      }
      if (transaction.maxPriorityFeePerGas) {
        txData.maxPriorityFeePerGas = BigNumber.from(
          transaction.maxPriorityFeePerGas,
        ).toHexString();
      }
    }

    const common = Common.custom({ chainId: transaction.chainId });
    const typedTx = TransactionFactory.fromTxData(txData, { common });
    const signedTx = typedTx.sign(this.#getPrivateKeyBuffer());

    const serializedTx = signedTx.serialize();
    const rawSignedTx = bytesToHex(serializedTx);
    return addHexPrefix(rawSignedTx);
  }

  connect(provider: Provider): Signer {
    return new RainbowSigner(
      provider,
      this.privateKey! as PrivateKey,
      this.address! as Address,
    );
  }
}
