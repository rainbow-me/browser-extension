/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
/* eslint-disable @typescript-eslint/no-var-requires */
import { ethers } from 'ethers';
import {
  Builder,
  By,
  Locator,
  WebDriver,
  WebElementCondition,
  until,
} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { expect } from 'vitest';
import { erc20ABI } from 'wagmi';

// consts

const waitUntilTime = 20000;
const testPassword = 'test1234';
const BINARY_PATHS = {
  mac: {
    chrome: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    brave: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  },
  linux: {
    chrome: process.env.CHROMIUM_BIN,
    brave: process.env.BRAVE_BIN,
  },
};

export const byTestId = (id: string) => By.css(`[data-testid="${id}"]`);
export const byText = (text: string) =>
  By.xpath(`//*[contains(text(),"${text}")]`);

// navigators

export async function goToTestApp(driver) {
  await driver.get('https://bx-test-dapp.vercel.app/');
  await delay(1000);
}

export async function goToPopup(driver, rootURL, route = '') {
  await driver.get(rootURL + '/popup.html' + route);
  await delay(5000);
}

export async function goToWelcome(driver, rootURL) {
  await driver.get(rootURL + '/popup.html#/welcome');
  await delay(1000);
}

export async function getAllWindowHandles({
  driver,
  popupHandler,
  dappHandler,
}: {
  driver: WebDriver;
  popupHandler?: string;
  dappHandler?: string;
}) {
  await delayTime('long');
  const handlers = await driver.getAllWindowHandles();
  const popupHandlerFromHandlers =
    handlers.find((handler) => handler !== dappHandler) || '';

  const dappHandlerFromHandlers =
    handlers.find((handler) => handler !== popupHandler) || '';

  return {
    handlers,
    popupHandler: popupHandler || popupHandlerFromHandlers,
    dappHandler: dappHandler || dappHandlerFromHandlers,
  };
}

export async function getWindowHandle({ driver }) {
  await delayTime('long');
  const windowHandle = await driver.getWindowHandle();
  return windowHandle;
}

// setup functions

export async function initDriverWithOptions(opts) {
  const args = [
    'load-extension=build/',
    // '--auto-open-devtools-for-tabs',
    '--log-level=0',
    '--enable-logging',
  ];

  const options = new chrome.Options()
    .setChromeBinaryPath(BINARY_PATHS[opts.os][opts.browser])
    .addArguments(...args);
  options.setAcceptInsecureCerts(true);

  const service = new chrome.ServiceBuilder().setStdio('inherit');

  return await new Builder()
    .setChromeService(service)
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

export async function getExtensionIdByName(driver, extensionName) {
  await driver.get('chrome://extensions');
  return await driver.executeScript(`
      const extensions = document.querySelector("extensions-manager").shadowRoot
        .querySelector("extensions-item-list").shadowRoot
        .querySelectorAll("extensions-item")
      for (let i = 0; i < extensions.length; i++) {
        const extension = extensions[i].shadowRoot
        const name = extension.querySelector('#name').textContent
        if (name.startsWith("${extensionName}")) {
          return extensions[i].getAttribute("id")
        }
      }
      return undefined
    `);
}

// search functions

export async function querySelector(driver, selector) {
  try {
    const element = await driver.wait(
      until.elementLocated(By.css(selector)),
      waitUntilTime,
    );
    return await driver.wait(until.elementIsVisible(element), waitUntilTime);
  } catch (error) {
    throw new Error(`Timeout waiting for selector: ${selector}`);
  }
}

export async function findElementByText(driver, text) {
  const el = await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'" + text + "')]")),
    waitUntilTime,
  );
  return await driver.wait(until.elementIsVisible(el), waitUntilTime);
}

export async function findElementByTextAndClick(driver, text) {
  const element = await findElementByText(driver, text);
  await waitAndClick(element, driver);
}

export async function findElementAndClick({ id, driver }) {
  await delayTime('short');
  const element = await driver.findElement({
    id,
  });
  await waitAndClick(element, driver);
}

export async function findElementByTestId({ id, driver }) {
  return querySelector(driver, `[data-testid="${id}"]`);
}

export async function findElementById({ id, driver }) {
  return querySelector(driver, `[id="${id}"]`);
}

