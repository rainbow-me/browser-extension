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

export async function goToTestApp(url, selector, driver, selectorType = 'id') {
  await driver.get(url);

  const element =
    selectorType === 'id'
      ? await findElementById({ id: selector, driver })
      : await driver.findElement(By.css(`[class="${selector}"]`));

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
  try {
    await (popupHandler === undefined
      ? delayTime('medium')
      : driver.wait(until.elementLocated(By.css('body')), waitUntilTime));

    const handlers = await driver.getAllWindowHandles();

    const popupHandlerFromHandlers = handlers.find(
      (handler) => handler !== dappHandler,
    );
    const dappHandlerFromHandlers = handlers.find(
      (handler) => handler !== popupHandler,
    );

    return {
      handlers,
      popupHandler: popupHandler ?? popupHandlerFromHandlers,
      dappHandler: dappHandler ?? dappHandlerFromHandlers,
    };
  } catch (error) {
    console.error('Error occurred while getting window handles:', error);
    throw error;
  }
}

export async function getWindowHandle({ driver }) {
  try {
    await driver.wait(until.elementLocated(By.css('body')), waitUntilTime);
    const windowHandles = await driver.getAllWindowHandles();
    const handle = windowHandles.find((handle) => handle !== null);

    if (handle !== undefined) {
      return handle;
    }
  } catch (error) {
    console.error('Error occurred while retrieving the window handle:', error);
    throw error;
  }
}

export async function switchWindows(window, driver: WebDriver) {
  try {
    await delayTime('medium');
    await driver.wait(async () => {
      const windowHandles = await driver.getAllWindowHandles();
      return windowHandles.includes(window);
    }, waitUntilTime);

    await driver.switchTo().window(window);
  } catch (error) {
    console.error('Error occurred while switching windows:', error);
    throw error;
  }
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
    await driver.wait(until.elementLocated(By.css(selector)), waitUntilTime);
    const el = await driver.findElement(By.css(selector));
    await driver.wait(until.elementIsVisible(el), waitUntilTime);
    return el;
  } catch (error) {
    console.error(`Failed to locate element with selector: ${selector}`, error);
  }
}

export async function querySelectorInverse(driver, selector) {
  try {
    await driver.wait(
      until.stalenessOf(driver.findElement(By.css(selector))),
      waitUntilTime,
    );
    return true;
  } catch (error) {
    console.error(`Found element with selector: ${selector}`);
    return false;
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
  const element = await querySelector(driver, `[id="${id}"]`);
  await waitAndClick(element, driver);
}

export async function findElementByTestId({ id, driver }) {
  const element = await querySelector(driver, `[data-testid="${id}"]`);
  return element;
}

export async function findElementById({ id, driver }) {
  return await querySelector(driver, `[id="${id}"]`);
}

export async function doNotFindElementByTestId({ id, driver }) {
  const elementFound = await Promise.race([
    querySelectorInverse(driver, `[data-testid="${id}"]`),
    new Promise((resolve) => setTimeout(() => resolve(false), 1000)),
  ]);
  return !!elementFound;
}

export async function findElementByTestIdAndClick({ id, driver }) {
  const element = await findElementByTestId({ id, driver });
  await waitAndClick(element, driver);
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
    await driver.wait(until.elementIsEnabled(element), waitUntilTime);
    await driver.wait(until.elementIsVisible(element), waitUntilTime);
    await element.click();
  } catch (error) {
    if (error.name === 'ElementClickInterceptedError') {
      const elementId = await element.getAttribute('id');
      console.error(
        `Click intercepted while trying to click element ${elementId}`,
      );
    } else {
      throw error;
    }
  }
}

export async function typeOnTextInput({ id, text, driver }) {
  try {
    const element = await findElementByTestId({ id, driver });
    if (!element) {
      throw new Error(`Element with ID '${id}' not found`);
    }
    await element.sendKeys(text);
  } catch (error) {
    console.error(
      `Error occurred while typing on input with ID '${id}':`,
      error,
    );
    throw error;
  }
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

export async function awaitTextChange(id, text, driver) {
  const element = await findElementById({
    id: id,
    driver,
  });
  await driver.wait(until.elementTextIs(element, text), waitUntilTime);
}

// various functions and flows

export function shortenAddress(address: string): string {
  // if address is 42 in length and starts with 0x, then shorten it
  // otherwise return the base value. this is so it doesn't break incase an ens, etc is input
  return address.substring(0, 2) === '0x' && address.length === 42
    ? `${address.substring(0, 6)}...${address.substring(38, 42)}`
    : address;
}

export async function checkEnsResolution(
  address: string,
  driver: WebDriver,
  ens?,
): Promise<string> {
  let hasError = false;

  try {
    await findElementByTestId({
      id: `account-item-${ens}`,
      driver,
    });
  } catch (error) {
    hasError = true;
    console.error(
      `ENS name "${ens}" not resolved. Switching to ETH address if available.`,
    );
  }

  if (!hasError) {
    return ens; // Return the ens value when no error occurred
  }
  return address; // Return the address value when an error occurred
}

export async function switchWallet(
  Ethaddress: string,
  rootURL: string | WebDriver,
  driver: WebDriver,
  ens?: string,
) {
  // go to popup
  await goToPopup(driver, rootURL, '#/home');

  // find header and click
  await findElementByIdAndClick({
    id: 'header-account-name-shuffle',
    driver,
  });

  let address = '';
  if (ens) {
    address = await checkEnsResolution(Ethaddress, driver, ens);
  } else {
    address = Ethaddress;
  }
  // find shortened address
  const shortenedAddress = shortenAddress(address);

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
