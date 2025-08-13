import * as fs from 'node:fs';

import { By, WebDriver, WebElement } from 'selenium-webdriver';

import { delayTime } from '../helpers';

// Helper to get the test file name from stack trace
function getTestFileFromStack(): string {
  const stack = new Error().stack || '';
  const stackLines = stack.split('\n');

  // Find the test file in the stack (looking for .test.ts files)
  for (const line of stackLines) {
    const match = line.match(/\/(parallel|serial)\/(.+?)\.test\.ts/);
    if (match) {
      // Extract directory and filename: e.g., "send/1_sendFlow" from "serial/send/1_sendFlow.test.ts"
      const pathParts = match[2].split('/');
      if (pathParts.length > 1) {
        // Multi-level path like "send/1_sendFlow"
        return pathParts.join('-');
      } else {
        // Single file like "newWalletFlow"
        return pathParts[0];
      }
    }
  }
  return 'test';
}

interface ScreenshotOptions {
  driver: WebDriver;
  testName?: string;
  slug?: string;
  waitForAnimations?: boolean;
  captureElement?: boolean;
}

interface ScreenshotContext {
  driver: WebDriver;
  task?: {
    name?: string;
  };
}

/**
 * Captures a screenshot of the extension popup for Percy and debugging.
 *
 * @param context - Test context containing driver and optional task info
 * @param slug - Optional suffix for naming element-specific screenshots
 * @returns Promise that resolves when screenshot is captured or skipped
 */
export async function captureSnapshot(
  context: ScreenshotContext,
  slug?: string,
): Promise<void> {
  const driver = context.driver as WebDriver;
  const testName = context.task?.name || 'unknown';

  // Only capture screenshots when on popup.html
  const currentUrl = await driver.getCurrentUrl();
  if (!currentUrl.includes('/popup.html')) {
    return;
  }

  // Wait for animations to complete before capturing
  await delayTime('medium');

  await takeScreenshot({
    driver,
    testName,
    slug,
    captureElement: true,
  });
}

/**
 * Takes a screenshot with flexible options.
 *
 * @param options - Configuration for screenshot capture
 * @returns Promise that resolves when screenshot is saved
 */
async function takeScreenshot(options: ScreenshotOptions): Promise<void> {
  const {
    driver,
    testName = 'unknown',
    slug,
    waitForAnimations = true,
    captureElement = true,
  } = options;

  // Wait for animations if requested
  if (waitForAnimations) {
    await delayTime('medium');
  }

  // Ensure screenshots directory exists
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  const fileName = generateScreenshotFilename(testName, slug);
  const filePath = `screenshots/${fileName}.png`;

  try {
    let image: string;

    if (captureElement) {
      // Try to find and screenshot just the extension viewport element
      const popupContainer = await findPopupContainer(driver);
      if (popupContainer) {
        image = await popupContainer.takeScreenshot();
        console.log(`Popup container screenshot saved: ${fileName}.png`);
      } else {
        // Fallback to full page screenshot if element not found
        image = await driver.takeScreenshot();
        console.log(`Full screenshot saved: ${fileName}.png`);
      }
    } else {
      // Take full page screenshot
      image = await driver.takeScreenshot();
      console.log(`Full screenshot saved: ${fileName}.png`);
    }

    fs.writeFileSync(filePath, image, 'base64');
  } catch (error) {
    console.error(`Error capturing screenshot ${fileName}:`, error);
  }
}

/**
 * Generates a normalized filename for the screenshot.
 *
 * @param testName - Name of the test
 * @param slug - Optional suffix for the filename
 * @returns Generated filename without extension
 */
function generateScreenshotFilename(testName: string, slug?: string): string {
  const testFile = getTestFileFromStack();
  const suiteName = testFile || 'test';

  // Normalize names for Percy - remove special characters and spaces
  const normalizedSuite = suiteName
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();

  let fileName: string;

  if (slug) {
    // If suffix provided, use it for element-specific screenshots
    const normalizedSuffix = slug
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
    fileName = `${normalizedSuite}-element_${normalizedSuffix}`;
  } else {
    // Otherwise use the test name
    const normalizedTest = testName
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
    fileName = `${normalizedSuite}-${normalizedTest}`;
  }

  // Handle duplicate filenames
  let finalFileName = fileName;
  let counter = 0;
  while (fs.existsSync(`screenshots/${finalFileName}.png`)) {
    counter += 1;
    finalFileName = `${fileName}_${counter}`;
    if (counter > 10) break;
  }

  return finalFileName;
}

/**
 * Finds the popup container element for targeted screenshots.
 *
 * @param driver - WebDriver instance
 * @returns WebElement if found, null otherwise
 */
async function findPopupContainer(
  driver: WebDriver,
): Promise<WebElement | null> {
  try {
    return await driver.findElement(
      By.css('[data-viewport="extension-viewport"]'),
    );
  } catch {
    // Element not found
    return null;
  }
}
