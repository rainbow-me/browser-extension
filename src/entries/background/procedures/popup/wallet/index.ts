import { accountsHandler } from './accounts';
import { addHandler } from './add';
import { addAccountAtIndexHandler } from './addAccountAtIndex';
import { createHandler } from './create';
import { deriveAccountsFromSecretHandler } from './deriveAccountsFromSecret';
import { exportAccountHandler } from './exportAccount';
import { exportWalletHandler } from './exportWallet';
import { importHandler } from './import';
import { importHardwareHandler } from './importHardware';
import { isMnemonicInVaultHandler } from './isMnemonicInVault';
import { lockHandler } from './lock';
import { pathHandler } from './path';
import { personalSignHandler } from './personalSign';
import { removeHandler } from './remove';
import { sendTransactionHandler } from './sendTransaction';
import { statusHandler } from './status';
import { testSandboxHandler } from './testSandbox';
import { unlockHandler } from './unlock';
import { updatePasswordHandler } from './updatePassword';
import { verifyPasswordHandler } from './verifyPassword';
import { walletHandler } from './wallet';
import { walletsHandler } from './wallets';
import { wipeHandler } from './wipe';

export const walletRouter = {
  status: statusHandler,
  lock: lockHandler,
  updatePassword: updatePasswordHandler,
  unlock: unlockHandler,
  wipe: wipeHandler,
  verifyPassword: verifyPasswordHandler,
  create: createHandler,
  import: importHandler,
  importHardware: importHardwareHandler,
  add: addHandler,
  addAccountAtIndex: addAccountAtIndexHandler,
  remove: removeHandler,
  deriveAccountsFromSecret: deriveAccountsFromSecretHandler,
  isMnemonicInVault: isMnemonicInVaultHandler,
  accounts: accountsHandler,
  wallets: walletsHandler,
  wallet: walletHandler,
  path: pathHandler,
  exportWallet: exportWalletHandler,
  exportAccount: exportAccountHandler,
  sendTransaction: sendTransactionHandler,
  personalSign: personalSignHandler,
  testSandbox: testSandboxHandler,
};
