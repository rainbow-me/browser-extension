/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
/* eslint-disable @typescript-eslint/no-var-requires */

import { ethers } from 'ethers';
import {
  Builder,
  By,
  Condition,
  WebDriver,
  WebElement,
  until,
} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';
import { expect } from 'vitest';
import { erc20ABI } from 'wagmi';

import { RAINBOW_TEST_DAPP } from '~/core/references/links';

// consts

const waitUntilTime = 20_000;
const testPassword = 'test1234';
const BINARY_PATHS = {
  mac: {
    chrome: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    brave: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    firefox:
      '/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox',
  },
  linux: {
    chrome: process.env.CHROMIUM_BIN,
    brave: process.env.BRAVE_BIN,
    firefox: process.env.FIREFOX_BIN,
  },
};

export const getRootUrl = () => {
  const browser = process.env.BROWSER || 'chrome';
  if (browser === 'firefox') {
    return 'moz-extension://';
  }
  return 'chrome-extension://';
};

// navigators

export async function goToTestApp(driver: WebDriver) {
  await driver.get(RAINBOW_TEST_DAPP);
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  await delayTime('very-long');
}

export async function goToPopup(
  driver: WebDriver,
  rootURL: string,
  route = '',
) {
  await driver.get(rootURL + '/popup.html' + route);
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  await delayTime('very-long');
}

export async function goToWelcome(driver: WebDriver, rootURL: string) {
  await driver.get(rootURL + '/popup.html#/welcome');
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  await delayTime('very-long');
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

export async function getWindowHandle({ driver }: { driver: WebDriver }) {
  await delayTime('long');
  const windowHandle = await driver.getWindowHandle();
  return windowHandle;
}

// setup functions

export async function initDriverWithOptions(opts: {
  browser: string;
  os: string;
}) {
  let driver;
  const args = [
    'load-extension=build/',
    // '--auto-open-devtools-for-tabs',
    '--log-level=0',
    '--enable-logging',
  ];

  if (opts.browser === 'firefox') {
    const options = new firefox.Options()
      // @ts-ignore
      .setBinary(BINARY_PATHS[opts.os][opts.browser])
      .addArguments(...args.slice(1))
      .setPreference('xpinstall.signatures.required', false)
      .setPreference('extensions.langpacks.signatures.required', false)
      .addExtensions('rainbowbx.xpi');

    const service = new firefox.ServiceBuilder().setStdio('inherit');

    driver = await new Builder()
      .setFirefoxService(service)
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build();
  } else {
    const options = new chrome.Options()
      // @ts-ignore
      .setChromeBinaryPath(BINARY_PATHS[opts.os][opts.browser])
      .addArguments(...args);
    options.setAcceptInsecureCerts(true);

    const service = new chrome.ServiceBuilder().setStdio('inherit');

    driver = await new Builder()
      .setChromeService(service)
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  }
  // @ts-ignore
  driver.browser = opts.browser;
  return driver;
}

export async function getExtensionIdByName(
  driver: WebDriver,
  extensionName: string,
) {
  // @ts-ignore
  if (driver?.browser === 'firefox') {
    await driver.get('about:debugging#addons');
    const text = await driver
      .wait(
        until.elementLocated(By.xpath("//dl/div[contains(., 'UUID')]/dd")),
        1000,
      )
      .getText();
    return text;
  } else {
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
}

// search functions

export async function querySelector(driver: WebDriver, selector: string) {
  try {
    await driver.wait(untilDocumentLoaded(), waitUntilTime);
    const el = await driver.wait(
      until.elementLocated(By.css(selector)),
      waitUntilTime,
    );
    return await driver.wait(until.elementIsVisible(el), waitUntilTime);
  } catch (error) {
    await takeScreenshot(driver, selector);
    throw error;
  }
}

export async function findElementByText(driver: WebDriver, text: string) {
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  const el = await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'" + text + "')]")),
    waitUntilTime,
  );
  return await driver.wait(until.elementIsVisible(el), waitUntilTime);
}

export async function findElementByTextAndClick(
  driver: WebDriver,
  text: string,
) {
  const element = await findElementByText(driver, text);
  await waitAndClick(element, driver);
}

