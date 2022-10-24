import { Signer, Wallet } from 'ethers';
import { HDNode } from 'ethers/lib/utils';
import { Address } from 'wagmi';
import { IKeychain, PrivateKey } from '../IKeychain';

export interface SerializedHdKeychain {
  mnemonic: string;
  hdPath?: string;
  accountsEnabled?: number;
  type: string;
  imported?: boolean;
}

export class HdKeychain implements IKeychain {
  type: string;
  imported: boolean;
  #wallets: Wallet[] | Signer[];
  #mnemonic?: string | null;
  #accountsEnabled: number;
  #hdPath: string;

  constructor(options: SerializedHdKeychain) {
    this.type = 'HdKeychain';
    this.imported = false;
    this.#wallets = [];
    this.#mnemonic = null;
    this.#accountsEnabled = 1;
    this.#hdPath = `m/44'/60'/0'/0`;
    this.deserialize(options);
  }

  #getWalletForAddress(address: Address): Wallet {
    return this.#wallets.find(
      (wallet) =>
        (wallet as Wallet).address.toLowerCase() === address.toLowerCase(),
    ) as Wallet;
  }

  getSigner(address: Address): Signer {
    const wallet = this.#getWalletForAddress(address);
    return wallet;
  }

  async serialize(): Promise<SerializedHdKeychain> {
    return {
      imported: this.imported,
      mnemonic: this.#mnemonic as string,
      accountsEnabled: this.#accountsEnabled,
      hdPath: this.#hdPath,
      type: this.type,
    };
  }

  async deserialize(opts: SerializedHdKeychain) {
    if (opts.hdPath) this.#hdPath = opts.hdPath;
    if (opts.imported) this.imported = opts.imported;
    if (opts.accountsEnabled) this.#accountsEnabled = opts.accountsEnabled;

    if (opts.mnemonic) {
      this.#mnemonic = opts.mnemonic;
    } else {
      this.#mnemonic = Wallet.createRandom().mnemonic.phrase as string;
    }
    const results = [];
    for (let i = 0; i < this.#accountsEnabled; i++) {
      results.push(this.#addAccount(i));
    }
    await Promise.all(results);
  }
  async addNewAccount(): Promise<Array<Wallet>> {
    await this.#addAccount(this.#accountsEnabled);
    this.#accountsEnabled += 1;
    return this.#wallets as Wallet[];
  }

  async #addAccount(index: number): Promise<Wallet> {
    const hdNode = HDNode.fromMnemonic(this.#mnemonic as string);
    const derivedWallet = hdNode.derivePath(`${this.#hdPath}/${index}`);
    const wallet = new Wallet(derivedWallet.privateKey);
    this.#wallets.push(wallet);
    return wallet;
  }

  getAccounts(): Promise<Array<Address>> {
    const addresses = this.#wallets.map(
      (wallet) => (wallet as Wallet).address as Address,
    );
    return Promise.resolve(addresses);
  }

  async exportAccount(address: Address): Promise<PrivateKey> {
    const wallet = this.#getWalletForAddress(address);
    return wallet.privateKey;
  }

  async exportKeychain(): Promise<string> {
    return this.#mnemonic as string;
  }

  async removeAccount(address: Address): Promise<void> {
    const filteredList = this.#wallets.filter(
      (wallet) => (wallet as Wallet).address !== address,
    );
    if (filteredList.length !== this.#wallets.length) {
      this.#wallets = filteredList;
    } else {
      throw new Error('Account not found');
    }
  }
}
