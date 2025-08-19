import { describe, it } from 'vitest';

import { TEST_VARIABLES } from '../fixtures/wallets';
import { importWalletFlow } from '../helpers/onboarding';
import { checkWalletName } from '../helpers/wallet';

describe('Import wallet with a secret phrase flow', () => {
  it('should be able import a wallet via seed', async () => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });
  it('should display account name', async () => {
    await checkWalletName(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.ADDRESS);
  });
  it('should be able import a wallet with a 24 word seed phrase', async () => {
    await importWalletFlow(
      driver,
      rootURL,
      TEST_VARIABLES.SEED_PHRASE_24.SECRET,
      true,
      true,
    );
  });
  it('should display account name of the 24 word seed phrase wallet', async () => {
    await checkWalletName(
      driver,
      rootURL,
      TEST_VARIABLES.SEED_PHRASE_24.ADDRESS,
    );
  });
});
