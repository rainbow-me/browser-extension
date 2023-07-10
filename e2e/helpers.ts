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
  logging,
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

// navigators

export async function goToTestApp(url, selector, driver, selectorType = 'id') {
  await driver.get(url);

  const element =
    selectorType === 'id'
      ? await findElementById({ id: selector, driver })
      : await driver.findElement(By.css(`[class="${selector}"]`));

  await driver.wait(until.elementIsVisible(element), waitUntilTime);
}

export async function goToPopup(
  driver: WebDriver,
  rootURL: string,
  route = '',
) {
  await goToURL(driver, rootURL + '/popup.html' + route);
}

export async function goToWelcome(driver: WebDriver, rootURL: string) {
  await goToURL(driver, rootURL + '/popup.html#/welcome');
}

async function goToURL(driver: WebDriver, url: string) {
  await driver.get(url);
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
  await delayTime('very-long');
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
  try {
    const handle = await driver.getWindowHandle();

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

// add this funciton to the end of a test
// to see more in depth logs while testing
export async function retrieveLogs(driver) {
  const logs = await driver.manage().logs().get(logging.Type.BROWSER);
  logs.forEach((log) => {
    console.log(`[${log.level.name}] ${log.message}`);
  });
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

export async function querySelector(driver: WebDriver, selector: string) {
  try {
    await driver.wait(until.elementLocated(By.css(selector)), waitUntilTime);
    const element = await driver.findElement(By.css(selector));
    await driver.wait(until.elementIsVisible(element), waitUntilTime);
    return element;
  } catch (error) {
    console.error(`Failed to locate element with selector: ${selector}`, error);
    throw error;
  }
}

export async function findElementByText(driver: WebDriver, text: string) {
  try {
    const escapedText = text.replace(/'/g, "\\'");
    const xpathExpression = `//*[contains(text(), '${escapedText}')]`;

    const element = await driver.wait(
      until.elementLocated(By.xpath(xpathExpression)),
      waitUntilTime,
    );
    return await driver.wait(until.elementIsVisible(element), waitUntilTime);
  } catch (error) {
    console.error(`Failed to locate element with text: ${text}`, error);
    throw error;
  }
}

export async function findElementByTextAndClick(driver, text) {
  try {
    const element = await findElementByText(driver, text);
    await waitAndClick(element, driver);
  } catch (error) {
    console.error(`Failed to find element by text and click: ${text}`, error);
    throw error;
  }
}

export async function findElementAndClick({ id, driver }) {
  try {
    const element = await querySelector(driver, `[id="${id}"]`);
    await waitAndClick(element, driver);
  } catch (error) {
    console.error(`Failed to find element by id and click: ${id}`, error);
    throw error;
  }
}

export async function findElementByTestId({ id, driver }) {
  try {
    const element = await querySelector(driver, `[data-testid="${id}"]`);
    return element;
  } catch (error) {
    console.error(`Failed to find element by test id: ${id}`, error);
    throw error;
  }
}

export async function findElementById({ id, driver }) {
  try {
    const element = await querySelector(driver, `[id="${id}"]`);
    return element;
  } catch (error) {
    console.error(`Failed to find element by id: ${id}`, error);
    throw error;
  }
}

export async function doNotFindElementByTestId({ id, driver }) {
  try {
    const elementFound = await Promise.race([
      querySelector(driver, `[data-testid="${id}"]`),
      new Promise((resolve) => setTimeout(() => resolve(false), 1000)),
    ]);
    return !!elementFound;
  } catch (error) {
    console.error(`Element with: ${id} was found`, error);
    throw error;
  }
}

export async function findElementByTestIdAndClick({ id, driver }) {
  try {
    const element = await findElementByTestId({ id, driver });
    await waitAndClick(element, driver);
  } catch (error) {
    console.error(`Failed to find element by test id and click: ${id}`, error);
    throw error;
  }
}

export async function waitUntilElementByTestIdIsPresent({ id, driver }) {
  try {
    const element = await findElementByTestId({ id, driver });
    if (element) {
      return;
    }
    return waitUntilElementByTestIdIsPresent({ id, driver });
  } catch (error) {
    console.error(
      `Failed to find element with testId: ${id} after waiting`,
      error,
    );
    throw error;
  }
}

export async function findElementByIdAndClick({ id, driver }) {
  try {
    const element = await findElementById({ id, driver });
    await waitAndClick(element, driver);
  } catch (error) {
    console.error(`Failed to find element by id and click: ${id}`, error);
    throw error;
  }
}

export async function waitAndClick(element, driver) {
  try {
    await driver.wait(until.elementIsEnabled(element), waitUntilTime);
    await driver.wait(until.elementIsVisible(element), waitUntilTime);
    // some of our sheets animations require some sort of delay for them to animate in
    await delayTime('short');
    await element.click();
  } catch (error) {
    console.error(
      `Error occured while trying to click element: ${element}`,
      error,
    );
  }
}

export async function typeOnTextInput({ id, text, driver }) {
  try {
    const element = await findElementByTestId({ id, driver });
    await element.sendKeys(text);
  } catch (error) {
    console.error(
      `Error occurred while typing on input with testId '${id}':`,
      error,
    );
  }
}

export async function getTextFromElementInput({ id, driver }) {
  try {
    const element = await findElementByTestId({ id, driver });
    return await element.getAttribute('value');
  } catch (error) {
    console.error(
      `Error occurred while retrieving text from input with testId '${id}':`,
      error,
    );
    throw error;
  }
}

export async function getTextFromElement({ id, driver }) {
  try {
    const element = await findElementByTestId({ id, driver });
    return await element.getText();
  } catch (error) {
    console.error(
      `Error occurred while retrieving text from element with testId '${id}':`,
      error,
    );
    throw error;
  }
}

export async function getTextFromDappText({ id, driver }) {
  try {
    const element = await findElementById({ id, driver });
    return await element.getText();
  } catch (error) {
    console.error(
      `Error occurred while retrieving text from Dapp element with id '${id}':`,
      error,
    );
    throw error;
  }
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
      `Error occurred while awaiting text change for an element with ID '${id}':`,
      error,
    );
    throw error;
  }
}

// various functions and flows

export function shortenAddress(address: string): string {
  // if address is 42 in length and starts with 0x, then shorten it
  // otherwise return the base value. this is so it doesn't break incase an ens, etc is input
  return address.substring(0, 2) === '0x' && address.length === 42
    ? `${address.substring(0, 6)}...${address.substring(38, 42)}`
    : address;
}

export async function switchWallet(
  ethAddress: string,
  rootURL,
  driver: WebDriver,
  ens?: string,
) {
  await goToPopup(driver, rootURL, '#/home');

  await findElementByIdAndClick({
    id: 'header-account-name-shuffle',
    driver,
  });
  const shortenedAddress = shortenAddress(ethAddress);

  await waitUntilElementByTestIdIsPresent({
    id: `account-item-${ens || shortenedAddress}`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `account-item-${ens || shortenedAddress}`,
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
  if (txnStatus === 'success') {
    return txnStatus;
  } else {
    transactionStatus();
  }
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
  const account = await getTextFromElement({ id: 'account-name', driver });
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

export async function waitUntilEnabled(testId, driver) {
  const element = await driver.findElement(By.css(`[data-testid="${testId}"]`));
  const checkEnabledValue = async () => {
    try {
      await element.getAttribute('disabled');
    } catch (error) {
      return 'enabled';
    }
    return checkEnabledValue();
  };

  return await checkEnabledValue();
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
