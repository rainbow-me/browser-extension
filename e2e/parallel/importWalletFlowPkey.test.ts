import { describe, it } from 'vitest';

import { checkWalletName, importWalletFlow } from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

describe('Import wallet with a private key flow', () => {
  it('should be able import a wallet via private key', async () => {
    await importWalletFlow(
      driver,
      rootURL,
      TEST_VARIABLES.PRIVATE_KEY_WALLET.SECRET,
    );
  });
  it('should display account name', async () => {
    await checkWalletName(
      driver,
      rootURL,
      TEST_VARIABLES.PRIVATE_KEY_WALLET.ADDRESS,
    );
  });
});
