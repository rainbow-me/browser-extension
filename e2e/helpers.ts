import * as fs from 'node:fs';

import { Contract } from '@ethersproject/contracts';
import { getDefaultProvider } from '@ethersproject/providers';
import {
  By,
  Condition,
  Key,
  WebDriver,
  WebElement,
  until,
} from 'selenium-webdriver';
import { erc20Abi } from 'viem';
import { expect } from 'vitest';

import { RAINBOW_TEST_DAPP } from '~/core/references/links';

// consts

const waitUntilTime = 20_000;
const testPassword = 'test1234';

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

// search functions

export async function querySelector(driver: WebDriver, selector: string) {
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  const el = await driver.wait(
    until.elementLocated(By.css(selector)),
    waitUntilTime,
  );
  return await driver.wait(until.elementIsVisible(el), waitUntilTime);
}

export async function querySelectorWithin(
  parentElement: WebElement,
  childSelector: string,
): Promise<WebElement> {
  return await parentElement.findElement(By.css(childSelector));
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
    new Promise((resolve) => {
      setTimeout(() => resolve(false), 1000);
    }),
  ]);
  return !!elementFound;
}

export async function isElementFoundByText({
  text,
  driver,
}: {
  text: string;
  driver: WebDriver;
}) {
  let isElementFound = true;
  try {
    await driver.wait(untilDocumentLoaded(), waitUntilTime);
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'" + text + "')]")),
      2500,
    );
    console.log(
      `Element with text '${text}' was returned isElementFound status of ${isElementFound}`,
    );
  } catch (error) {
    isElementFound = false;
    console.log(
      `Element with text '${text}' was returned isElementFound status of ${isElementFound}`,
    );
  }
  return isElementFound;
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
  await delayTime('long');
  try {
    const element = await findElementByTestId({ id, driver });
    if (element) {
      return;
    }
  } catch (error) {
    return waitUntilElementByTestIdIsPresent({ id, driver });
  }
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
    throw new Error(`Failed to click element ${testId}`);
  }
}

export async function typeOnTextInput({
  id,
  text,
  driver,
}: {
  id?: string;
  text: number | string;
  driver: WebDriver;
}) {
  const element = id ? await findElementByTestId({ id, driver }) : null;
  element
    ? await element.sendKeys(text)
    : await driver.actions().sendKeys(text.toString()).perform();
}

