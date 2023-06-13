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
  const element = await findElementById({ id: 'app', driver });
  await driver.wait(until.elementIsVisible(element), waitUntilTime);
}

export async function goToPopup(driver, rootURL, route = '') {
  await driver.get(rootURL + '/popup.html' + route);
  const element = await findElementById({ id: 'app', driver });
  await driver.wait(until.elementIsVisible(element), waitUntilTime);
}

export async function goToWelcome(driver, rootURL) {
  await driver.get(rootURL + '/popup.html#/welcome');
  const element = await findElementById({ id: 'app', driver });
  await driver.wait(until.elementIsVisible(element), waitUntilTime);
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
  const maxRetries = 3;
  const waitTime = 1000; // milliseconds

  for (let retry = 0; retry < maxRetries; retry++) {
    try {
      await driver.wait(until.elementLocated(By.css(selector)), waitTime);
      const el = await driver.findElement(By.css(selector));

      await driver.wait(async () => {
        try {
          const isVisible = await el.isDisplayed();
          return isVisible;
        } catch (error) {
          return false;
        }
      }, waitTime);

      return el;
    } catch (error) {
      // Element not found or not visible, retry after a short wait
      await driver.sleep(waitTime);
    }
  }
  throw new Error(`Failed to locate element with selector: ${selector}`);
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
  const element = await querySelector(driver, `[id="${id}"]`);
  await waitAndClick(element, driver);
}

export async function findElementByTestId({ id, driver }) {
  const element = await querySelector(driver, `[data-testid="${id}"]`);
  await driver.wait(until.elementIsVisible(element), waitUntilTime);
  return element;
}

export async function findElementById({ id, driver }) {
  return await querySelector(driver, `[id="${id}"]`);
}

export async function doNotFindElementByTestId({ id, driver }) {
  const elementFound = await Promise.race([
    querySelector(driver, `[data-testid="${id}"]`),
    new Promise((resolve) => setTimeout(() => resolve(false), 1000)),
  ]);
  return !!elementFound;
}

export async function findElementByTestIdAndClick({ id, driver }) {
  try {
    const element = await findElementByTestId({ id, driver });
    await waitAndClick(element, driver);
  } catch (error) {
    if (isStaleElementError(error)) {
      console.log('Stale element reference encountered. Retrying...');
      await findElementByTestIdAndClick({ id, driver }); // Recursive retry
    } else {
      throw error; // Throw the error if it's not a stale element error
    }
  }
}

function isStaleElementError(error) {
  return error.name === 'StaleElementReferenceError';
}

export async function waitUntilElementByTestIdIsPresent({ id, driver }) {
  const element = await findElementByTestId({ id, driver });
  if (element) {
    return;
  }
  return waitUntilElementByTestIdIsPresent({ id, driver });
}

export async function findElementByIdAndClick({ id, driver }) {
  const element = await findElementById({ id, driver });
  await waitAndClick(element, driver);
}

export async function waitAndClick(element, driver) {
  try {
    await delayTime('short', driver);
    await driver.wait(until.elementIsEnabled(element), waitUntilTime);
    return element.click();
  } catch (error) {
    // Log the element that caused the stale element reference error
    console.error('Stale element:', element);
    throw error;
  }
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

export const untilIsClickable = (locator: Locator) => {
  const convertedLocator =
    typeof locator === 'string' ? By.css(locator) : locator;
  return new WebElementCondition(
    'until element is clickable',
    async (driver) => {
      const element = await driver.findElement(convertedLocator);
      const isDisplayed = await element.isDisplayed();
      const isEnabled = await element.isEnabled();
      if (isDisplayed && isEnabled) return element;
      return null;
    },
  );
};

// various functions and flows

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

  // find header and click
  await findElementByIdAndClick({
    id: 'header-account-name-shuffle',
    driver,
  });

  // find wallet you want to switch to and click
  await waitUntilElementByTestIdIsPresent({
    id: `account-item-${shortenedAddress}`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `account-item-${shortenedAddress}`,
    driver,
  });
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

  await typeOnTextInput({ id: 'password-input', driver, text: testPassword });
  await typeOnTextInput({
    id: 'confirm-password-input',
    driver,
    text: testPassword,
  });
  await findElementByTestIdAndClick({ id: 'set-password-button', driver });
  await findElementByText(driver, 'Rainbow is ready to use');
}

export async function checkWalletName(driver, rootURL, walletAddress) {
  goToPopup(driver, rootURL);
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

  for (const word of requiredWords) {
    await findElementByTestIdAndClick({ id: `word_${word}`, driver });
  }
}

// delays

export async function delayTime(
  time: 'short' | 'medium' | 'long' | 'very-long',
  driver,
) {
  switch (time) {
    case 'short':
      return await driver.sleep(200);
    case 'medium':
      return await driver.sleep(500);
    case 'long':
      return await driver.sleep(1000);
    case 'very-long':
      return await driver.sleep(5000);
    default:
      throw new Error('Invalid time value');
  }
}
