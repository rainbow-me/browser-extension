import { uuid4 } from '@sentry/utils';

import { initializeMessenger } from '~/core/messengers';

const messenger = initializeMessenger({ connect: 'background' });

export const walletAction = async <T>(action: string, payload: unknown) => {
  const { result, error }: { result: T; error?: string } = await messenger.send(
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
