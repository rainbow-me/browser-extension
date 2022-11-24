import { TransactionRequest } from '@ethersproject/abstract-provider';
import { uuid4 } from '@sentry/utils';
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
import { WalletAction } from '~/core/types/walletActions';
import { EthereumWalletSeed } from '~/core/utils/ethereum';

type WalletActionArguments = {
  action: WalletAction;
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
    'wallet_action',
    async ({ action, payload }: WalletActionArguments) => {
      uuid4();
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
          case 'update_password': {
            const { password, newPassword } = payload as {
              password: string;
              newPassword: string;
            };
            response = await setVaultPassword(password, newPassword);

            break;
          }
          case 'wipe':
            response = await wipeVault(payload as string);
            break;
          case 'unlock':
            response = await unlockVault(payload as string);
            break;
          case 'create':
            response = await createWallet();
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
          case 'export_wallet': {
            const { address, password } = payload as {
              address: Address;
              password: string;
            };
            response = await exportKeychain(address, password);
            break;
          }
          case 'export_account': {
            const { address, password } = payload as {
              address: Address;
              password: string;
            };
            response = await exportAccount(address, password);
            break;
          }
          case 'send_transaction': {
            const provider = getProvider();
            response = await sendTransaction(
              payload as TransactionRequest,
              provider,
            );
            break;
          }
          case 'personal_sign':
            response = await signMessage(payload as SignMessageArguments);
            break;
          case 'sign_typed_data':
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
