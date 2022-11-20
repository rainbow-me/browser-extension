import { useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { getAccounts } from '../handlers/wallet';

export function useBackgroundAccounts() {
  const [accounts, setAccounts] = useState<Address[]>([]);

  useEffect(() => {
    const get = async () => {
      const accounts = await getAccounts();
      setAccounts(accounts);
    };
    get();
  }, [setAccounts]);

  return { accounts };
}
