/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable jest/expect-expect */

require('chromedriver');
require('geckodriver');
const { By } = require('selenium-webdriver');
const {
  querySelector,
  delay,
  getExtensionIdByName,
  initDriverWithOptions,
  findElementByText,
} = require('./helpers');

let rootURL = 'chrome-extension://';
let driver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

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

it('Should open the popup', async () => {
  await driver.get(rootURL + '/popup.html');
});

it('should have an h1 saying "Rainbow Rocks!!!"', async () => {
  const h1 = await querySelector(driver, 'h1');
  const actual = await h1.getText();
  const expected = 'Rainbow Rocks!!!';
  expect(actual).toEqual(expected);
});

it('should be able to turn ON injection', async () => {
  let label = await querySelector(driver, '[data-testid="injection-status"]');
  let actual = await label.getText();
  let expected = 'NO';
  expect(actual).toEqual(expected);

  await driver.findElement({ id: 'injection-button' }).click();
  // Wait till the DOM re-renders
  await delay(1000);

  label = await querySelector(driver, '[data-testid="injection-status"]');
  actual = await label.getText();
  expected = 'YES';

  expect(actual).toEqual(expected);
});

it('should be able to connect to rainbowkit', async () => {
  await driver.get('https://rainbowkit.com');

  const button = await findElementByText(driver, 'Connect Wallet');
  expect(button).toBeTruthy();
  await button.click();

  const modalTitle = await findElementByText(driver, 'Connect a Wallet');
  expect(modalTitle).toBeTruthy();

  const buttons = await driver.findElements(By.css('button'));
  let mmButton = null;
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    if ((await button.getText()) === 'MetaMask') {
      mmButton = button;
      break;
    }
  }

  expect(await mmButton.getText()).toEqual('MetaMask');
  await mmButton.click();

  // This sucks but I don't have another way of selecting the button
  // Rainbowkit doesn't have any attribute that helps us to select it
  // Also I think this will break if there's a redeployment
  const topButton = await querySelector(
    driver,
    '.iekbcc0.iekbcc9.ju367v4.ju367v9x.ju367vn.ju367vec.ju367vfo.ju367va.ju367v11.ju367v1c.ju367v8o._12cbo8i3.ju367v8m._12cbo8i4._12cbo8i6:last-child',
  );

  expect(topButton).toBeTruthy();
  await topButton.click();

  const ensLabel = await querySelector(driver, '[id="rk_profile_title"]');
  expect(ensLabel).toBeTruthy();
});
