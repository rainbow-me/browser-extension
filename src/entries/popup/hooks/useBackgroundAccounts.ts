import { useCallback, useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { WalletActions } from '~/core/types/walletActions';

import { walletAction } from '../handlers/wallet';

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