export async function doNotFindElementByTestId({ id, driver }) {
  const elementFound = await Promise.race([
    querySelector(driver, `[data-testid="${id}"]`),
    new Promise((resolve) => setTimeout(() => resolve(false), 1000)),
  ]);
  return !!elementFound;
}

export async function findElementByTestIdAndClick({ id, driver }) {
  await delay(200);
  const element = await findElementByTestId({ id, driver });
  await waitAndClick(element, driver);
}

export async function findElementByTestIdAndDoubleClick({ id, driver }) {
  await delay(400);
  const actions = driver.actions();
  const element = await findElementByTestId({ id, driver });
  return await actions.doubleClick(element).perform();
}

export async function waitUntilElementByTestIdIsPresent({ id, driver }) {
  await delay(500);
  const element = await findElementByTestId({ id, driver });
  if (element) {
    return;
  }
  return waitUntilElementByTestIdIsPresent({ id, driver });
}

export async function findElementByIdAndClick({ id, driver }) {
  await delay(200);
  const element = await findElementById({ id, driver });
  await waitAndClick(element, driver);
}
export async function waitAndClick(element, driver) {
  await delayTime('short');
  await driver.wait(until.elementIsVisible(element), waitUntilTime);
  return element.click();
}

export async function typeOnTextInput({ id, text, driver }) {
  const element = await findElementByTestId({ id, driver });
  await element.sendKeys(text);
}

export async function getTextFromTextInput({ id, driver }) {
  const element = await findElementByTestId({ id, driver });
  return await element.getAttribute('value');
}

export async function getTextFromText({ id, driver }) {
  const element = await findElementByTestId({ id, driver });
  return await element.getText();
}

export async function getTextFromDappText({ id, driver }) {
  const element = await findElementById({ id, driver });
  return await element.getText();
}

export const untilIsClickable = (locator: Locator) =>
  new WebElementCondition('until element is clickable', async (driver) => {
    const element = driver.findElement(locator);
    const isDisplayed = await element.isDisplayed();
    const isEnabled = await element.isEnabled();
    if (isDisplayed && isEnabled) return element;
    return null;
  });

// various functions and flows

export async function getNumberOfWallets(driver, testIdPrefix) {
  let numOfWallets = 0;

  for (let i = 1; ; i++) {
    try {
      const el = await driver.wait(
        until.elementLocated(By.css(`[data-testid="${testIdPrefix}${i}"]`)),
        5000,
      );
      await driver.wait(until.elementIsVisible(el), 5000);

      numOfWallets += 1;
    } catch (err) {
      // Element not found, break out of loop
      break;
    }
  }

  return numOfWallets;
}

export async function navigateToSettingsPrivacy(driver, rootURL) {
  await goToPopup(driver, rootURL, '#/home');
  await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
  await findElementByTestIdAndClick({ id: 'settings-link', driver });
  await findElementByTestIdAndClick({ id: 'privacy-security-link', driver });
  await delayTime('medium');
}

export async function toggleStatus(id: string, driver: WebDriver) {
  const toggleInput = await driver.wait(
    until.elementLocated(By.css(`[data-testid="${id}"] input`)),
  );
  const checkedStatus: string = await toggleInput.getAttribute('aria-checked');
  return checkedStatus;
}

export function shortenAddress(address) {
  // if address is 42 in length and starts with 0x, then shorten it
  // otherwise return the base value. this is so it doesn't break incase an ens, etc is input
  return address.substring(0, 2) === '0x' && address.length === 42
    ? `${address.substring(0, 6)}...${address.substring(38, 42)}`
    : address;
}

export async function switchWallet(address, rootURL, driver: WebDriver) {
  // find shortened address
  const shortenedAddress = shortenAddress(address);

  // go to popup
  await goToPopup(driver, rootURL, '#/home');
  await delayTime('medium');

  // find header and click
  await findElementByIdAndClick({
    id: 'header-account-name-shuffle',
    driver,
  });
  await delayTime('medium');

  // find wallet you want to switch to and click
  await waitUntilElementByTestIdIsPresent({
    id: `account-item-${shortenedAddress}`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `account-item-${shortenedAddress}`,
    driver,
  });

  await delayTime('long');
}

