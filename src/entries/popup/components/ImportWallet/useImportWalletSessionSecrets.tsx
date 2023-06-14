import { useEffect, useState } from 'react';

import { getImportWalletSecrets } from '../../handlers/importWalletSecrets';

export const useImportWalletSessionSecrets = () => {
  const [secrets, setSecrets] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    getImportWalletSecrets().then((secrets) => {
      if (mounted) setSecrets(secrets);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return secrets;
};
