/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
/* eslint-disable @typescript-eslint/no-var-requires */
import { By, until, Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

const waitUntilTime = 20000;

const BINARY_PATHS = {
  mac: {
    chrome: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    brave: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  },
  linux: {
    chrome: process.env.CHROMIUM_BIN,
    brave: '/usr/bin/brave-browser-stable',
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

export async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function findElementByText(driver, text) {
  return driver.findElement(By.xpath("//*[contains(text(),'" + text + "')]"));
}

export async function waitAndClick(element, driver) {
  await driver.wait(until.elementIsVisible(element), waitUntilTime);
  return element.click();
}
