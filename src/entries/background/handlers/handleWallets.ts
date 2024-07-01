import { TransactionRequest } from '@ethersproject/abstract-provider';
import {
  TypedDataDomain,
  TypedDataField,
} from '@ethersproject/abstract-signer';
import { Bytes } from '@ethersproject/bytes';
import { ChainId } from '@rainbow-me/swaps';
import { Address } from 'viem';

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
  isMnemonicInVault,
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
import { flashbotsEnabledStore } from '~/core/state';
import { WalletAction } from '~/core/types/walletActions';
import { EthereumWalletSeed } from '~/core/utils/ethereum';
import { getFlashbotsProvider } from '~/core/utils/flashbots';
import { wagmiConfig } from '~/core/wagmi';
import { getProvider } from '~/core/wagmi/clientToProvider';

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
            const ready = await isInitialized();
            const _hasVault = ready && (await hasVault());
            const unlocked = _hasVault && (await isVaultUnlocked());
            const passwordSet = _hasVault && (await isPasswordSet());
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
                wallets: Array<{
                  address: Address;
                  index: number;
                  hdPath: string;
                }>;
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
            const { siblingAddress, index, address } = payload as {
              siblingAddress: Address;
              index: number;
              address: Address;
            };

            response = await addAccountAtIndex(siblingAddress, index, address);
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
          case 'is_mnemonic_in_vault':
            response = await isMnemonicInVault(payload as EthereumWalletSeed);
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
            let provider;
            if (
              flashbotsEnabledStore.getState().flashbotsEnabled &&
              (payload as TransactionRequest).chainId === ChainId.mainnet
            ) {
              provider = getFlashbotsProvider();
            } else {
              console.log('get background provider');
              console.log('get background wagmiconfig', wagmiConfig);
              provider = getProvider({
                chainId: (payload as TransactionRequest).chainId,
              });
              console.log(' background provider', provider);
            }
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
              provider = getFlashbotsProvider();
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
        return { error: (error as Error).message };
      }
    },
  );
