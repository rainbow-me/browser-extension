import { TransactionFactory } from '@ethereumjs/tx';
import { personalSign } from '@metamask/eth-sig-util';
import { bytesToHex } from 'ethereum-cryptography/utils';
import { ethers } from 'ethers';
import { Address } from 'wagmi';

import { addHexPrefix } from '../utils/hex';

import { PrivateKey } from './IKeychain';

export class RainbowSigner extends ethers.Signer {
  readonly privateKey!: PrivateKey;
  readonly address!: Address;

  constructor(
    provider: ethers.providers.Provider,
    privateKey: PrivateKey,
    address: Address,
  ) {
    super();
    ethers.utils.defineReadOnly(this, 'provider', provider);
    ethers.utils.defineReadOnly(this, 'privateKey', privateKey);
    ethers.utils.defineReadOnly(this, 'address', address);
  }

  #getPrivateKeyBuffer = (): Buffer => {
    return Buffer.from(addHexPrefix(this.privateKey).substring(2), 'hex');
  };

  async getAddress(): Promise<string> {
    return this.address as string;
  }

  async signMessage(message: ethers.utils.Bytes | string): Promise<string> {
    const data =
      typeof message === 'string' ? message : bytesToHex(message as Uint8Array);
    const pkey = this.#getPrivateKeyBuffer();

    const signature = personalSign({
      privateKey: pkey,
      data,
    });
    return signature;
  }

  async signTransaction(
    transaction: ethers.providers.TransactionRequest,
  ): Promise<string> {
    // We're converting the ethers v5 transaction request to
    // an ethereum JS transaction object so all the crypto operations
    // are made using EthereumJS instead of ethers v5

    const typedTx = TransactionFactory.fromTxData({
      data: transaction.data?.toString(),
      to: transaction.to,
      accessList: [],
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas
        ? ethers.BigNumber.from(transaction.maxPriorityFeePerGas).toHexString()
        : undefined,
      maxFeePerGas: transaction.maxFeePerGas
        ? ethers.BigNumber.from(transaction.maxFeePerGas).toHexString()
        : undefined,
      gasLimit: transaction.gasLimit
        ? ethers.BigNumber.from(transaction.gasLimit).toHexString()
        : undefined,
      value: transaction.value
        ? ethers.BigNumber.from(transaction.value).toHexString()
        : undefined,
      nonce: transaction.nonce
        ? ethers.BigNumber.from(transaction.nonce).toHexString()
        : undefined,
      chainId: transaction.chainId
        ? ethers.BigNumber.from(transaction.chainId).toHexString()
        : undefined,
      type: transaction.type
        ? ethers.BigNumber.from(transaction.type).toHexString()
        : undefined,
    });

    const signedTx = typedTx.sign(this.#getPrivateKeyBuffer());

    const serializedTx = signedTx.serialize();
    const rawSignedTx = bytesToHex(serializedTx);
    return addHexPrefix(rawSignedTx);
  }

  connect(provider: ethers.providers.Provider): ethers.Signer {
    return new RainbowSigner(
      provider,
      this.privateKey! as PrivateKey,
      this.address! as Address,
    );
  }
}
