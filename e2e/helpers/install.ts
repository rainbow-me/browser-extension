import { Builder, By, WebDriver, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';

import { findElementByIdAndClick, querySelector } from '../helpers';

import { browser, browserPath } from './environment';

// Initialize the selenium driver
export async function initDriver(): Promise<WebDriver> {
  let driver: WebDriver;
  const args = [
    'load-extension=build/',
    '--log-level=3',
    '--enable-logging',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions-except=build/',
    '--disable-popup-blocking',
    '--remote-debugging-port=9222',
  ];

  if (browser === 'firefox') {
    const options = new firefox.Options()
      .setBinary(browserPath)
      .addArguments(...args.slice(1))
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
    const options = new chrome.Options()
      .setChromeBinaryPath(browserPath)
      .addArguments(...args);
    options.setAcceptInsecureCerts(true);

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
      .setChromeOptions(options as chrome.Options)
      .setChromeService(service)
      .build();
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

// Collects the extension id for the given extension install
export async function getExtensionIdByName(
  driver: WebDriver,
  extensionName: string,
) {
  if (browser === 'firefox') {
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
