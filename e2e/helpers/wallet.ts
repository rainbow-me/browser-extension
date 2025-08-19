import { By, WebDriver, until } from 'selenium-webdriver';
import { expect } from 'vitest';

import { delayTime } from './delays';
import {
  findElementByIdAndClick,
  findElementByTestIdAndClick,
  waitUntilElementByTestIdIsPresent,
} from './elements';
import { getTextFromText } from './input';
import { goToPopup } from './navigation';

export function shortenAddress(address: string) {
  // if address is 42 in length and starts with 0x, then shorten it
  // otherwise return the base value. this is so it doesn't break incase an ens, etc is input
  return address.substring(0, 2) === '0x' && address.length === 42
    ? `${address.substring(0, 6)}…${address.substring(38, 42)}`
    : address;
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