export async function getOnchainBalance(addy, contract) {
  const provider = ethers.getDefaultProvider('http://127.0.0.1:8545');
  const testContract = new ethers.Contract(contract, erc20ABI, provider);
  const balance = await testContract.balanceOf(addy);

  return balance;
}

export async function transactionStatus() {
  const provider = ethers.getDefaultProvider('http://127.0.0.1:8545');
  const blockData = await provider.getBlock('latest');
  const txn = await provider.getTransaction(blockData.transactions[0]);
  const txnData = txn.wait();

  // transactionResponse.wait.status returns '1' if txn is successful
  // it returns '0' if the txn is a failure
  const txnStatus = (await txnData).status === 1 ? 'success' : 'failure';

  return txnStatus;
}

export const fillSeedPhrase = async (driver, seedPhrase) => {
  const words = seedPhrase.split(' ');
  for (let i = 0; i < 12; i++) {
    await typeOnTextInput({
      id: `secret-input-${i + 1}`,
      driver,
      text: words[i],
    });
  }
};

export const fillPrivateKey = async (driver, privateKey) => {
  return typeOnTextInput({
    id: 'private-key-input',
    driver,
    text: privateKey,
  });
};

export async function importWalletFlow(driver, rootURL, walletSecret) {
  await goToWelcome(driver, rootURL);
  await findElementByTestIdAndClick({
    id: 'import-wallet-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'import-wallet-option',
    driver,
  });

  // button doesn't exist for pkeys. check if pkey, and if so, dont check for this button
  const isPrivateKey =
    walletSecret.substr(0, 2) === '0x' && walletSecret.length === 66;

  await findElementByTestIdAndClick({
    id: isPrivateKey ? 'import-via-pkey-option' : 'import-via-seed-option',
    driver,
  });

  isPrivateKey
    ? await fillPrivateKey(driver, walletSecret)
    : await fillSeedPhrase(driver, walletSecret);

  await findElementByTestIdAndClick({
    id: 'import-wallets-button',
    driver,
  });

  if (!isPrivateKey) {
    await findElementByTestIdAndClick({
      id: 'add-wallets-button',
      driver,
    });
  }

  await delayTime('medium');

  await typeOnTextInput({ id: 'password-input', driver, text: testPassword });
  await typeOnTextInput({
    id: 'confirm-password-input',
    driver,
    text: testPassword,
  });
  await findElementByTestIdAndClick({ id: 'set-password-button', driver });
  await delayTime('long');
  await findElementByText(driver, 'Rainbow is ready to use');
}

export async function checkWalletName(driver, rootURL, walletAddress) {
  goToPopup(driver, rootURL);
  await delayTime('short');
  const account = await getTextFromText({ id: 'account-name', driver });
  expect(account).toBe(shortenAddress(walletAddress));
}

export async function passSecretQuiz(driver) {
  const requiredWordsIndexes = [4, 8, 12];
  const requiredWords: string[] = [];

  for (const index of requiredWordsIndexes) {
    const wordElement = await querySelector(
      driver,
      `[data-testid="seed_word_${index}"]`,
    );
    const wordText = await wordElement.getText();
    requiredWords.push(wordText);
  }

  await findElementByTestIdAndClick({
    id: 'saved-these-words-button',
    driver,
  });

  await delayTime('long');

  for (const word of requiredWords) {
    await findElementByTestIdAndClick({ id: `word_${word}`, driver });
  }

  await delayTime('long');
}

// delays

export async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function delayTime(
  time: 'short' | 'medium' | 'long' | 'very-long',
) {
  switch (time) {
    case 'short':
      return await delay(200);
    case 'medium':
      return await delay(500);
    case 'long':
      return await delay(1000);
    case 'very-long':
      return await delay(5000);
  }
}

export async function awaitTextChange(
  id: string,
  text: string,
  driver: WebDriver,
) {
  try {
    const element = await findElementById({
      id: id,
      driver,
    });

    await driver.wait(until.elementTextIs(element, text), waitUntilTime);
  } catch (error) {
    console.error(
      `Error occurred while awaiting text change for element with ID '${id}':`,
      error,
    );
    throw error;
  }
}
