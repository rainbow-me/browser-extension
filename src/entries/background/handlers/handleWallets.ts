import { TransactionRequest } from '@ethersproject/abstract-provider';
import {
  TypedDataDomain,
  TypedDataField,
} from '@ethersproject/abstract-signer';
import { Bytes } from '@ethersproject/bytes';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { ChainId } from '@rainbow-me/swaps';
import { getProvider } from '@wagmi/core';
import { Address } from 'wagmi';

import {
  addAccountAtIndex,
  addNewAccount,
  createWallet,
  deriveAccountsFromSecret,
  executeRap,
  exportAccount,
  exportKeychain,
  getAccounts,
  getPath,
  getWallet,
  getWallets,
  hasVault,
  importHardwareWallet,
  importWallet,
  isInitialized,
  isPasswordSet,
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
import { initializeMessenger } from '~/core/messengers';
import { WalletExecuteRapProps } from '~/core/raps/references';
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
      try {
        let response = null;
        switch (action) {
          case 'status': {
            const _hasVault = await hasVault();
            const unlocked = _hasVault && (await isVaultUnlocked());
            const passwordSet = _hasVault && (await isPasswordSet());
            const ready = await isInitialized();
            response = {
              hasVault: _hasVault,
              unlocked,
              passwordSet,
              ready,
            };
            break;
          }
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
            response = await wipeVault();
            break;
          case 'unlock':
            response = await unlockVault(payload as string);
            break;
          case 'verify_password':
            response = await verifyPassword(payload as string);
            break;
          case 'create':
            response = await createWallet();
            break;
          case 'import':
            response = await importWallet(payload as EthereumWalletSeed);
            break;
          case 'import_hw':
            response = await importHardwareWallet(
              payload as {
                wallets: Array<{ address: Address; index: number }>;
                vendor: string;
                deviceId: string;
                accountsEnabled: number;
              },
            );
            break;
          case 'add':
            response = await addNewAccount(payload as Address);
            break;
          case 'add_account_at_index': {
            const { silbingAddress, index, address } = payload as {
              silbingAddress: Address;
              index: number;
              address: Address;
            };

            response = await addAccountAtIndex(silbingAddress, index, address);
            break;
          }
          case 'remove':
            response = await removeAccount(payload as Address);
            break;
          case 'derive_accounts_from_secret':
            response = await deriveAccountsFromSecret(
              payload as EthereumWalletSeed,
            );
            break;
          case 'get_accounts':
            response = await getAccounts();
            break;
          case 'get_wallets':
            response = await getWallets();
            break;
          case 'get_wallet':
            response = await getWallet(payload as Address);
            break;
          case 'get_path':
            response = await getPath(payload as Address);
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
            const provider = getProvider({
              chainId: (payload as TransactionRequest).chainId,
            });
            response = await sendTransaction(
              payload as TransactionRequest,
              provider,
            );
            break;
          }
          case 'execute_rap': {
            const p = payload as WalletExecuteRapProps;
            let provider;
            if (
              p.rapActionParameters.flashbots &&
              p.rapActionParameters.chainId === ChainId.mainnet
            ) {
              provider = new StaticJsonRpcProvider(
                'https://rpc.flashbots.net',
                'mainnet',
              );
            } else {
              provider = getProvider({
                chainId: p.rapActionParameters.chainId,
              });
            }
            response = await executeRap({
              ...p,
              provider,
            });
            break;
          }
          case 'personal_sign':
            response = await signMessage(payload as SignMessageArguments);
            break;
          case 'sign_typed_data':
            response = await signTypedData(payload as SignTypedDataArguments);
            break;
          case 'test_sandbox':
            {
              try {
                console.log('about to leak...');
                const r = await fetch('https://api.ipify.org?format=json');
                const res = await r.json();
                console.log('response from server after leaking', res);
                response = 'Background leaked!';
              } catch (e) {
                response = 'Background sandboxed!';
              }
            }
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
