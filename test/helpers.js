/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
/* eslint-disable @typescript-eslint/no-var-requires */
const { By, until, Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const waitUntilTime = 20000;

const BINARY_PATHS = {
  mac: {
    chrome: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    brave: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  },
  linux: {
    chrome: process.env.CHROMIUM_BIN,
    brave: '/usr/bin/brave',
  },
};

async function querySelector(driver, selector) {
  const el = await driver.wait(
    until.elementLocated(By.css(selector)),
    waitUntilTime,
  );
  return await driver.wait(until.elementIsVisible(el), waitUntilTime);
}

async function initDriverWithOptions(opts) {
  const args = ['load-extension=build/', '--log-level=0', '--enable-logging'];
  if (opts.os === 'mac') {
    args.push('--auto-open-devtools-for-tabs');
  } else if (opts.os === 'linux') {
    args.push('--disable-dev-shm-usage');
  }

  const options = new chrome.Options().addArguments(args);
  options.setAcceptInsecureCerts(true);
  options.setChromeBinaryPath(BINARY_PATHS[opts.os][opts.browser]);

  const service = new chrome.ServiceBuilder()
    .setStdio('inherit')
    .enableChromeLogging();

  return await new Builder()
    .setChromeService(service)
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

async function getExtensionIdByName(driver, extensionName) {
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

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findElementByText(driver, text) {
  return driver.findElement(By.xpath("//*[contains(text(),'" + text + "')]"));
}

async function waitAndClick(element, driver) {
  await driver.wait(until.elementIsVisible(element), waitUntilTime);
  return element.click();
}

module.exports = {
  delay,
  findElementByText,
  waitAndClick,
  getExtensionIdByName,
  initDriverWithOptions,
  querySelector,
};
