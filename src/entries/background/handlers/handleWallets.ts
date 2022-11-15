import { TransactionRequest } from '@ethersproject/abstract-provider';
import { getProvider } from '@wagmi/core';
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
  wipeVault,
} from '~/core/keychain';
import { keychainManager } from '~/core/keychain/KeychainManager';
import { initializeMessenger } from '~/core/messengers';
import { WalletActions } from '~/core/types/walletActions';
import { EthereumWalletSeed } from '~/core/utils/ethereum';

type WalletActionArguments = {
  action: string;
  payload: unknown;
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
  value?: Record<string, unknown>;
  primaryType?: string;
  message?: unknown;
};

const messenger = initializeMessenger({ connect: 'popup' });

/**
 * Handles wallet related requests
 */
export const handleWallets = () =>
  messenger.reply(
    WalletActions.action,
    async ({ action, payload }: WalletActionArguments) => {
      console.debug(keychainManager);
      try {
        let response = null;
        switch (action) {
          case WalletActions.status:
            response = {
              hasVault: await hasVault(),
              unlocked: await isVaultUnlocked(),
            };
            break;
          case WalletActions.lock:
            response = await lockVault();
            break;
          case WalletActions.update_password: {
            const { password, newPassword } = payload as {
              password: string;
              newPassword: string;
            };
            response = await setVaultPassword(password, newPassword);

            break;
          }
          case WalletActions.wipe:
            response = await wipeVault(payload as string);
            break;
          case WalletActions.unlock:
            response = await unlockVault(payload as string);
            break;
          case WalletActions.create:
            response = await createWallet();
            break;
          case WalletActions.import:
            response = await importWallet(payload as EthereumWalletSeed);
            break;
          case WalletActions.add:
            response = await addNewAccount(payload as Address);
            break;
          case WalletActions.remove:
            response = await removeAccount(payload as Address);
            break;
          case WalletActions.get_accounts:
            response = await getAccounts();
            break;
          case WalletActions.export_wallet: {
            const { address, password } = payload as {
              address: Address;
              password: string;
            };
            response = await exportKeychain(address, password);
            break;
          }
          case WalletActions.export_account: {
            const { address, password } = payload as {
              address: Address;
              password: string;
            };
            response = await exportAccount(address, password);
            break;
          }
          case WalletActions.send_transaction: {
            const provider = getProvider();
            response = await sendTransaction(
              payload as TransactionRequest,
              provider,
            );
            break;
          }
          case WalletActions.personal_sign:
            response = await signMessage(payload as SignMessageArguments);
            break;
          case WalletActions.sign_typed_data:
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
