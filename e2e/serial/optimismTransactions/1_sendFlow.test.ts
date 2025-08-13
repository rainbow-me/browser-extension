import { describe, expect, it } from 'vitest';

import {
  checkExtensionURL,
  checkWalletName,
  delay,
  delayTime,
  executePerformShortcut,
  findElementByTestId,
  findElementByText,
  goToPopup,
  importWalletFlowUsingKeyboardNavigation,
  navigateToElementWithTestId,
  transactionStatus,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

describe('Complete Hardhat Optimism send flow', () => {
  it('should be able import a wallet via pk', async ({ driver, rootURL }) => {
    await importWalletFlowUsingKeyboardNavigation(
      driver,
      rootURL,
      TEST_VARIABLES.SEED_WALLET.PK,
    );
  });

  it('should display account name', async ({ driver, rootURL }) => {
    await checkWalletName(driver, rootURL, TEST_VARIABLES.SEED_WALLET.ADDRESS);
  });

  it('should be able to go to setings', async ({ driver, rootURL }) => {
    await goToPopup(driver, rootURL);
    await executePerformShortcut({ driver, key: 'DECIMAL' });
    await executePerformShortcut({ driver, key: 'ARROW_DOWN' });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'settings');
  });

  it('should be able to connect to hardhat Optimism', async ({ driver }) => {
    await navigateToElementWithTestId({
      driver,
      testId: 'connect-to-hardhat-op',
    });
    const button = await findElementByText(
      driver,
      'Disconnect from Hardhat Optimism',
    );
    expect(button).toBeTruthy();
    await executePerformShortcut({ driver, key: 'ESCAPE' });
  });

  it('should be able to navigate to send', async ({ driver }) => {
    await executePerformShortcut({ driver, key: 's' });
    await checkExtensionURL(driver, 'send');
  });

  it('should be able to nav to send field and type in address', async ({
    driver,
  }) => {
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 2 });
    await driver
      .actions()
      .sendKeys('0x9126914f62314402cC3f098becfaa7c2Bc23a55C')
      .perform();
    const shortenedAddress = await findElementByText(driver, '0x9126…a55C');
    expect(shortenedAddress).toBeTruthy();
  });

  it('should be able to select asset to send with keyboard', async ({
    driver,
  }) => {
    await navigateToElementWithTestId({
      driver,
      testId: 'asset-name-0x0000000000000000000000000000000000000000_10',
    });
    await delayTime('long');
    const tokenInput = await findElementByTestId({
      id: 'input-wrapper-dropdown-token-input',
      driver,
    });
    expect(await tokenInput.getText()).toContain('Ethereum');
    const value = await findElementByTestId({ id: 'send-input-mask', driver });
    const valueNum = await value.getAttribute('value');
    expect(Number(valueNum)).toBe(0);
  });

  it('should be able to initiate Optimisim ETH transaction', async ({
    driver,
  }) => {
    await driver.actions().sendKeys('1').perform();
    const value = await findElementByTestId({ id: 'send-input-mask', driver });
    const valueNum = await value.getAttribute('value');
    expect(Number(valueNum)).toBe(1);
    await navigateToElementWithTestId({ driver, testId: 'send-review-button' });
    const reviewText = await findElementByText(driver, 'Review & Send');
    expect(reviewText).toBeTruthy();
    await delayTime('medium');
    await navigateToElementWithTestId({ driver, testId: 'L2-check-1' });
    await navigateToElementWithTestId({
      driver,
      testId: 'review-confirm-button',
    });
    await delayTime('very-long');
    const sendTransaction = await transactionStatus();
    expect(sendTransaction).toBe('success');
    await delay(10000);
  });
});
