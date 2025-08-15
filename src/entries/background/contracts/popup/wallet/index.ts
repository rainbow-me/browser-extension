import { accountsContract } from './accounts';
import { addContract } from './add';
import { addAccountAtIndexContract } from './addAccountAtIndex';
import { createContract } from './create';
import { deriveAccountsFromSecretContract } from './deriveAccountsFromSecret';
import { exportAccountContract } from './exportAccount';
import { exportWalletContract } from './exportWallet';
import { importContract } from './import';
import { importHardwareContract } from './importHardware';
import { isMnemonicInVaultContract } from './isMnemonicInVault';
import { lockContract } from './lock';
import { pathContract } from './path';
import { personalSignContract } from './personalSign';
import { removeContract } from './remove';
import { sendTransactionContract } from './sendTransaction';
import { statusContract } from './status';
import { testSandboxContract } from './testSandbox';
import { unlockContract } from './unlock';
import { updatePasswordContract } from './updatePassword';
import { verifyPasswordContract } from './verifyPassword';
import { walletContract as getWalletContract } from './wallet';
import { walletsContract } from './wallets';
import { wipeContract } from './wipe';

export const walletContract = {
  status: statusContract,
  lock: lockContract,
  updatePassword: updatePasswordContract,
  unlock: unlockContract,
  wipe: wipeContract,
  verifyPassword: verifyPasswordContract,
  create: createContract,
  import: importContract,
  importHardware: importHardwareContract,
  add: addContract,
  addAccountAtIndex: addAccountAtIndexContract,
  remove: removeContract,
  deriveAccountsFromSecret: deriveAccountsFromSecretContract,
  isMnemonicInVault: isMnemonicInVaultContract,
  accounts: accountsContract,
  wallets: walletsContract,
  wallet: getWalletContract,
  path: pathContract,
  exportWallet: exportWalletContract,
  exportAccount: exportAccountContract,
  sendTransaction: sendTransactionContract,
  personalSign: personalSignContract,
  testSandbox: testSandboxContract,
};
