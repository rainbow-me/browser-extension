import { describe, expect, it } from 'vitest';

import {
  delayTime,
  doNotFindElementByTestId,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  findElementByTextAndClick,
  goToPopup,
  importWalletFlow,
  querySelector,
  transactionStatus,
  waitAndClick,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

describe('should be able to perform the nft send flow', () => {
  it('should be able import a wallet via pk', async ({ driver, rootURL }) => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.SEED_WALLET.PK);
  });

  it('should be able to go to settings', async ({ driver, rootURL }) => {
    await goToPopup(driver, rootURL);
    await findElementByTestIdAndClick({
      id: 'home-page-header-right',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
  });

  it('should be able to connect to hardhat and go to send flow', async ({
    driver,
  }) => {
    const btn = await querySelector(
      driver,
      '[data-testid="connect-to-hardhat"]',
    );
    await waitAndClick(btn, driver);
    const button = await findElementByText(driver, 'Disconnect from Hardhat');
    expect(button).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
  });

  it('should be able to filter nfts and make selection on send flow', async ({
    driver,
  }) => {
    await findElementByTestIdAndClick({ id: 'bottom-tab-nfts', driver });
    await delayTime('very-long');
    const NFTsort = await findElementByTestId({
      id: 'nfts-displaymode-dropdown',
      driver,
    });
    expect(NFTsort).toBeTruthy();
    await findElementByTestIdAndClick({ id: 'header-link-send', driver });
    const input = await findElementByTestId({
      id: 'to-address-input',
      driver,
    });
    await input.sendKeys('rainbowwallet.eth');

    await findElementByTestIdAndClick({
      id: 'input-wrapper-dropdown-token-input',
      driver,
    });
    const assetInput = await findElementByTestId({
      id: 'token-input',
      driver,
    });
    await assetInput.click();
    await assetInput.sendKeys('poap');
    const poapSection = await findElementByTestId({
      id: 'nfts-collection-section-POAP',
      driver,
    });
    const learnWeb3Badges = await doNotFindElementByTestId({
      id: 'nfts-collection-section-LearnWeb3 Badges',
      driver,
    });
    expect(poapSection).toBeTruthy();
    expect(learnWeb3Badges).toBeFalsy();

    await poapSection.click();
    await findElementByTextAndClick(driver, '#7054159');
  });

  it('should be able to go to review on send flow', async ({ driver }) => {
    await findElementByTestIdAndClick({ id: 'send-review-button', driver });
  });

  it('should be able to send transaction on review on send flow', async ({
    driver,
  }) => {
    await findElementByTestIdAndClick({
      id: 'review-confirm-button',
      driver,
    });
    const sendTransaction = await transactionStatus();
    expect(await sendTransaction).toBe('success');
  });
});
