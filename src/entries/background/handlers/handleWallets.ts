import {
  TypedDataDomain,
  TypedDataField,
} from '@ethersproject/abstract-signer';
import { Address, ByteArray } from 'viem';

import { executeRap, signTypedData } from '~/core/keychain';
import { initializeMessenger } from '~/core/messengers';
import { WalletExecuteRapProps } from '~/core/raps/references';
import { WalletAction } from '~/core/types/walletActions';
import { getProvider } from '~/core/wagmi/clientToProvider';

type WalletActionArguments = {
  action: WalletAction;
  payload: unknown;
};

export type SignMessageArguments = {
  address: Address;
  msgData: string | ByteArray;
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
          // TODO: needs to be refactored as part of a bigger rap refactor
          case 'execute_rap': {
            const p = payload as WalletExecuteRapProps;
            const provider = getProvider({
              chainId: p.rapActionParameters.chainId,
            });
            response = await executeRap({
              ...p,
              provider,
            });
            break;
          }
          // TODO: needs to be refactored as part of a bigger signTypedData refactor
          case 'sign_typed_data': {
            response = await signTypedData(payload as SignTypedDataArguments);
            break;
          }

          case 'status':
          case 'lock':
          case 'update_password':
          case 'wipe':
          case 'unlock':
          case 'verify_password':
          case 'create':
          case 'import':
          case 'import_hw':
          case 'add':
          case 'add_account_at_index':
          case 'remove':
          case 'derive_accounts_from_secret':
          case 'is_mnemonic_in_vault':
          case 'get_accounts':
          case 'get_wallets':
          case 'get_wallet':
          case 'get_path':
          case 'export_wallet':
          case 'export_account':
          case 'send_transaction':
          case 'personal_sign':
          case 'test_sandbox':
            console.warn(`Deprecated action: ${action}`);
            throw new Error(`Deprecated action: ${action}`);
          default: {
            throw new Error(`Unknown action: ${action}`);
          }
        }
        return { result: response };
      } catch (error) {
        return { error: (error as Error).message };
      }
    },
  );
