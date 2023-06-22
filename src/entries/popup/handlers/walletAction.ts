import { uuid4 } from '@sentry/utils';

import { initializeMessenger } from '~/core/messengers';

const messenger = initializeMessenger({ connect: 'background' });

export const walletAction = async (action: string, payload: unknown) => {
  const { result }: { result: unknown } = await messenger.send(
    'wallet_action',
    {
      action,
      payload,
    },
    { id: uuid4() },
  );
  return result;
};
