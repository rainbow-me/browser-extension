import { Address, Hex } from 'viem';

import { WalletExecuteRapProps } from '~/core/raps/references';
import { TypedDataMessage } from '~/core/types/messageSigning';
import { ExecuteRapResponse } from '~/core/types/transactions';

import { popupClient } from './background';

type WalletActionPayload =
  | {
      action: 'sign_typed_data';
      payload: { address: Address; message: TypedDataMessage };
    }
  | { action: 'execute_rap'; payload: WalletExecuteRapProps };

export const walletAction = async (
  input: WalletActionPayload,
): Promise<Hex | ExecuteRapResponse> => {
  const response = await popupClient.wallet.walletAction(
    input as Parameters<typeof popupClient.wallet.walletAction>[0],
  );

  if ('result' in response) {
    return response.result as Hex | ExecuteRapResponse;
  }
  throw new Error('Wallet action failed');
};

// Type-safe wrappers for each action
export const signTypedDataAction = async (
  address: Address,
  message: TypedDataMessage,
): Promise<Hex> => {
  const result = await walletAction({
    action: 'sign_typed_data',
    payload: { address, message },
  });
  return result as Hex;
};

export const executeRapAction = async (
  params: WalletExecuteRapProps,
): Promise<ExecuteRapResponse> => {
  const result = await walletAction({
    action: 'execute_rap',
    payload: params,
  });
  return result as ExecuteRapResponse;
};
