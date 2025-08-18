import { describe, expect, it } from 'vitest';

import { HARDWARE_WALLETS } from '../fixtures/wallets';
import {
  checkWalletName,
  findElementByIdAndClick,
  findElementByTestIdAndClick,
  findElementByText,
  importHardwareWalletFlow,
} from '../helpers';
import { browser } from '../helpers/environment';

describe.runIf(browser !== 'firefox')(
  'Import wallet with a Trezor hw wallet',
  () => {
    it('should be able import a wallet via hw wallet', async () => {
      await importHardwareWalletFlow(driver, rootURL, 'trezor');
    });

    it('should display account 0 name', async () => {
      await checkWalletName(driver, rootURL, HARDWARE_WALLETS.WALLET_1);
    });

    it('should display hw label on wallet switcher screen', async () => {
      await findElementByIdAndClick({
        id: 'header-account-name-shuffle',
        driver,
      });
      const hwLabel = await findElementByText(driver, 'Trezor');
      expect(hwLabel).toBeTruthy();
    });

    it('should display account 1 name', async () => {
      await findElementByTestIdAndClick({
        id: 'wallet-account-2',
        driver,
      });
      await checkWalletName(driver, rootURL, HARDWARE_WALLETS.WALLET_2);
    });
  },
);
