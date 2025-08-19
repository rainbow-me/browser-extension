import { WebDriver } from 'selenium-webdriver';
import { expect } from 'vitest';

import { RAINBOW_TEST_DAPP } from '~/core/references/links';

import { delayTime } from './delays';
import {
  findElementByTestIdAndClick,
  findElementByText,
  querySelector,
  waitAndClick,
  waitUntilElementByTestIdIsPresent,
} from './elements';
import {
  getAllWindowHandles,
  getWindowHandle,
  untilDocumentLoaded,
} from './navigation';

const waitUntilTime = 20_000;

export async function goToTestApp(driver: WebDriver) {
  await driver.get(RAINBOW_TEST_DAPP);
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  await delayTime('very-long');
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

export async function clickAcceptRequestButton(driver: WebDriver) {
  await waitUntilElementByTestIdIsPresent({
    id: 'accept-request-button',
    driver,
  });

  await findElementByTestIdAndClick({ id: 'accept-request-button', driver });
}
