/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'node:fs';
import path from 'node:path';

import { Contract } from '@ethersproject/contracts';
import { getDefaultProvider } from '@ethersproject/providers';
import {
  Builder,
  By,
  Condition,
  Key,
  WebDriver,
  WebElement,
  logging,
  until,
} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';
import { erc20Abi } from 'viem';
import { expect } from 'vitest';

import { RAINBOW_TEST_DAPP } from '~/core/references/links';

import {
  browser,
  browserBinaryPath,
  browserExtensionScheme,
} from './helpers/environment';

// consts

const waitUntilTime = 20_000;
const testPassword = 'test1234';

export const getRootUrl = () => {
  return browserExtensionScheme;
};

// navigators

/**
 * Injects a lightweight console interceptor into the current page context.
 * Captured messages are stored on `window.__rainbowE2EConsoleLogs` and
 * collected by `takeScreenshotOnFailure` when a test fails.
 */
async function injectConsoleInterceptor(driver: WebDriver): Promise<void> {
  try {
    await driver.executeScript(`
      if (!window.__rainbowE2EConsoleLogs) {
        window.__rainbowE2EConsoleLogs = [];
        const maxLogs = 500;
        ['log', 'warn', 'error', 'info', 'debug'].forEach(function(level) {
          const original = console[level];
          console[level] = function() {
            try {
              const args = Array.prototype.slice.call(arguments);
              const message = args.map(function(a) {
                try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
                catch(e) { return String(a); }
              }).join(' ');
              if (window.__rainbowE2EConsoleLogs.length < maxLogs) {
                window.__rainbowE2EConsoleLogs.push({
                  level: level,
                  message: message,
                  timestamp: Date.now()
                });
              }
            } catch(e) {}
            return original.apply(console, arguments);
          };
        });
      }
    `);
  } catch {
    // Injection failed (e.g. page not ready); non-critical
  }
}

export async function goToTestApp(driver: WebDriver) {
  await driver.get(RAINBOW_TEST_DAPP);
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  await injectConsoleInterceptor(driver);
  await delayTime('very-long');
}

export async function goToPopup(
  driver: WebDriver,
  rootURL: string,
  route = '',
) {
  await driver.get(rootURL + '/popup.html' + route);
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  await injectConsoleInterceptor(driver);
  await delayTime('very-long');
}

