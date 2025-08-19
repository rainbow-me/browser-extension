import { Condition, WebDriver, until } from 'selenium-webdriver';

import { delayTime } from './delays';
import { findElementByTestIdAndClick } from './elements';

const waitUntilTime = 20_000;

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

// custom conditions
export const untilDocumentLoaded = async function () {
  return new Condition('for document to load', async (driver: WebDriver) => {
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
