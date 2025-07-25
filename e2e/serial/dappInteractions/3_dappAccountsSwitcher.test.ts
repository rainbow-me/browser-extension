import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { ChainId } from '~/core/types/chains';

import {
  clickAcceptRequestButton,
  connectToTestDapp,
  delayTime,
  fillPrivateKey,
  findElementByIdAndClick,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  getTextFromText,
  goToPopup,
  goToTestApp,
  goToWelcome,
  initDriverWithOptions,
  querySelector,
  shortenAddress,
  switchWallet,
  takeScreenshotOnFailure,
  typeOnTextInput,
  waitAndClick,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe.runIf(browser !== 'firefox')('Dapp accounts switcher flow', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });

  beforeEach<{ driver: WebDriver }>(async (context) => {
    context.driver = driver;
  });

  afterEach<{ driver: WebDriver }>(async (context) => {
    await takeScreenshotOnFailure(context);
  });

  afterAll(() => driver?.quit());

  it('should be able import a wallet via pk', async () => {
    //  Start from welcome screen
    await goToWelcome(driver, rootURL);
    await findElementByTestIdAndClick({
      id: 'import-wallet-button',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'import-wallet-option',
      driver,
    });

    await findElementByTestIdAndClick({
      id: 'import-via-pkey-option',
      driver,
    });

    await fillPrivateKey(driver, TEST_VARIABLES.SEED_WALLET.PK);

    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });
    await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
    await typeOnTextInput({
      id: 'confirm-password-input',
      driver,
      text: 'test1234',
    });
    await findElementByTestIdAndClick({ id: 'set-password-button', driver });
    await delayTime('long');
    await findElementByText(driver, 'Rainbow is ready to use');
  });

  it('should be able to go to setings', async () => {
    await goToPopup(driver, rootURL);
    await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
    await findElementByTestIdAndClick({ id: 'settings-link', driver });
  });

  it.todo('should be able to set rainbow as default wallet', async () => {
    await findElementByTestIdAndClick({
      id: 'set-rainbow-default-toggle',
      driver,
    });
  });

  it('should be able to connect to hardhat', async () => {
    await findElementByTestIdAndClick({ id: 'connect-to-hardhat', driver });
    const button = await findElementByText(driver, 'Disconnect from Hardhat');
    expect(button).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
  });

  it('should be able to add a new wallet via pk 2', async () => {
    await goToPopup(driver, rootURL, '#/home');
    await findElementByIdAndClick({
      id: 'header-account-name-shuffle',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });
    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });

    await findElementByTestIdAndClick({
      id: 'import-via-pkey-option',
      driver,
    });

    await fillPrivateKey(driver, TEST_VARIABLES.PRIVATE_KEY_WALLET_2.SECRET);

    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });
  });

  it('should be able to add a new wallet via pk 3', async () => {
    await goToPopup(driver, rootURL, '#/home');
    await findElementByIdAndClick({
      id: 'header-account-name-shuffle',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });
    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });

    await findElementByTestIdAndClick({
      id: 'import-via-pkey-option',
      driver,
    });

    await fillPrivateKey(driver, TEST_VARIABLES.PRIVATE_KEY_WALLET_3.SECRET);

    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });
  });

  it('should be able to switch to the first pk wallet', async () => {
    await delayTime('medium');
    await switchWallet(TEST_VARIABLES.SEED_WALLET.ADDRESS, rootURL, driver);
    await delayTime('very-long');
    const wallet = await getTextFromText({ id: 'account-name', driver });
    expect(wallet).toBe(shortenAddress(TEST_VARIABLES.SEED_WALLET.ADDRESS));
  });

  it('should be able to connect to bx test dapp', async () => {
    const { dappHandler } = await connectToTestDapp(driver);

    // switch account
    await findElementByTestIdAndClick({ id: 'switch-wallet-menu', driver });
    await findElementByTestIdAndClick({ id: 'switch-wallet-item-2', driver });
    // switch network
    await findElementByTestIdAndClick({ id: 'switch-network-menu', driver });
    await findElementByTestIdAndClick({
      id: `switch-network-item-${ChainId.mainnet}`,
      driver,
    });

    await delayTime('medium');
    await clickAcceptRequestButton(driver);

    await driver.switchTo().window(dappHandler);
    const topButton = await querySelector(
      driver,
      '[data-testid="rk-account-button"]',
    );

    expect(topButton).toBeTruthy();
    await waitAndClick(topButton, driver);

    const ensLabel = await querySelector(driver, '[id="rk_profile_title"]');
    expect(ensLabel).toBeTruthy();
  });

  it('should be able to go back to extension, switch account and connect from nudge sheet', async () => {
    await switchWallet(TEST_VARIABLES.SEED_WALLET.ADDRESS, rootURL, driver);
    await delayTime('long');
    const appConnectionNudgeSheet = await findElementByTestId({
      id: 'app-connection-nudge-sheet',
      driver,
    });
    expect(appConnectionNudgeSheet).toBeTruthy();
    await findElementByTestIdAndClick({ id: 'nudge-sheet-connect', driver });
    await findElementByTestIdAndClick({ id: 'home-page-header-left', driver });
    await findElementByTestIdAndClick({
      id: 'app-connection-menu-connected-apps',
      driver,
    });
    const appConnectionRow = await findElementByTestId({
      id: `connected-app-bx-test-dapp.vercel.app-${shortenAddress(
        TEST_VARIABLES.SEED_WALLET.ADDRESS,
      )}`,
      driver,
    });
    expect(appConnectionRow).toBeTruthy();
  });

  it('should be able to go back to extension, switch account and connect from nudge banner', async () => {
    await switchWallet(
      TEST_VARIABLES.PRIVATE_KEY_WALLET_3.ADDRESS,
      rootURL,
      driver,
    );
    await delayTime('long');
    await delayTime('medium');
    const appConnectionNudgeBaner = await findElementByTestId({
      id: 'app-connection-nudge-banner',
      driver,
    });
    expect(appConnectionNudgeBaner).toBeTruthy();
    await findElementByTestIdAndClick({ id: 'nudge-banner-connect', driver });

    await findElementByTestIdAndClick({ id: 'home-page-header-left', driver });
    await findElementByTestIdAndClick({
      id: 'app-connection-menu-connected-apps',
      driver,
    });
    const appConnectionRow = await findElementByTestId({
      id: `connected-app-bx-test-dapp.vercel.app-${shortenAddress(
        TEST_VARIABLES.PRIVATE_KEY_WALLET_3.ADDRESS,
      )}`,
      driver,
    });
    expect(appConnectionRow).toBeTruthy();
  });

  it('should be able to disconnect', async () => {
    await findElementByTestIdAndClick({
      id: `connected-app-bx-test-dapp.vercel.app-${shortenAddress(
        TEST_VARIABLES.PRIVATE_KEY_WALLET_3.ADDRESS,
      )}`,
      driver,
    });
    await findElementByTestIdAndClick({
      id: `switch-network-menu-disconnect`,
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'navbar-button-with-back',
      driver,
    });
  });

  it('should be able to connect to bx test dapp again', async () => {
    const { dappHandler } = await connectToTestDapp(driver);

    await clickAcceptRequestButton(driver);

    await driver.switchTo().window(dappHandler);
    const topButton = await querySelector(
      driver,
      '[data-testid="rk-account-button"]',
    );

    expect(topButton).toBeTruthy();
    await waitAndClick(topButton, driver);

    const ensLabel = await querySelector(driver, '[id="rk_profile_title"]');
    expect(ensLabel).toBeTruthy();
  });

  it('should be able to go back to extension and go to switch wallets prompt', async () => {
    await switchWallet(TEST_VARIABLES.SEED_WALLET.ADDRESS, rootURL, driver);
    await delayTime('long');
    const appConnectionNudgeSheet = await findElementByTestId({
      id: 'app-connection-nudge-sheet',
      driver,
    });
    expect(appConnectionNudgeSheet).toBeTruthy();
    await findElementByTestIdAndClick({
      id: 'nudge-sheet-connect-different-wallet',
      driver,
    });
    const switchWalletsPrompt = await findElementByTestId({
      id: 'app-connection-wallet-switcher',
      driver,
    });
    expect(switchWalletsPrompt).toBeTruthy();
  });

  it('should be able to change connected network chain', async () => {
    await findElementByTestIdAndClick({
      id: `app-connection-wallet-item-dropdown-menu-${TEST_VARIABLES.PRIVATE_KEY_WALLET_3.ADDRESS}`,
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'app-interaction-switch-networks',
      driver,
    });
    await findElementByTestIdAndClick({
      id: `switch-network-item-${ChainId.optimism}`,
      driver,
    });
    const walletItemBadge = await findElementByTestId({
      id: `app-connection-wallet-item-badge-${TEST_VARIABLES.PRIVATE_KEY_WALLET_3.ADDRESS}-${ChainId.optimism}`,
      driver,
    });
    expect(walletItemBadge).toBeTruthy();
  });

  it('should be able to connect another account and change network', async () => {
    const activeSeedWallet = await findElementByTestId({
      id: `app-connection-wallet-item-${TEST_VARIABLES.PRIVATE_KEY_WALLET_3.ADDRESS}-active`,
      driver,
    });
    expect(activeSeedWallet).toBeTruthy();
    await findElementByTestIdAndClick({
      id: `app-connection-wallet-item-${TEST_VARIABLES.PRIVATE_KEY_WALLET_2.ADDRESS}-not-active`,
      driver,
    });
    const activePKWallet2 = await findElementByTestId({
      id: `app-connection-wallet-item-${TEST_VARIABLES.PRIVATE_KEY_WALLET_2.ADDRESS}-active`,
      driver,
    });
    expect(activePKWallet2).toBeTruthy();
    await findElementByTestIdAndClick({
      id: `app-connection-wallet-item-dropdown-menu-${TEST_VARIABLES.PRIVATE_KEY_WALLET_2.ADDRESS}`,
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'app-interaction-switch-networks',
      driver,
    });
    await findElementByTestIdAndClick({
      id: `switch-network-item-${ChainId.polygon}`,
      driver,
    });
    const walletItemBadge = await findElementByTestId({
      id: `app-connection-wallet-item-badge-${TEST_VARIABLES.PRIVATE_KEY_WALLET_2.ADDRESS}-${ChainId.polygon}`,
      driver,
    });
    expect(walletItemBadge).toBeTruthy();
  });

  it('should be able to connect another account and change network of a connected but not active session', async () => {
    const notActivePK3Wallet = await findElementByTestId({
      id: `app-connection-wallet-item-${TEST_VARIABLES.PRIVATE_KEY_WALLET_3.ADDRESS}-not-active`,
      driver,
    });
    expect(notActivePK3Wallet).toBeTruthy();
    await findElementByTestIdAndClick({
      id: `app-connection-wallet-item-dropdown-menu-${TEST_VARIABLES.PRIVATE_KEY_WALLET_3.ADDRESS}`,
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'app-interaction-switch-networks',
      driver,
    });
    await findElementByTestIdAndClick({
      id: `switch-network-item-${ChainId.arbitrum}`,
      driver,
    });
    const walletItemBadge = await findElementByTestId({
      id: `app-connection-wallet-item-badge-${TEST_VARIABLES.PRIVATE_KEY_WALLET_3.ADDRESS}-${ChainId.arbitrum}`,
      driver,
    });
    expect(walletItemBadge).toBeTruthy();
  });

  it('should be able to connect another account and check the connection in the dapp', async () => {
    await findElementByTestIdAndClick({
      id: `app-connection-wallet-item-${TEST_VARIABLES.SEED_WALLET.ADDRESS}-not-active`,
      driver,
    });
    const walletItemBadge = await findElementByTestId({
      id: `app-connection-wallet-item-badge-${TEST_VARIABLES.SEED_WALLET.ADDRESS}-${ChainId.polygon}`,
      driver,
    });
    expect(walletItemBadge).toBeTruthy();
    await goToTestApp(driver);
    const expectedNetwork = 'Network: Polygon';
    const network = await querySelector(driver, '[id="network"]');
    const actualNetwork = await network.getText();
    expect(actualNetwork).toEqual(expectedNetwork);

    const expectedAccountAddress = `Account: ${TEST_VARIABLES.SEED_WALLET.ADDRESS}`;
    const accountAddress = await querySelector(driver, '[id="accountAddress"]');
    const actualAccountAddress = await accountAddress.getText();
    expect(actualAccountAddress.includes(expectedAccountAddress)).toBe(true);
  });
});
