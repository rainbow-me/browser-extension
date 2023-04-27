/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
/* eslint-disable @typescript-eslint/no-var-requires */
import { ethers } from 'ethers';
import { Builder, By, WebDriver, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { erc20ABI } from 'wagmi';

const waitUntilTime = 20000;

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

export async function querySelector(driver, selector) {
  const el = await driver.wait(
    until.elementLocated(By.css(selector)),
    waitUntilTime,
  );
  return await driver.wait(until.elementIsVisible(el), waitUntilTime);
}

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

  // transactionResponse.wait.status returns '1' if the txn was sent successfully and '0' if its a failure
  const txnStatus = (await txnData).status === 1 ? 'success' : 'failure';

  return txnStatus;
}

export async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function findElementByText(driver, text) {
  return driver.findElement(By.xpath("//*[contains(text(),'" + text + "')]"));
}

export async function waitAndClick(element, driver) {
  await delay(200);
  await driver.wait(until.elementIsVisible(element), waitUntilTime);
  return element.click();
}

export async function findElementAndClick({ id, driver }) {
  await delay(200);
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

export async function findElementByIdAndClick({ id, driver }) {
  await delay(200);
  const element = await findElementById({ id, driver });
  await waitAndClick(element, driver);
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
