import { describe, it } from 'vitest';

import { checkWalletName, importWalletFlow } from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

describe('Import wallet with a secret phrase flow', () => {
  it('should be able import a wallet via seed', async ({ driver, rootURL }) => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });
  it('should display account name', async ({ driver, rootURL }) => {
    await checkWalletName(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.ADDRESS);
  });
  it('should be able import a wallet with a 24 word seed phrase', async ({
    driver,
    rootURL,
  }) => {
    await importWalletFlow(
      driver,
      rootURL,
      TEST_VARIABLES.SEED_PHRASE_24.SECRET,
      true,
      true,
    );
  });
  it('should display account name of the 24 word seed phrase wallet', async ({
    driver,
    rootURL,
  }) => {
    await checkWalletName(
      driver,
      rootURL,
      TEST_VARIABLES.SEED_PHRASE_24.ADDRESS,
    );
  });
});
