import { Key, WebDriver } from 'selenium-webdriver';

import { delayTime } from './delays';
import { getFocusedElementDataTestIds } from './elements';

export async function performShortcutWithNormalKey(
  driver: WebDriver,
  key: string,
) {
  try {
    await delayTime('short');
    await driver.actions().sendKeys(key).perform();
  } catch (error) {
    console.error(
      `Error occurred while attempting shortcut with the keyboard character '${key}':`,
      error,
    );
    throw error;
  }
}

export async function executeMultipleShortcuts({
  driver,
  keyDown,
  key,
}: {
  driver: WebDriver;
  keyDown: keyof typeof Key | string;
  key: keyof typeof Key | string;
}) {
  try {
    await delayTime('short');
    const keyDownAction =
      keyDown in Key ? (Key[keyDown as keyof typeof Key] as string) : keyDown;
    const keyAction =
      key in Key ? (Key[key as keyof typeof Key] as string) : key;
    await driver
      .actions()
      .keyDown(keyDownAction)
      .sendKeys(keyAction)
      .keyUp(keyDownAction)
      .perform();
  } catch (error) {
    console.error(
      `Error occurred while attempting multiple shortcuts with the keydown '${keyDown}' and key '${key}':`,
      error,
    );
    throw error;
  }
}

export async function performShortcutWithSpecialKey(
  driver: WebDriver,
  specialKey: keyof typeof Key,
) {
  try {
    await delayTime('short');
    const key = Key[specialKey] as string;
    await driver.actions().sendKeys(key).perform();
  } catch (error) {
    console.error(
      `Error occurred while attempting shortcut with the key '${specialKey}':`,
      error,
    );
    throw error;
  }
}

export async function navigateToElementWithTestId({
  driver,
  testId,
}: {
  driver: WebDriver;
  testId: string;
}): Promise<void> {
  try {
    await executePerformShortcut({ driver, key: 'TAB' });
    const testIds = await getFocusedElementDataTestIds(driver);
    if (testIds.includes(testId)) {
      await delayTime('short');
      await executePerformShortcut({ driver, key: 'ENTER' });
    } else {
      await navigateToElementWithTestId({ driver, testId });
    }
  } catch (error) {
    console.error(`Error occurred while executing shortcut:`, error);
    throw error;
  }
}

export async function executePerformShortcut({
  driver,
  key,
  timesToPress = 1,
}: {
  driver: WebDriver;
  key: keyof typeof Key | string;
  timesToPress?: number;
}): Promise<void> {
  try {
    const shortcuts = Array(timesToPress)
      .fill(null)
      .map(() => {
        if (!(key in Key)) {
          return performShortcutWithNormalKey(driver, key);
        } else {
          return performShortcutWithSpecialKey(driver, key as keyof typeof Key);
        }
      });
    await Promise.all(shortcuts);
  } catch (error) {
    console.error(`Error occurred while executing shortcut:`, error);
    throw error;
  }
}
