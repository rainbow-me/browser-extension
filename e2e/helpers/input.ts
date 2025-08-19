import { WebDriver } from 'selenium-webdriver';

import { findElementByTestId } from './elements';

export async function typeOnTextInput({
  id,
  text,
  driver,
}: {
  id?: string;
  text: number | string;
  driver: WebDriver;
}) {
  const element = id ? await findElementByTestId({ id, driver }) : null;
  element
    ? await element.sendKeys(text)
    : await driver.actions().sendKeys(text.toString()).perform();
}

export async function clearInput({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  const element = await findElementByTestId({ id, driver });
  return await element.clear();
}

export async function getTextFromTextInput({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  const element = await findElementByTestId({ id, driver });
  return await element.getAttribute('value');
}

export async function getTextFromText({
  id,
  driver,
}: {
  id: string;
  driver: WebDriver;
}) {
  const element = await findElementByTestId({ id, driver });
  return await element.getText();
}
