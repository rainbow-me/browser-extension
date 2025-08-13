import { describe, expect, it } from 'vitest';

import {
  checkWalletName,
  findElementByIdAndClick,
  findElementByTestIdAndClick,
  findElementByText,
  importHardwareWalletFlow,
} from '../helpers';
import { HARDWARE_WALLETS } from '../walletVariables';

const browser = process.env.BROWSER || 'chrome';

describe.runIf(browser !== 'firefox')(
  'Import wallet with a Trezor hw wallet',
  () => {
    it('should be able import a wallet via hw wallet', async ({
      driver,
      rootURL,
    }) => {
      await importHardwareWalletFlow(driver, rootURL, 'trezor');
    });

    it('should display account 0 name', async ({ driver, rootURL }) => {
      await checkWalletName(driver, rootURL, HARDWARE_WALLETS.WALLET_1);
    });

    it('should display hw label on wallet switcher screen', async ({
      driver,
    }) => {
      await findElementByIdAndClick({
        id: 'header-account-name-shuffle',
        driver,
      });
      const hwLabel = await findElementByText(driver, 'Trezor');
      expect(hwLabel).toBeTruthy();
    });

    it('should display account 1 name', async ({ driver, rootURL }) => {
      await findElementByTestIdAndClick({
        id: 'wallet-account-2',
        driver,
      });
      await checkWalletName(driver, rootURL, HARDWARE_WALLETS.WALLET_2);
    });
  },
);