export async function goToWelcome(driver: WebDriver, rootURL: string) {
  await driver.get(rootURL + '/popup.html#/welcome');
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  await injectConsoleInterceptor(driver);
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
  const buildPath = path.resolve(process.cwd(), 'build');
  const args = [
    // Set browser language to English
    'lang=en',
    // Suppress most console logging (fatal errors only)
    'log-level=3',
  ];

  if (opts.browser === 'firefox') {
    const firefoxArgs = args.map((arg) => `-${arg}`);

    if (process.env.HEADLESS !== 'false') {
      firefoxArgs.push('-headless', '-width=500', '-height=720');
    }

    const options = new firefox.Options()
      .setBinary(browserBinaryPath)
      .addArguments(...firefoxArgs)
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
    const chromeArgs = [
      ...args,
      // Load unpacked extension from build directory
      `load-extension=${buildPath}`,
      `disable-extensions-except=${buildPath}`,
      // Enable Chrome logging for debugging
      'enable-logging',
      // Disable sandbox for CI/Docker environments
      'no-sandbox',
      'disable-dev-shm-usage',
      // Allow extension popups to open
      'disable-popup-blocking',
      // Remove automation infobars
      'disable-blink-features=AutomationControlled',
      'disable-infobars',
      // Prevent throttling that breaks keyboard events in headless
      'disable-background-timer-throttling',
      'disable-backgrounding-occluded-windows',
      'disable-renderer-backgrounding',
      'disable-ipc-flooding-protection',
      // BX-1923: localhost network access is permissioned in dev 139, and prod 141
      'disable-features=LocalNetworkAccessChecks,LocalNetworkAccessForWorkers',
    ];

    if (process.env.HEADLESS !== 'false') {
      chromeArgs.push('headless', 'window-size=500,720');
    }

    const logPrefs = new logging.Preferences();
    logPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

    const options = new chrome.Options();
    options.setChromeBinaryPath(browserBinaryPath);
    options.addArguments(...chromeArgs);
    options.setAcceptInsecureCerts(true);
    options.setLoggingPrefs(logPrefs);
    options.setUserPreferences({
      'intl.accept_languages': 'en-US,en;q=0.9',
    });

    const existingGoogChromeOptions = options.get('goog:chromeOptions') || {};

    options.set(
      'goog:chromeOptions',
      Object.assign(existingGoogChromeOptions, {
        enableExtensionTargets: true,
        windowTypes: ['popup', 'app'],
      }),
    );

    const service = new chrome.ServiceBuilder().setStdio('inherit');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();
  }
  // @ts-ignore
  driver.browser = opts.browser;

  // Inject console interceptor into the service worker (Chrome only)
  if (opts.browser !== 'firefox') {
    try {
      const targetsResult =
        // @ts-ignore - sendAndGetDevToolsCommand is on ChromiumWebDriver
        await driver.sendAndGetDevToolsCommand('Target.getTargets');
      const targets: Array<{
        targetId: string;
        type: string;
        url: string;
      }> = targetsResult?.targetInfos ?? [];

      const swTarget = targets.find(
        (t) =>
          t.type === 'service_worker' &&
          t.url.startsWith('chrome-extension://'),
      );

      if (swTarget) {
        // @ts-ignore
        const { sessionId } = await driver.sendAndGetDevToolsCommand(
          'Target.attachToTarget',
          { targetId: swTarget.targetId, flatten: true },
        );

        if (sessionId) {
          // @ts-ignore
          await driver.sendAndGetDevToolsCommand('Runtime.enable');

          // Inject console interceptor into the service worker context
          // @ts-ignore
          await driver.sendAndGetDevToolsCommand('Runtime.evaluate', {
            expression: `
              if (!self.__rainbowE2EConsoleLogs) {
                self.__rainbowE2EConsoleLogs = [];
                const maxLogs = 500;
                ['log', 'warn', 'error', 'info', 'debug'].forEach(function(level) {
                  const original = console[level];
                  console[level] = function() {
                    try {
                      const args = Array.prototype.slice.call(arguments);
                      const message = args.map(function(a) {
                        try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
                        catch(e) { return String(a); }
                      }).join(' ');
                      if (self.__rainbowE2EConsoleLogs.length < maxLogs) {
                        self.__rainbowE2EConsoleLogs.push({
                          level: level,
                          message: message,
                          timestamp: Date.now()
                        });
                      }
                    } catch(e) {}
                    return original.apply(console, arguments);
                  };
                });
              }
            `,
            returnByValue: true,
          });

          // Detach from target to avoid interference
          await driver
            // @ts-ignore - sendDevToolsCommand is on ChromiumWebDriver
            .sendDevToolsCommand('Target.detachFromTarget', { sessionId })
            .catch(() => {});
        }
      }
    } catch {
      // Non-critical: SW interceptor injection failed
    }
  }

  return driver;
}

const addPermissionForAllWebsites = async (driver: WebDriver) => {
  // Add the permission to access all websites
  await driver.get('about:addons');
  const sidebarBtn = await querySelector(driver, `[title="Extensions"]`);
  await sidebarBtn.click();
  const moreBtn = await querySelector(driver, `[action="more-options"]`);
  await moreBtn.click();
  const manageBtn = await querySelector(
    driver,
    `[data-l10n-id="manage-addon-button"]`,
  );
  await manageBtn.click();
  await findElementByIdAndClick({
    id: 'details-deck-button-permissions',
    driver,
  });
  await driver.executeScript(
    `document.querySelectorAll('[class="permission-info"]')[0].children[0].click();`,
  );
};

interface ExtensionInfo {
  name: string | undefined;
  id: string | null;
  rawName: string | undefined;
}

