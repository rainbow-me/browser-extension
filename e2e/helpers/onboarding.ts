import { WebDriver } from 'selenium-webdriver';
import { expect } from 'vitest';

import { delayTime } from './delays';
import {
  findElementById,
  findElementByIdAndClick,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByText,
  querySelector,
} from './elements';
import { typeOnTextInput } from './input';
import {
  checkExtensionURL,
  goToPopup,
  goToWelcome,
  untilDocumentLoaded,
} from './navigation';
import { executePerformShortcut } from './shortcuts';

const waitUntilTime = 20_000;
const testPassword = 'test1234';

export const fillSeedPhrase = async (driver: WebDriver, seedPhrase: string) => {
  const words = seedPhrase.trim().split(/\s+/);

  // Validate word count
  if (words.length !== 12 && words.length !== 24) {
    throw new Error(
      `Invalid seed phrase length: ${words.length}. Must be either 12 or 24 words.`,
    );
  }

  // Fill each word input dynamically based on the phrase length
  const wordInputs = words.map((word, i) =>
    typeOnTextInput({
      id: `secret-input-${i + 1}`,
      driver,
      text: word,
    }),
  );
  await Promise.all(wordInputs);
};

export const fillPrivateKey = async (driver: WebDriver, privateKey: string) => {
  return typeOnTextInput({
    id: 'private-key-input',
    driver,
    text: privateKey,
  });
};

export async function passSecretQuiz(driver: WebDriver) {
  const requiredWordsIndexes = [4, 8, 12];
  const requiredWords: string[] = [];

  const wordPromises = requiredWordsIndexes.map(async (index) => {
    const wordElement = await querySelector(
      driver,
      `[data-testid="seed_word_${index}"]`,
    );
    return wordElement.getText();
  });
  const words = await Promise.all(wordPromises);
  requiredWords.push(...words);

  await findElementByTestIdAndClick({
    id: 'saved-these-words-button',
    driver,
  });
  await delayTime('long');

  const clickPromises = requiredWords.map((word) =>
    findElementByTestIdAndClick({ id: `word_${word}`, driver }),
  );
  await Promise.all(clickPromises);

  await delayTime('long');
}

export async function importHardwareWalletFlow(
  driver: WebDriver,
  rootURL: string,
  hardwareType: string,
) {
  await goToWelcome(driver, rootURL);
  await findElementByTestIdAndClick({
    id: 'import-wallet-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'connect-wallet-option',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${hardwareType}-option`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'connect-wallets-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'hw-done',
    driver,
  });
  await typeOnTextInput({ id: 'password-input', driver, text: 'test1234' });
  await typeOnTextInput({
    id: 'confirm-password-input',
    driver,
    text: 'test1234',
  });
  await findElementByTestIdAndClick({ id: 'set-password-button', driver });
  await delayTime('long');
  await findElementByText(driver, 'Rainbow is ready to use');
}

export async function importWalletFlowUsingKeyboardNavigation(
  driver: WebDriver,
  rootURL: string,
  walletSecret: string,
  secondaryWallet = false as boolean,
) {
  if (secondaryWallet) {
    await goToPopup(driver, rootURL);
    await executePerformShortcut({ driver, key: 'w' });
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 3,
    });
    await executePerformShortcut({ driver, key: 'ENTER' });
  } else {
    await goToPopup(driver, rootURL);
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 2,
    });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 2,
    });
    await executePerformShortcut({ driver, key: 'ENTER' });
  }

  // ok
  const isPrivateKey =
    walletSecret.substring(0, 2) === '0x' && walletSecret.length === 66;

  await executePerformShortcut({
    driver,
    key: 'ARROW_DOWN',
    timesToPress: isPrivateKey ? 3 : 2,
  });
  await executePerformShortcut({ driver, key: 'ENTER' });
  // ok
  isPrivateKey
    ? await fillPrivateKey(driver, walletSecret)
    : await fillSeedPhrase(driver, walletSecret);

  await executePerformShortcut({
    driver,
    key: 'ARROW_DOWN',
  });
  await executePerformShortcut({ driver, key: 'ENTER' });
  if (!isPrivateKey) {
    await delayTime('very-long');
    await findElementByTestId({ id: 'add-wallets-button-section', driver });
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
      timesToPress: 2,
    });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, '/create-password');
    await driver.wait(untilDocumentLoaded(), waitUntilTime);
  }
  // ok
  if (secondaryWallet) {
    await delayTime('medium');
    const accountHeader = await findElementById({
      id: 'header-account-name-shuffle',
      driver,
    });
    expect(accountHeader).toBeTruthy();
  } else {
    await checkExtensionURL(driver, '/create-password');
    await driver.wait(untilDocumentLoaded(), waitUntilTime);

    await driver.actions().sendKeys(testPassword).perform();
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
    });
    await driver.actions().sendKeys(testPassword).perform();
    await executePerformShortcut({
      driver,
      key: 'ARROW_DOWN',
    });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await delayTime('long');
    const welcomeText = await findElementByText(
      driver,
      'Rainbow is ready to use',
    );
    expect(welcomeText).toBeTruthy();
  }
}

export async function importWalletFlow(
  driver: WebDriver,
  rootURL: string,
  walletSecret: string,
  secondaryWallet = false as boolean,
  is24WordSeedPhrase = false as boolean,
) {
  if (secondaryWallet) {
    await goToPopup(driver, rootURL);
    await findElementByIdAndClick({
      id: 'header-account-name-shuffle',
      driver,
    });
    await findElementByTestIdAndClick({ id: 'add-wallet-button', driver });
    await findElementByTestIdAndClick({
      id: 'import-wallets-button',
      driver,
    });
  } else {
    await goToWelcome(driver, rootURL);
    await findElementByTestIdAndClick({
      id: 'import-wallet-button',
      driver,
    });
    await findElementByTestIdAndClick({
      id: 'import-wallet-option',
      driver,
    });
  }
  // button doesn't exist for pkeys. check if pkey, and if so, dont check for this button
  const isPrivateKey =
    walletSecret.substring(0, 2) === '0x' && walletSecret.length === 66;

  await findElementByTestIdAndClick({
    id: isPrivateKey ? 'import-via-pkey-option' : 'import-via-seed-option',
    driver,
  });

  if (is24WordSeedPhrase) {
    findElementByTestIdAndClick({
      id: 'toggle-24-word-seed-phrase',
      driver,
    });
    await delayTime('medium');
  }

  if (isPrivateKey) {
    await fillPrivateKey(driver, walletSecret);
  } else {
    await fillSeedPhrase(driver, walletSecret);
  }

  await findElementByTestIdAndClick({
    id: 'import-wallets-button',
    driver,
  });

  if (!isPrivateKey) {
    await findElementByTestIdAndClick({
      id: 'add-wallets-button',
      driver,
    });
  }

  if (secondaryWallet) {
    await delayTime('very-long');

    const accountHeader = await findElementById({
      id: 'header-account-name-shuffle',
      driver,
    });
    expect(accountHeader).toBeTruthy();
  } else {
    await delayTime('medium');
    await typeOnTextInput({ id: 'password-input', driver, text: testPassword });
    await typeOnTextInput({
      id: 'confirm-password-input',
      driver,
      text: testPassword,
    });
    await findElementByTestIdAndClick({ id: 'set-password-button', driver });
    await delayTime('long');
    const welcomeText = await findElementByText(
      driver,
      'Rainbow is ready to use',
    );
    expect(welcomeText).toBeTruthy();
  }
}