export async function clearInput({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  const element = await findElementByTestId({ id, driver });
  return await element.clear();
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

// two helpers bc normal keys / special keys work a little different in selenium
export async function performShortcutWithNormalKey(
  driver: WebDriver,
  key: string,
) {
  try {
    await delayTime('short');
    await driver.actions().sendKeys(key).perform();
  } catch (error) {
    console.error(
      `Error occurred while attempting shortcut with the keyboard character '${key}':`,
      error,
    );
    throw error;
  }
}

export async function executeMultipleShortcuts({
  driver,
  keyDown,
  key,
}: {
  driver: WebDriver;
  keyDown: keyof typeof Key | string;
  key: keyof typeof Key | string;
}) {
  try {
    await delayTime('short');
    const keyDownAction =
      keyDown in Key ? (Key[keyDown as keyof typeof Key] as string) : keyDown;
    const keyAction =
      key in Key ? (Key[key as keyof typeof Key] as string) : key;
    await driver
      .actions()
      .keyDown(keyDownAction)
      .sendKeys(keyAction)
      .keyUp(keyDownAction)
      .perform();
  } catch (error) {
    console.error(
      `Error occurred while attempting multiple shortcuts with the keydown '${keyDown}' and key '${key}':`,
      error,
    );
    throw error;
  }
}

export async function performShortcutWithSpecialKey(
  driver: WebDriver,
  specialKey: keyof typeof Key,
) {
  try {
    await delayTime('short');
    const key = Key[specialKey] as string;
    await driver.actions().sendKeys(key).perform();
  } catch (error) {
    console.error(
      `Error occurred while attempting shortcut with the key '${specialKey}':`,
      error,
    );
    throw error;
  }
}

export async function getFocusedElementDataTestIds(
  driver: WebDriver,
): Promise<string[]> {
  const script = `
    function getDataTestIdOfElementAndChildren(element) {
      const dataTestIds = [];
      const dataTestId = element.getAttribute('data-testid');
      if (dataTestId) {
        dataTestIds.push(dataTestId);
      }
      for (const child of element.children) {
        dataTestIds.push(...getDataTestIdOfElementAndChildren(child));
      }
      return dataTestIds;
    }
    const activeElement = document.activeElement;
    return getDataTestIdOfElementAndChildren(activeElement);
  `;

  return driver.executeScript(script);
}

export async function returnAttributesOfActiveElement(
  driver: WebDriver,
  attribute: string,
): Promise<string> {
  const activeElement = await driver.switchTo().activeElement();
  return activeElement.getAttribute(attribute);
}

export async function navigateToElementWithTestId({
  driver,
  testId,
}: {
  driver: WebDriver;
  testId: string;
}): Promise<void> {
  try {
    await executePerformShortcut({ driver, key: 'TAB' });
    const testIds = await getFocusedElementDataTestIds(driver);
    if (testIds.includes(testId)) {
      await delayTime('short');
      await executePerformShortcut({ driver, key: 'ENTER' });
    } else {
      await navigateToElementWithTestId({ driver, testId });
    }
  } catch (error) {
    console.error(`Error occurred while executing shortcut:`, error);
    throw error;
  }
}

export async function executePerformShortcut({
  driver,
  key,
  timesToPress = 1,
}: {
  driver: WebDriver;
  key: keyof typeof Key | string;
  timesToPress?: number;
}): Promise<void> {
  try {
    const shortcuts = Array(timesToPress)
      .fill(null)
      .map(() => {
        if (!(key in Key)) {
          return performShortcutWithNormalKey(driver, key);
        } else {
          return performShortcutWithSpecialKey(driver, key as keyof typeof Key);
        }
      });
    await Promise.all(shortcuts);
  } catch (error) {
    console.error(`Error occurred while executing shortcut:`, error);
    throw error;
  }
}

export async function checkExtensionURL(driver: WebDriver, urlValue: string) {
  try {
    await driver.wait(until.urlContains(urlValue), waitUntilTime);
  } catch (error) {
    console.error(
      `Error occurred while checking url with the value '${urlValue}':`,
      error,
    );
    throw error;
  }
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
  const checkWallet = async (index: number): Promise<boolean> => {
    try {
      const el = await driver.wait(
        until.elementLocated(By.css(`[data-testid="${testIdPrefix}${index}"]`)),
        5000,
      );
      await driver.wait(until.elementIsVisible(el), 5000);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Recursive function to count wallets sequentially
  const countWalletsRecursive = async (
    index: number,
    count: number,
  ): Promise<number> => {
    const found = await checkWallet(index);
    if (!found) {
      return count;
    }
    return countWalletsRecursive(index + 1, count + 1);
  };

  return countWalletsRecursive(1, 0);
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

export async function navigateToSettings(driver: WebDriver, rootURL: string) {
  await goToPopup(driver, rootURL, '#/home');
  await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
  await findElementByTestIdAndClick({ id: 'settings-link', driver });
  await delayTime('medium');
}

export async function navigateToSettingsNetworks(
  driver: WebDriver,
  rootURL: string,
) {
  await goToPopup(driver, rootURL, '#/home');
  await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
  await findElementByTestIdAndClick({ id: 'settings-link', driver });
  await findElementByTestIdAndClick({ id: 'networks-link', driver });
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

export async function connectToTestDapp(driver: WebDriver) {
  await goToTestApp(driver);
  const dappHandler = await getWindowHandle({ driver });

  const button = await findElementByText(driver, 'Connect Wallet');
  expect(button).toBeTruthy();
  await waitAndClick(button, driver);

  const modalTitle = await findElementByText(driver, 'Connect a Wallet');
  expect(modalTitle).toBeTruthy();

  const mmButton = await querySelector(
    driver,
    '[data-testid="rk-wallet-option-me.rainbow"]',
  );
  await waitAndClick(mmButton, driver);

  const { popupHandler } = await getAllWindowHandles({
    driver,
    dappHandler,
  });

  await driver.switchTo().window(popupHandler);

  return { dappHandler, popupHandler };
}

export async function getOnchainBalance(addy: string, contract: string) {
  try {
    const provider = getDefaultProvider('http://127.0.0.1:8545');
    const testContract = new Contract(contract, erc20Abi, provider);
    const balance = await testContract.balanceOf(addy);

    return balance;
  } catch (error) {
    console.error('Error fetching on-chain balance:', error);
    throw error;
  }
}

export async function transactionStatus() {
  const provider = getDefaultProvider('http://127.0.0.1:8545');
  const blockData = await provider.getBlock('latest');
  const txnReceipt = await provider.getTransactionReceipt(
    blockData.transactions[0],
  );
  const txnStatus = txnReceipt.status === 1 ? 'success' : 'failure';
  return txnStatus;
}

export const fillSeedPhrase = async (driver: WebDriver, seedPhrase: string) => {
  const words = seedPhrase.trim().split(/\s+/);

  // Validate word count
  if (words.length !== 12 && words.length !== 24) {
    throw new Error(
      `Invalid seed phrase length: ${words.length}. Must be either 12 or 24 words.`,
    );
  }

  // Fill each word input dynamically based on the phrase length
  const wordInputs = words.map((word, i) =>
    typeOnTextInput({
      id: `secret-input-${i + 1}`,
      driver,
      text: word,
    }),
  );
  await Promise.all(wordInputs);
};

export const fillPrivateKey = async (driver: WebDriver, privateKey: string) => {
  return typeOnTextInput({
    id: 'private-key-input',
    driver,
    text: privateKey,
  });
};

export async function clickAcceptRequestButton(driver: WebDriver) {
  await waitUntilElementByTestIdIsPresent({
    id: 'accept-request-button',
    driver,
  });

  await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
}

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

export async function importWalletFlowUsingKeyboardNavigation(
  driver: WebDriver,
  rootURL: string,
  walletSecret: string,
  secondaryWallet = false as boolean,
) {
  if (secondaryWallet) {
    await goToPopup(driver, rootURL);
    await executePerformShortcut({ driver, key: 'w' });
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 3,
    });
    await executePerformShortcut({ driver, key: 'ENTER' });
  } else {
    await goToPopup(driver, rootURL);
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 2,
    });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 2,
    });
    await executePerformShortcut({ driver, key: 'ENTER' });
  }

  // ok
  const isPrivateKey =
    walletSecret.substring(0, 2) === '0x' && walletSecret.length === 66;

  await executePerformShortcut({
    driver,
    key: 'ARROW_DOWN',
    timesToPress: isPrivateKey ? 3 : 2,
  });
  await executePerformShortcut({ driver, key: 'ENTER' });
  // ok
  isPrivateKey
    ? await fillPrivateKey(driver, walletSecret)
    : await fillSeedPhrase(driver, walletSecret);

  await executePerformShortcut({
    driver,
    key: 'ARROW_DOWN',
  });
  await executePerformShortcut({ driver, key: 'ENTER' });
  if (!isPrivateKey) {
    await delayTime('very-long');
    await findElementByTestId({ id: 'add-wallets-button-section', driver });
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 2,
    });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, '/create-password');
    await driver.wait(untilDocumentLoaded(), waitUntilTime);
  }
  // ok
  if (secondaryWallet) {
    await delayTime('medium');
    const accountHeader = await findElementById({
      id: 'header-account-name-shuffle',
      driver,
    });
    expect(accountHeader).toBeTruthy();
  } else {
    await checkExtensionURL(driver, '/create-password');
    await driver.wait(untilDocumentLoaded(), waitUntilTime);

    await driver.actions().sendKeys(testPassword).perform();
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
    });
    await driver.actions().sendKeys(testPassword).perform();
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
    });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await delayTime('long');
    const welcomeText = await findElementByText(
      driver,
      'Rainbow is ready to use',
    );
    expect(welcomeText).toBeTruthy();
  }
}

