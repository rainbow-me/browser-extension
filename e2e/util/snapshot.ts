import * as fs from 'node:fs';

import { WebDriver } from 'selenium-webdriver';
import * as sharp from 'sharp';

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

  try {
    // Only capture screenshots when on popup.html
    const currentUrl = await driver.getCurrentUrl();
    if (
      !currentUrl ||
      currentUrl === 'data:,' ||
      !currentUrl.includes('/popup.html')
    ) {
      console.log(`Skipping screenshot - not on popup page: ${currentUrl}`);
      return;
    }

    await takeScreenshot({
      driver,
      testName,
      slug,
    });
  } catch (error) {
    console.warn(`Failed to capture snapshot: ${error}`);
  }
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
    // Take full screenshot
    const fullScreenshot = await driver.takeScreenshot();

    // Crop to 360x600 centered
    const croppedImage = await cropScreenshot(fullScreenshot, 360, 600);

    // Save the cropped image
    fs.writeFileSync(filePath, croppedImage, 'base64');
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
 * Crops a base64 PNG image to specified dimensions, centered.
 * Uses Sharp for image processing.
 *
 * @param base64Image - Base64 encoded PNG image
 * @param targetWidth - Target width in CSS pixels
 * @param targetHeight - Target height in CSS pixels
 * @returns Base64 encoded cropped image
 */
async function cropScreenshot(
  base64Image: string,
  targetWidth: number,
  targetHeight: number,
): Promise<string> {
  // For high-DPI displays with devicePixelRatio=2
  const dpr = 2;
  const cropWidth = targetWidth * dpr;
  const cropHeight = targetHeight * dpr;

  try {
    // Decode base64 to buffer
    const inputBuffer = Buffer.from(base64Image, 'base64');

    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // If image is already smaller than target, return as-is
    if (width <= cropWidth && height <= cropHeight) {
      return base64Image;
    }

    // Calculate centered crop position
    const left = Math.max(0, Math.floor((width - cropWidth) / 2));
    const top = Math.max(0, Math.floor((height - cropHeight) / 2));

    // Crop the image using Sharp
    const croppedBuffer = await sharp(inputBuffer)
      .extract({
        left,
        top,
        width: cropWidth,
        height: cropHeight,
      })
      .png()
      .toBuffer();

    // Convert back to base64
    return croppedBuffer.toString('base64');
  } catch (error) {
    console.error('Error during crop operation:', error);
    return base64Image;
  }
}
