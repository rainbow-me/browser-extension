import { By, WebDriver, WebElement, until } from 'selenium-webdriver';

import { delayTime } from './delays';
import { untilDocumentLoaded } from './navigation';

const waitUntilTime = 20_000;

export async function querySelector(driver: WebDriver, selector: string) {
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  const el = await driver.wait(
    until.elementLocated(By.css(selector)),
    waitUntilTime,
  );
  return await driver.wait(until.elementIsVisible(el), waitUntilTime);
}

export async function querySelectorWithin(
  parentElement: WebElement,
  childSelector: string,
): Promise<WebElement> {
  return await parentElement.findElement(By.css(childSelector));
}

export async function findElementByText(driver: WebDriver, text: string) {
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  const el = await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'" + text + "')]")),
    waitUntilTime,
  );
  return await driver.wait(until.elementIsVisible(el), waitUntilTime);
}

export async function findElementByTextAndClick(
  driver: WebDriver,
  text: string,
) {
  const element = await findElementByText(driver, text);
  await waitAndClick(element, driver);
}

export async function findElementAndClick({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  await delayTime('short');
  const element = await driver.findElement({
    id,
  });
  await waitAndClick(element, driver);
}

export async function findElementByTestId({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  return querySelector(driver, `[data-testid="${id}"]`);
}

export async function findElementById({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  return querySelector(driver, `[id="${id}"]`);
}

export async function doNotFindElementByTestId({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  const elementFound = await Promise.race([
    querySelector(driver, `[data-testid="${id}"]`),
    new Promise((resolve) => {
      setTimeout(() => resolve(false), 1000);
    }),
  ]);
  return !!elementFound;
}

export async function isElementFoundByText({
  text,
  driver,
}: {
  text: string;
  driver: WebDriver;
}) {
  let isElementFound = true;
  try {
    await driver.wait(untilDocumentLoaded(), waitUntilTime);
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'" + text + "')]")),
      2500,
    );
    console.log(
      `Element with text '${text}' was returned isElementFound status of ${isElementFound}`,
    );
  } catch (error) {
    isElementFound = false;
    console.log(
      `Element with text '${text}' was returned isElementFound status of ${isElementFound}`,
    );
  }
  return isElementFound;
}

export async function findElementByTestIdAndClick({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  await delayTime('short');
  const element = await findElementByTestId({ id, driver });
  await waitAndClick(element, driver);
}

export async function findElementByTestIdAndDoubleClick({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  await delayTime('short');
  const actions = driver.actions();
  const element = await findElementByTestId({ id, driver });
  return await actions.doubleClick(element).perform();
}

export async function waitUntilElementByTestIdIsPresent({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}): Promise<void> {
  await delayTime('long');
  try {
    const element = await findElementByTestId({ id, driver });
    if (element) {
      return;
    }
  } catch (error) {
    return waitUntilElementByTestIdIsPresent({ id, driver });
  }
}

export async function findElementByIdAndClick({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  await driver.wait(untilDocumentLoaded(), waitUntilTime);
  await delayTime('short');
  const element = await findElementById({ id, driver });
  await waitAndClick(element, driver);
}

export async function waitAndClick(element: WebElement, driver: WebDriver) {
  try {
    await driver.wait(untilDocumentLoaded(), waitUntilTime);
    await delayTime('short');
    await driver.wait(until.elementIsVisible(element), waitUntilTime);
    await driver.wait(until.elementIsEnabled(element), waitUntilTime);
    return element.click();
  } catch (error) {
    const testId = await element.getAttribute('data-testid');
    throw new Error(`Failed to click element ${testId}`);
  }
}

export async function getFocusedElementDataTestIds(
  driver: WebDriver,
): Promise<string[]> {
  const script = `
    function getDataTestIdOfElementAndChildren(element) {
      const dataTestIds = [];
      const dataTestId = element.getAttribute('data-testid');
      if (dataTestId) {
        dataTestIds.push(dataTestId);
      }
      for (const child of element.children) {
        dataTestIds.push(...getDataTestIdOfElementAndChildren(child));
      }
      return dataTestIds;
    }
    const activeElement = document.activeElement;
    return getDataTestIdOfElementAndChildren(activeElement);
  `;

  return driver.executeScript(script);
}

export async function returnAttributesOfActiveElement(
  driver: WebDriver,
  attribute: string,
): Promise<string> {
  const activeElement = await driver.switchTo().activeElement();
  return activeElement.getAttribute(attribute);
}

export async function toggleStatus(id: string, driver: WebDriver) {
  const toggleInput = await driver.wait(
    until.elementLocated(By.css(`[data-testid="${id}"] input`)),
  );
  const checkedStatus: string = await toggleInput.getAttribute('aria-checked');
  return checkedStatus;
}
