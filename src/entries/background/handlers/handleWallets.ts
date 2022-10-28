import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Bytes, TypedDataDomain, TypedDataField } from 'ethers';
import { Address } from 'wagmi';

import {
  addNewAccount,
  createWallet,
  deleteWallet,
  exportAccount,
  exportKeychain,
  getAccounts,
  getSigner,
  importWallet,
  sendTransaction,
  signMessage,
  signTypedData,
} from '~/core/keychain';
import { extensionMessenger } from '~/core/messengers';
import { EthereumWalletSeed } from '~/core/utils/ethereum';

type WalletActionArguments = {
  action_name: string;
  args: unknown;
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

/**
 * Handles wallet related requests
 */
export const handleWallets = () =>
  extensionMessenger.reply(
    'wallet_action',
    async ({ action_name, args }: WalletActionArguments): Promise<unknown> => {
      switch (action_name) {
        case 'create':
          return await createWallet();
        case 'import':
          return await importWallet(args as EthereumWalletSeed);
        case 'add':
          return await addNewAccount(args as Address);
        case 'delete':
          return await deleteWallet(args as Address);
        case 'get_accounts':
          return await getAccounts();
        case 'export_keychain':
          return await exportKeychain(args as Address);
        case 'export_account':
          return await exportAccount(args as Address);
        case 'send_transaction':
          return await sendTransaction(args as SendTransactionArguments);
        case 'sign_message':
          return await signMessage(args as SignMessageArguments);
        case 'sign_type_data':
          return await signTypedData(args as SignTypedDataArguments);
        default:
          throw new Error('Wallet action not recognized.');
      }
    },
  );
