import { TEST_VARIABLES } from 'e2e/walletVariables';

export const StaticJsonRpcProvider = class {
  ready: Promise<void>;
  constructor() {
    this.ready = Promise.resolve();
  }

  getBalance(address: string) {
    if (address === TEST_VARIABLES.SEED_WALLET.ADDRESS) {
      return Promise.resolve('1000000000000000000');
    }
    return Promise.resolve('0');
  }
};
