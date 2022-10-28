import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Bytes, TypedDataDomain, TypedDataField } from 'ethers';
import { Address } from 'wagmi';

import {
  addNewAccount,
  createWallet,
  exportAccount,
  exportKeychain,
  getAccounts,
  hasVault,
  importWallet,
  isVaultUnlocked,
  lockVault,
  removeAccount,
  sendTransaction,
  setVaultPassword,
  signMessage,
  signTypedData,
  unlockVault,
  verifyPassword,
  wipeVault,
} from '~/core/keychain';
import { keychainManager } from '~/core/keychain/KeychainManager';
import { initializeMessenger } from '~/core/messengers';
import { EthereumWalletSeed } from '~/core/utils/ethereum';

type WalletActionArguments = {
  action: string;
  payload: unknown;
};

export type SendTransactionArguments = {
  address: Address;
  txData: TransactionRequest;
};
export type SignMessageArguments = {
  address: Address;
  msgData: string | Bytes;
};
export type SignTypedDataArguments = {
  address: Address;
  msgData: SignTypedDataMsg;
};

type SignTypedDataMsg = {
  domain: TypedDataDomain;
  types: Record<string, Array<TypedDataField>>;
  value: Record<string, unknown>;
};

const messenger = initializeMessenger({ connect: 'popup' });

/**
 * Handles wallet related requests
 */
export const handleWallets = () =>
  messenger.reply(
    'wallet_action',
    async ({ action, payload }: WalletActionArguments) => {
      console.debug(keychainManager);
      try {
        let response = null;
        switch (action) {
          case 'status':
            response = {
              hasVault: await hasVault(),
              unlocked: await isVaultUnlocked(),
            };
            break;
          case 'lock':
            response = await lockVault();
            break;
          case 'set_password':
            if (!hasVault()) {
              response = await setVaultPassword(payload as string);
            } else {
              throw new Error('Vault already exists');
            }
            break;
          case 'update_password': {
            const { oldPassword, newPassword } = payload as {
              oldPassword: string;
              newPassword: string;
            };

            if (verifyPassword(oldPassword)) {
              response = await setVaultPassword(newPassword);
            } else {
              throw new Error('Incorrect password');
            }

            break;
          }
          case 'wipe':
            response = await wipeVault();
            break;
          case 'unlock':
            response = await unlockVault(payload as string);
            break;
          case 'create':
            response = await createWallet();
            console.log('Created wallet', response);
            break;
          case 'import':
            response = await importWallet(payload as EthereumWalletSeed);
            break;
          case 'add':
            response = await addNewAccount(payload as Address);
            break;
          case 'remove':
            response = await removeAccount(payload as Address);
            break;
          case 'get_accounts':
            response = await getAccounts();
            break;
          case 'export_wallet':
            response = await exportKeychain(payload as Address);
            break;
          case 'export_account':
            response = await exportAccount(payload as Address);
            break;
          case 'send_transaction':
            response = await sendTransaction(
              payload as SendTransactionArguments,
            );
            break;
          case 'sign_message':
            response = await signMessage(payload as SignMessageArguments);
            break;
          case 'sign_type_data':
            response = await signTypedData(payload as SignTypedDataArguments);
            break;
          default: {
            // TODO: handle other methods
          }
        }
        return { result: response };
      } catch (error) {
        console.log('Error handling wallet action', action, error);
        return { action, error: <Error>error };
      }
    },
  );
