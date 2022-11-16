import { uuid4 } from '@sentry/utils';
import { useCallback, useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';
import { WalletActions } from '~/core/types/walletActions';

const backgroundMessenger = initializeMessenger({ connect: 'background' });

const walletAction = async (
  action: keyof typeof WalletActions,
  payload: unknown,
) => {
  const { result }: { result: unknown } = await backgroundMessenger.send(
    WalletActions.action,
    {
      action,
      payload,
    },
    { id: uuid4() },
  );
  return result;
};

export function useBackgroundAccounts() {
  const [accounts, setAccounts] = useState<Address[]>([]);
  const getAccounts = useCallback(async () => {
    const accounts = (await walletAction(
      WalletActions.get_accounts,
      {},
    )) as Address[];
    setAccounts(accounts);
  }, []);

  useEffect(() => {
    getAccounts();
  }, [getAccounts]);

  return { accounts };
}
