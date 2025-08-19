import { WebDriver } from 'selenium-webdriver';

import { delayTime } from './delays';
import { findElementByTestIdAndClick } from './elements';
import { goToPopup } from './navigation';

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
