const KeyPairKeychain = {};
const HdKeychain = {};

import Encryptor from '@metamask/browser-passworder';

type Keychain = typeof KeyPairKeychain | typeof HdKeychain;

export class KeychainManager {
  store: unknown;
  memStore: unknown;
  encryptor: typeof Encryptor;
  keyrings: Array<Keychain>;

  constructor() {
    this.store = {};
    this.memStore = {};
    this.encryptor = Encryptor;
    this.keyrings = [];
  }

  unlock() {}
  restore() {}
}
