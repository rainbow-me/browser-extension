import { describe, expect, it } from 'vitest';

import {
  checkWalletName,
  delayTime,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getAllWindowHandles,
  getWindowHandle,
  goToPopup,
  importWalletFlow,
  waitAndClick,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

describe('App interactions flow', () => {
  it('should be able import a wallet via seed', async ({ driver, rootURL }) => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });

  it('should display account name', async ({ driver, rootURL }) => {
    await checkWalletName(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.ADDRESS);
  });

  it('should be able to go to setings', async ({ driver, rootURL }) => {
    await goToPopup(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
  });

  it('should be able to connect to hardhat', async ({ driver }) => {
    await findElementByTestIdAndClick({ id: 'connect-to-hardhat', driver });
    const button = await findElementByText(driver, 'Disconnect from Hardhat');
    expect(button).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
  });

  it('should be able to navigate to the malicious app and click connect', async ({
    driver,
  }) => {
    await delayTime('long');
    await driver.get('https://test-dap-welps.vercel.app/');
    const dappHandler = await getWindowHandle({ driver });

    const button = await findElementByTestId({
      id: 'rk-connect-button',
      driver,
    });
    expect(button).toBeTruthy();
    await waitAndClick(button, driver);

    await delayTime('long');

    await findElementByTestIdAndClick({
      id: 'rk-wallet-option-rainbow',
      driver,
    });
    await delayTime('long');

    const { popupHandler } = await getAllWindowHandles({ driver, dappHandler });
    await driver.switchTo().window(popupHandler);
  });

  it('should be able to navigate to switch to BX and see malicious app warning', async ({
    driver,
  }) => {
    await delayTime('long');
    const dappWarning = await findElementByTestId({
      id: 'malicious-request-warning',
      driver,
    });
    const warningText = await dappWarning.getText();

    const warningText1 = 'This app is likely malicious';
    const warningText2 =
      'Signing messages or transactions from this app could result in losing your assets';

    expect(dappWarning).toBeTruthy();
    expect(warningText).toContain(warningText1);
    expect(warningText).toContain(warningText2);
  });
});