export async function importWalletFlow(
  driver: WebDriver,
  rootURL: string,
  walletSecret: string,
  secondaryWallet = false as boolean,
  is24WordSeedPhrase = false as boolean,
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

  if (is24WordSeedPhrase) {
    findElementByTestIdAndClick({
      id: 'toggle-24-word-seed-phrase',
      driver,
    });
    await delayTime('medium');
  }

  if (isPrivateKey) {
    await fillPrivateKey(driver, walletSecret);
  } else {
    await fillSeedPhrase(driver, walletSecret);
  }

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
    await delayTime('very-long');

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

  const wordPromises = requiredWordsIndexes.map(async (index) => {
    const wordElement = await querySelector(
      driver,
      `[data-testid="seed_word_${index}"]`,
    );
    return wordElement.getText();
  });
  const words = await Promise.all(wordPromises);
  requiredWords.push(...words);

  await findElementByTestIdAndClick({
    id: 'saved-these-words-button',
    driver,
  });
  await delayTime('long');

  const clickPromises = requiredWords.map((word) =>
    findElementByTestIdAndClick({ id: `word_${word}`, driver }),
  );
  await Promise.all(clickPromises);

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
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function takeScreenshotOnFailure(context: any) {
  context.onTestFailed(async () => {
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
      console.log(`Folder screenshots created.`);
    }
    const normalizedFilePath = context.task.name
      .replace(/'/g, '')
      .replace(/"/g, '')
      .replace(/=/g, '')
      .replace(/\//g, '_')
      .replace(/:/g, '_')
      .replace(/ /g, '_');
    let fileName = `${normalizedFilePath}_failure`;
    let counter = 0;
    while (fs.existsSync(`screenshots/${fileName}.png`)) {
      counter += 1;
      fileName = `${fileName}_${counter}`;
      if (counter > 10) break;
    }
    console.log(`Screenshot of the failed test will be saved to: ${fileName}`);
    try {
      const image = await context.driver.takeScreenshot();
      fs.writeFileSync(`screenshots/${fileName}.png`, image, 'base64');
    } catch (error) {
      console.error('Error occurred while taking screenshot:', error);
    }
  });
}

export async function performSearchTokenAddressActionsCmdK({
  driver,
  tokenAddress,
  tokenName,
  rootURL,
}: {
  driver: WebDriver;
  tokenAddress: string;
  tokenName: string;
  rootURL: string;
}) {
  await goToPopup(driver, rootURL, '#/home');

  // Open Cmd+K menu
  await executePerformShortcut({ driver, key: 'k' });

  await clearInput({ id: 'command-k-input', driver });

  await typeOnTextInput({
    id: 'command-k-input',
    driver,
    text: tokenAddress,
  });

  await waitUntilElementByTestIdIsPresent({
    id: `command-name-${tokenName}`,
    driver,
  });

  await executePerformShortcut({
    driver,
    key: 'ARROW_DOWN',
  });

  // Go to token details
  await executePerformShortcut({ driver, key: 'ENTER' });

  await checkExtensionURL(driver, 'token-details');

  await waitUntilElementByTestIdIsPresent({
    id: `about-${tokenAddress}`,
    driver,
  });

  await waitUntilElementByTestIdIsPresent({
    id: `token-price-name-${tokenAddress}`,
    driver,
  });
}
