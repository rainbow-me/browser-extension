/* eslint-disable no-await-in-loop */
import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  delayTime,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  importWalletFlow,
  initDriverWithOptions,
} from '../helpers';
import { TEST_VARIABLES } from '../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Visit NFTs Gallery and Details Pages', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });
  afterAll(async () => await driver.quit());

  it('should be able import a wallet via seed', async () => {
    await importWalletFlow(driver, rootURL, TEST_VARIABLES.EMPTY_WALLET.SECRET);
  });

  it('should be able to navigate to NFT details', async () => {
    await goToPopup(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'bottom-tab-nfts', driver });
    await delayTime('short');
    await findElementByTestIdAndClick({
      id: 'nft-thumbnail-https://lh3.googleusercontent.com/ICZJsSKEfLTquCvn1o-W7wD75EdtCksjf3bMtm2IQsYdw7K8-_de9gGQBXJE09fHy33OtBBrgWqMUAfX2ve6ZsW200JnLrX-m3s=s1000-0',
      driver,
    });
    const nftName = await findElementByText(driver, 'Citizen 297');
    expect(nftName).toBeTruthy();
  });

  it('should display last sales price', async () => {
    const lastSalesPrice = await findElementByText(driver, '0.0179');
    expect(lastSalesPrice).toBeTruthy();
  });

  it('should display NFT description', async () => {
    const description = await findElementByText(
      driver,
      'Bring your citizen to life',
    );
    expect(description).toBeTruthy();
  });

  it('should display NFT traits', async () => {
    const bodyTrait = await findElementByText(driver, 'ALPINEMIKI');
    expect(bodyTrait).toBeTruthy();
    const materialTrait = await findElementByText(driver, 'ORANGE');
    expect(materialTrait).toBeTruthy();
  });

  it('should display token standard', async () => {
    const tokenStandard = await findElementByText(driver, 'ERC721');
    expect(tokenStandard).toBeTruthy();
  });

  it('should display token contract', async () => {
    const contractAddress = await findElementByText(driver, '0x6171…f23b');
    expect(contractAddress).toBeTruthy();
  });

  it('should display contract creator', async () => {
    const creatorAddress = await findElementByText(driver, 'adworld.eth');
    expect(creatorAddress).toBeTruthy();
  });

  it('should display chain', async () => {
    const networkName = await findElementByText(driver, 'Base');
    expect(networkName).toBeTruthy();
  });

  it('should correctly display external link', async () => {
    const externalLinkButton = await findElementByTestId({
      id: 'nft-link-button-adworld.game',
      driver,
    });
    expect(externalLinkButton).toBeTruthy();
  });

  it('should return back to gallery and select another NFT (ENS)', async () => {
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'nft-thumbnail-https://lh3.googleusercontent.com/O_dtxR4ggdzoCNEAZ89s7w5eBiu8rP5TELBQcuFZyIHc-raU2qj48LSkJmEKeN64JaGa7m9X5EFYUreCCJBlx9lXW0rgjrZUL0E=s1000-1',
      driver,
    });
    const ensName = findElementByText(driver, 'testmar27.eth');
    expect(ensName).toBeTruthy();
  });

  it('should display ens registration date accurately', async () => {
    const registeredLabel = await findElementByText(driver, 'Registered on');
    expect(registeredLabel).toBeTruthy();
    const registeredDate = await findElementByText(driver, 'Mar 27, 2023');
    expect(registeredDate).toBeTruthy();
  });

  it('should display and format ens expiration date', async () => {
    const expirationLabel = await findElementByText(driver, 'Expires in');
    expect(expirationLabel).toBeTruthy();
    const expirationValue = await findElementByTestId({
      id: 'ens-expiry-value',
      driver,
    });
    expect(expirationValue).toBeTruthy();
    const expirationValueText = await expirationValue.getText();
    expect(expirationValueText !== 'Invalid Date');
  });

  it('should be able to sort nfts alphabetically', async () => {
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'nfts-sort-dropdown',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'nfts-sort-option-abc',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'nft-thumbnail-https://lh3.googleusercontent.com/O_dtxR4ggdzoCNEAZ89s7w5eBiu8rP5TELBQcuFZyIHc-raU2qj48LSkJmEKeN64JaGa7m9X5EFYUreCCJBlx9lXW0rgjrZUL0E=s1000-0',
      driver,
    });
    const ensName = findElementByText(driver, 'testmar27.eth');
    expect(ensName).toBeTruthy();
  });

  it('should be able to change nfts display mode', async () => {
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'nfts-displaymode-dropdown',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'nfts-displaymode-option-byCollection',
      driver,
    });
    const ensByCollectionSection = await findElementByTestId({
      id: 'nfts-collection-section-ENS',
      driver,
    });
    expect(ensByCollectionSection).toBeTruthy();
  });
});
