import { uuid4 } from '@sentry/core';
import { Address, ByteArray } from 'viem';

import { initializeMessenger } from '~/core/messengers';
import { WalletExecuteRapProps } from '~/core/raps/references';
import { ExecuteRapResponse } from '~/core/types/transactions';

const messenger = initializeMessenger({ connect: 'background' });

type WalletActionPayload = {
  sign_typed_data: {
    address: Address;
    msgData: string | ByteArray;
  };
  execute_rap: WalletExecuteRapProps;
};

type WalletActionResponse = {
  sign_typed_data: string;
  execute_rap: ExecuteRapResponse;
};

type WalletActionType = keyof WalletActionPayload;

export const walletAction = async <T extends WalletActionType>(
  action: T,
  payload: WalletActionPayload[T],
): Promise<WalletActionResponse[T]> => {
  const { result, error }: { result: WalletActionResponse[T]; error?: string } =
    await messenger.send(
      'wallet_action',
      {
        action,
        payload,
      },
      { id: uuid4() },
    );
  if (error) throw new Error(error);
  return result;
};