interface ExtensionsResponse {
  extensionsFound: ExtensionInfo[];
  searchingFor: string;
}

interface ErrorResponse {
  error: string;
}

export async function getExtensionIdByName(
  driver: WebDriver,
  extensionName: string,
) {
  // @ts-ignore
  if (driver?.browser === 'firefox') {
    await addPermissionForAllWebsites(driver);

    await driver.get('about:debugging#addons');
    const text = await driver
      .wait(
        until.elementLocated(
          By.xpath(
            "//dt[contains(., 'Extension ID')]/following-sibling::dd[contains(., 'rainbow')]/../following-sibling::div/dt[contains(., 'Internal UUID')]/following-sibling::dd",
          ),
        ),
        1000,
      )
      .getText();
    return text;
  } else {
    await driver.get('chrome://extensions');

    const result = (await driver.executeScript(`
    return new Promise((resolve) => {
      const extensions = document.querySelector("extensions-manager")?.shadowRoot
        ?.querySelector("extensions-item-list")?.shadowRoot
        ?.querySelectorAll("extensions-item");

      if (!extensions) {
        resolve({ error: "No extensions found" });
        return;
      }

      const extensionsList = Array.from(extensions).map(extension => ({
        name: extension.shadowRoot?.querySelector('#name')?.textContent?.trim(),
        id: extension.getAttribute("id"),
        rawName: extension.shadowRoot?.querySelector('#name')?.textContent
      }));

      resolve({
        extensionsFound: extensionsList,
        searchingFor: "${extensionName}"
      });
    });
  `)) as ExtensionsResponse | ErrorResponse;

    console.log('Debug info:', JSON.stringify(result, null, 2));

    if ('error' in result) {
      console.log('Error:', result.error);
      return undefined;
    }

    const matchingExtension = result.extensionsFound.find(
      (ext) => ext.name?.toLowerCase().includes(extensionName.toLowerCase()),
    );

    if (matchingExtension) {
      console.log(
        `Found matching extension: "${matchingExtension.name}" with ID: ${matchingExtension.id}`,
      );
      return matchingExtension.id;
    }

    console.log('No matching extension found');
    return undefined;
  }
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
    new Promise((resolve) => setTimeout(() => resolve(false), 1000)),
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
  if (browser === 'firefox') {
    id &&
      (await clearInput({
        id,
        driver,
      }));
  }
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  key: any;
  timesToPress?: number;
}): Promise<void> {
  try {
    for (let i = 0; i < timesToPress; i++) {
      if (!(key in Key)) {
        await performShortcutWithNormalKey(driver, key);
      } else {
        await performShortcutWithSpecialKey(driver, key);
      }
    }
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
    const provider = getDefaultProvider('http://127.0.0.1:8545/1');
    const testContract = new Contract(contract, erc20Abi, provider);
    const balance = await testContract.balanceOf(addy);

    return balance;
  } catch (error) {
    console.error('Error fetching on-chain balance:', error);
    throw error;
  }
}

