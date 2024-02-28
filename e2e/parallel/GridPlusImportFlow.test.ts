import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import { afterAll, beforeAll, describe, it } from 'vitest';

import {
  getExtensionIdByName,
  getRootUrl,
  importGridPlusWallet,
  initDriverWithOptions,
} from '../helpers';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe.runIf(browser !== 'firefox')(
  'Import wallet with GridPlus Lattice1',
  () => {
    beforeAll(async () => {
      driver = await initDriverWithOptions({
        browser,
        os,
      });
      const extensionId = await getExtensionIdByName(driver, 'Rainbow');
      if (!extensionId) throw new Error('Extension not found');
      rootURL += extensionId;
    });
    afterAll(async () => driver.quit());

    it('should be able import a wallet via hw wallet', async () => {
      if (process.env.IS_TESTING === 'true')
        await importGridPlusWallet(driver, rootURL);
    });
  },
);
