/**
 * WebDriver initialization with simplified proxy configuration
 */

import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';

import { browserBinaryPath } from './environment';

interface DriverOptions {
  browser: string;
  os: string;
  useProxy?: boolean;
  proxyPort?: number;
}

/**
 * Initialize WebDriver with optional proxy configuration
 * Separates proxy setup from the main helpers file
 */
export async function initDriverWithProxy(
  opts: DriverOptions,
): Promise<WebDriver> {
  const { browser, useProxy = false, proxyPort = 8080 } = opts;

  let driver: WebDriver;

  if (browser === 'firefox') {
    const options = new firefox.Options()
      .setBinary(browserBinaryPath)
      .setPreference('xpinstall.signatures.required', false)
      .setPreference('extensions.langpacks.signatures.required', false)
      .addExtensions('rainbowbx.xpi');

    if (useProxy) {
      options.setPreference('network.proxy.type', 1);
      options.setPreference('network.proxy.http', 'localhost');
      options.setPreference('network.proxy.http_port', proxyPort);
      options.setPreference('network.proxy.ssl', 'localhost');
      options.setPreference('network.proxy.ssl_port', proxyPort);
    }

    const service = new firefox.ServiceBuilder().setStdio('inherit');

    driver = await new Builder()
      .setFirefoxService(service)
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build();
  } else {
    // Chrome configuration
    const options = new chrome.Options();
    options.setChromeBinaryPath(browserBinaryPath);

    // Base arguments
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

    // Add proxy configuration if enabled
    if (useProxy) {
      args.push(
        `--proxy-server=http://localhost:${proxyPort}`,
        // Bypass proxy for local addresses (Chrome DevTools, etc.)
        '--proxy-bypass-list=<-loopback>,127.0.0.1,localhost',
        // CRITICAL: Ignore certificate errors for MITM proxy
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--ignore-ssl-errors',
        '--allow-insecure-localhost',
      );
      console.log(
        `[Driver] Configured Chrome to use proxy at localhost:${proxyPort}`,
      );
      console.log(
        `[Driver] ⚠️ Certificate verification disabled for MITM proxy`,
      );
    }

    options.addArguments(...args);
    options.setAcceptInsecureCerts(true);

    // Enable Chrome extension debugging
    const existingGoogChromeOptions = options.get('goog:chromeOptions') || {};
    options.set(
      'goog:chromeOptions',
      Object.assign(existingGoogChromeOptions, {
        enableExtensionTargets: true,
        windowTypes: ['popup', 'app'],
      }),
    );

    // Enable logging for debugging
    options.set('goog:loggingPrefs', {
      browser: 'ALL',
      driver: 'ALL',
    });

    const service = new chrome.ServiceBuilder().setStdio('inherit');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();
  }

  // Store browser type on driver instance for later reference
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  driver.browser = browser;

  return driver;
}