export async function findElementAndClick({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  await delayTime('short');
  const element = await driver.findElement({
    id,
  });
  await waitAndClick(element, driver);
}

export async function findElementByTestId({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  return querySelector(driver, `[data-testid="${id}"]`);
}

export async function findElementById({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  return querySelector(driver, `[id="${id}"]`);
}

export async function doNotFindElementByTestId({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  const elementFound = await Promise.race([
    querySelector(driver, `[data-testid="${id}"]`),
    new Promise((resolve) => setTimeout(() => resolve(false), 1000)),
  ]);
  return !!elementFound;
}

export async function findElementByTestIdAndClick({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  await delayTime('short');
  const element = await findElementByTestId({ id, driver });
  await waitAndClick(element, driver);
}

export async function findElementByTestIdAndDoubleClick({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  await delayTime('short');
  const actions = driver.actions();
  const element = await findElementByTestId({ id, driver });
  return await actions.doubleClick(element).perform();
}

export async function waitUntilElementByTestIdIsPresent({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}): Promise<void> {
  await delayTime('medium');
  const element = await findElementByTestId({ id, driver });
  if (element) {
    return;
  }
  return waitUntilElementByTestIdIsPresent({ id, driver });
}

export async function findElementByIdAndClick({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  await delayTime('short');
  const element = await findElementById({ id, driver });
  await waitAndClick(element, driver);
}
export async function waitAndClick(element: WebElement, driver: WebDriver) {
  try {
    await driver.wait(untilDocumentLoaded(), waitUntilTime);
    await delayTime('short');
    await driver.wait(until.elementIsVisible(element), waitUntilTime);
    await driver.wait(until.elementIsEnabled(element), waitUntilTime);
    return element.click();
  } catch (error) {
    const testId = await element.getAttribute('data-testid');
    if (testId) {
      await takeScreenshot(driver, testId);
    } else {
      console.log("couldn't take screenshot because element has no test id");
    }
    throw new Error(`Failed to click element ${testId}`);
  }
}

export async function typeOnTextInput({
  id,
  text,
  driver,
}: {
  id: string;
  text: number | string;
  driver: WebDriver;
}) {
  const element = await findElementByTestId({ id, driver });
  await element.sendKeys(text);
}

export async function getTextFromTextInput({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  const element = await findElementByTestId({ id, driver });
  return await element.getAttribute('value');
}

export async function getTextFromText({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  const element = await findElementByTestId({ id, driver });
  return await element.getText();
}

export async function getTextFromDappText({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  const element = await findElementById({ id, driver });
  return await element.getText();
}

// various functions and flows

export async function goBackTwice(driver: WebDriver) {
  await delayTime('short');
  await findElementByTestIdAndClick({
    id: 'navbar-button-with-back',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'navbar-button-with-back',
    driver,
  });
}

export async function getNumberOfWallets(
  driver: WebDriver,
  testIdPrefix: string,
) {
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

export async function navigateToSettingsPrivacy(
  driver: WebDriver,
  rootURL: string,
) {
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

export function shortenAddress(address: string) {
  // if address is 42 in length and starts with 0x, then shorten it
  // otherwise return the base value. this is so it doesn't break incase an ens, etc is input
  return address.substring(0, 2) === '0x' && address.length === 42
    ? `${address.substring(0, 6)}…${address.substring(38, 42)}`
    : address;
}

export async function switchWallet(
  address: string,
  rootURL: string,
  driver: WebDriver,
) {
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

export async function getOnchainBalance(addy: string, contract: string) {
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

export const fillSeedPhrase = async (driver: WebDriver, seedPhrase: string) => {
  const words = seedPhrase.split(' ');
  for (let i = 0; i < 12; i++) {
    await typeOnTextInput({
      id: `secret-input-${i + 1}`,
      driver,
      text: words[i],
    });
  }
};

export const fillPrivateKey = async (driver: WebDriver, privateKey: string) => {
  return typeOnTextInput({
    id: 'private-key-input',
    driver,
    text: privateKey,
  });
};

export async function importHardwareWalletFlow(
  driver: WebDriver,
  rootURL: string,
  hardwareType: string,
) {
  await goToWelcome(driver, rootURL);
  await findElementByTestIdAndClick({
    id: 'import-wallet-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'connect-wallet-option',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${hardwareType}-option`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'connect-wallets-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'hw-done',
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
}

export async function importWalletFlow(
  driver: WebDriver,
  rootURL: string,
  walletSecret: string,
  secondaryWallet = false as boolean,
) {
  if (secondaryWallet) {
    await goToPopup(driver, rootURL);
    await findElementByIdAndClick({
      id: 'header-account-name-shuffle',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });
    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });
  } else {
    await goToWelcome(driver, rootURL);
    await findElementByTestIdAndClick({
      id: 'import-wallet-button',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'import-wallet-option',
      driver,
    });
  }
  // button doesn't exist for pkeys. check if pkey, and if so, dont check for this button
  const isPrivateKey =
    walletSecret.substring(0, 2) === '0x' && walletSecret.length === 66;

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

  if (secondaryWallet) {
    await delayTime('medium');

    const accountHeader = await findElementById({
      id: 'header-account-name-shuffle',
      driver,
    });
    expect(accountHeader).toBeTruthy();
  } else {
    await delayTime('medium');
    await typeOnTextInput({ id: 'password-input', driver, text: testPassword });
    await typeOnTextInput({
      id: 'confirm-password-input',
      driver,
      text: testPassword,
    });
    await findElementByTestIdAndClick({ id: 'set-password-button', driver });
    await delayTime('long');
    const welcomeText = await findElementByText(
      driver,
      'Rainbow is ready to use',
    );
    expect(welcomeText).toBeTruthy();
  }
}

export async function checkWalletName(
  driver: WebDriver,
  rootURL: string,
  walletAddress: string,
) {
  goToPopup(driver, rootURL);
  await delayTime('short');
  const account = await getTextFromText({ id: 'account-name', driver });
  expect(account).toBe(shortenAddress(walletAddress));
}

export async function passSecretQuiz(driver: WebDriver) {
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

// custom conditions

export const untilDocumentLoaded = async function () {
  return new Condition('for document to load', async (driver) => {
    return await driver.wait(async () => {
      const documentReadyState = await driver.executeScript(
        'return document.readyState',
      );

      if (documentReadyState === 'complete') {
        return true;
      }

      return false;
    }, waitUntilTime);
  });
};

// delays

export async function delay(ms: number) {
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

export async function takeScreenshot(driver: WebDriver, name: string) {
  try {
    const image = await driver.takeScreenshot();
    const safeName = name.replace('[data-testid="', '').replace('"]', '');
    const filename = `${new Date().getTime()}-${safeName}`;
    require('fs').writeFileSync(`screenshots/${filename}.png`, image, 'base64');
  } catch (error) {
    console.error('Error occurred while taking screenshot:', error);
  }
}