export async function transactionStatus() {
  const provider = getDefaultProvider('http://127.0.0.1:8545/1');
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
  for (let i = 0; i < words.length; i++) {
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
  // Poll using driver.executeScript instead of element.getText() to actively
  // run JavaScript in the page context. This forces the tab's event loop to
  // process pending callbacks (e.g. window.postMessage responses from the
  // extension) that might otherwise be deferred while the tab was backgrounded.
  const startTime = Date.now();
  let lastActualText = '';

  while (Date.now() - startTime < waitUntilTime) {
    try {
      const actualText = await driver.executeScript<string>(
        `return document.getElementById(${JSON.stringify(
          id,
        )})?.innerText || ''`,
      );
      if (actualText === text) return;
      lastActualText = actualText;
    } catch {
      // Element might not exist yet, continue polling
    }
    await delay(500);
  }

  console.error(
    `awaitTextChange: expected '${text}', got '${lastActualText}' for #${id}`,
  );
  throw new Error(
    `Timeout waiting for element #${id} to have text '${text}'. Actual text: '${lastActualText}'`,
  );
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

function ensureScreenshotsDir() {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
    console.log('Folder screenshots created.');
  }
}

function getFailureFileName(testName: string): string {
  const normalizedFilePath = testName
    .replace(/'/g, '')
    .replace(/"/g, '')
    .replace(/=/g, '')
    .replace(/\//g, '_')
    .replace(/:/g, '_')
    .replace(/ /g, '_');
  let fileName = `${normalizedFilePath}_failure`;
  let counter = 0;
  while (fs.existsSync(`screenshots/${fileName}.png`)) {
    counter++;
    fileName = `${normalizedFilePath}_failure_${counter}`;
    if (counter > 10) break;
  }
  return fileName;
}

interface ConsoleLogEntry {
  readonly source: string;
  readonly url: string;
  readonly logs: ReadonlyArray<{
    readonly level: string;
    readonly message: string;
    readonly timestamp: number;
  }>;
}

async function collectBrowserConsoleLogs(
  driver: WebDriver,
): Promise<readonly ConsoleLogEntry[]> {
  const entries: ConsoleLogEntry[] = [];

  try {
    // @ts-ignore - check if this is a Chrome driver
    const isChrome = driver.browser !== 'firefox';
    if (!isChrome) return entries;

    const currentHandle = await driver.getWindowHandle().catch(() => null);
    const allHandles = await driver.getAllWindowHandles().catch(() => []);

    // Collect console logs from each open window (popup / dApp tabs)
    for (const handle of allHandles) {
      try {
        await driver.switchTo().window(handle);
        const url: string = await driver.getCurrentUrl();

        // Determine the source label based on the URL
        const source = url.startsWith('chrome-extension://')
          ? 'extension-popup'
          : url.startsWith('moz-extension://')
          ? 'extension-popup'
          : 'dapp';

        // Collect console messages that were captured via executeScript
        const consoleLogs = ((await driver
          .executeScript(
            `
          try {
            // Return logs if our interceptor captured them
            if (window.__rainbowE2EConsoleLogs) {
              return window.__rainbowE2EConsoleLogs;
            }
            return [];
          } catch(e) {
            return [];
          }
        `,
          )
          .catch(() => [])) ?? []) as Array<{
          level: string;
          message: string;
          timestamp: number;
        }>;

        entries.push({ source, url, logs: consoleLogs });
      } catch {
        // Window may have been closed, skip it
      }
    }

    // Restore original window handle
    if (currentHandle) {
      await driver
        .switchTo()
        .window(currentHandle)
        .catch(() => {});
    }

    // Collect Selenium browser logs (captures all console output from the
    // currently-focused context since the last retrieval)
    try {
      const browserLogs = await driver
        .manage()
        .logs()
        .get(logging.Type.BROWSER);
      if (browserLogs.length > 0) {
        entries.push({
          source: 'browser-log-api',
          url: 'selenium-managed-logs',
          logs: browserLogs.map((entry) => ({
            level: entry.level.name,
            message: entry.message,
            timestamp: entry.timestamp,
          })),
        });
      }
    } catch {
      // Log retrieval not supported (e.g. Firefox)
    }

    // Collect service worker / background script console logs via CDP
    try {
      const targetsResult =
        // @ts-ignore - sendAndGetDevToolsCommand is available on ChromiumWebDriver
        await driver.sendAndGetDevToolsCommand('Target.getTargets');
      const targets: Array<{
        targetId: string;
        type: string;
        title: string;
        url: string;
      }> = targetsResult?.targetInfos ?? [];

      const swTarget = targets.find(
        (t) =>
          t.type === 'service_worker' &&
          t.url.startsWith('chrome-extension://'),
      );

      if (swTarget) {
        // @ts-ignore
        const { sessionId } = await driver.sendAndGetDevToolsCommand(
          'Target.attachToTarget',
          { targetId: swTarget.targetId, flatten: true },
        );

        if (sessionId) {
          // Enable Runtime on the service worker session to read console logs
          // Note: Collected logs are from Runtime.consoleAPICalled events which
          // require a persistent listener. For now we capture what Selenium's
          // log API provides, plus attempt to get any errors from the SW.
          // @ts-ignore
          await driver.sendDevToolsCommand('Runtime.enable', {}, sessionId);

          // Evaluate a small expression in the SW context to verify connectivity
          // (actual historic console logs are not retrievable after the fact via
          // CDP without a prior listener, but error events are).
          // @ts-ignore
          const evalResult = await driver.sendAndGetDevToolsCommand(
            'Runtime.evaluate',
            {
              expression:
                'typeof __rainbowE2EConsoleLogs !== "undefined" ? JSON.stringify(__rainbowE2EConsoleLogs) : "[]"',
              returnByValue: true,
            },
          );

          const swLogs = JSON.parse(
            evalResult?.result?.value ?? '[]',
          ) as Array<{ level: string; message: string; timestamp: number }>;

          entries.push({
            source: 'extension-background',
            url: swTarget.url,
            logs: swLogs,
          });

          // Detach to avoid side effects
          await driver
            // @ts-ignore - sendDevToolsCommand is on ChromiumWebDriver
            .sendDevToolsCommand('Target.detachFromTarget', { sessionId })
            .catch(() => {});
        }
      }
    } catch {
      // CDP commands not available or failed; skip background log collection
    }
  } catch {
    // Catch-all: don't let log collection break the test teardown
  }

  return entries;
}

const ANVIL_MESSAGES_URL = 'http://127.0.0.1:8545/1/messages';

/**
 * Fetches the in-memory message buffer from the local Anvil instance exposed
 * by prool's HTTP server.  These messages contain transaction traces, revert
 * reasons, and other EVM-level diagnostics that are invaluable when debugging
 * on-chain failures in E2E tests.
 */
async function collectAnvilLogs(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);

    const response = await fetch(ANVIL_MESSAGES_URL, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return `(anvil logs unavailable – HTTP ${response.status})`;
    }

    const messages: string[] = await response.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return '(no anvil messages captured)';
    }

    return messages.join('\n');
  } catch {
    return '(anvil logs unavailable – could not reach anvil server)';
  }
}

function formatConsoleLogs(entries: readonly ConsoleLogEntry[]): string {
  const sections = entries
    .filter((entry) => entry.logs.length > 0)
    .map((entry) => {
      const header = `=== ${entry.source} | ${entry.url} ===`;
      const logLines = entry.logs.map((log) => {
        const time = new Date(log.timestamp).toISOString();
        return `[${time}] [${log.level}] ${log.message}`;
      });
      return [header, ...logLines].join('\n');
    });

  return sections.length > 0
    ? sections.join('\n\n')
    : '(no console logs captured)';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function takeScreenshotOnFailure(context: any) {
  context.onTestFailed(async () => {
    ensureScreenshotsDir();
    const fileName = getFailureFileName(context.task.name);

    // Capture screenshot
    console.log(`Screenshot of the failed test will be saved to: ${fileName}`);
    try {
      const image = await context.driver.takeScreenshot();
      fs.writeFileSync(`screenshots/${fileName}.png`, image, 'base64');
    } catch (error) {
      console.error('Error occurred while taking screenshot:', error);
    }

    // Capture console logs from all contexts
    try {
      const consoleLogs = await collectBrowserConsoleLogs(context.driver);
      const formatted = formatConsoleLogs(consoleLogs);
      fs.writeFileSync(
        `screenshots/${fileName}_console.log`,
        formatted,
        'utf8',
      );
      console.log(`Console logs saved to: ${fileName}_console.log`);
    } catch (error) {
      console.error('Error occurred while capturing console logs:', error);
    }

    // Capture Anvil instance logs (transaction traces, revert reasons, etc.)
    try {
      const anvilLogs = await collectAnvilLogs();
      fs.writeFileSync(`screenshots/${fileName}_anvil.log`, anvilLogs, 'utf8');
      console.log(`Anvil logs saved to: ${fileName}_anvil.log`);
    } catch (error) {
      console.error('Error occurred while capturing anvil logs:', error);
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
