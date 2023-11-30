import 'chromedriver';
import 'geckodriver';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import {
  TransactionReceipt,
  getDefaultProvider,
} from '@ethersproject/providers';
import { Key, WebDriver } from 'selenium-webdriver';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  checkExtensionURL,
  checkWalletName,
  delayTime,
  executePerformShortcut,
  findElementByTestId,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  goToPopup,
  importWalletFlowUsingKeyboardNavigation,
  initDriverWithOptions,
  isElementFoundByText,
  navigateToElementWithTestId,
  takeScreenshotOnFailure,
  transactionStatus,
} from '../../helpers';
import { TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

export async function transactionInfo() {
  const provider = getDefaultProvider('http://127.0.0.1:8545');
  const blockData = await provider.getBlock('latest');
  const lastTransactionIndex = blockData.transactions.length - 1;
  const txnReceipt = await provider.getTransactionReceipt(
    blockData.transactions[lastTransactionIndex],
  );
  const TRANSACTION_OBJECT = {
    BLOCK_DATA: blockData,
    TRANSACTION_RECEIPT: txnReceipt,
  };
  return TRANSACTION_OBJECT;
}

const mockTransactionReceipt: TransactionReceipt = {
  to: '0x2e67869829c734ac13723A138a952F7A8B56e774',
  from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  contractAddress: 'null',
  transactionIndex: 0,
  gasUsed: BigNumber.from('21000'),
  logsBloom:
    '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  blockHash:
    '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  transactionHash:
    '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  logs: [],
  blockNumber: 18569421,
  confirmations: 1,
  cumulativeGasUsed: BigNumber.from('21000'),
  effectiveGasPrice: BigNumber.from('21000'),
  byzantium: true,
  status: 1,
  type: 2,
};

const TransactionRequestMock: TransactionResponse = {
  nonce: 0,
  gasLimit: BigNumber.from('21000'),
  gasPrice: BigNumber.from('21000'),
  value: BigNumber.from('21000'),
  chainId: 1337,
  maxPriorityFeePerGas: BigNumber.from('21000'),
  maxFeePerGas: BigNumber.from('21000'),
  to: '0x2e67869829c734ac13723A138a952F7A8B56e774',
  from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  type: 2,
  hash: '0x0',
  blockHash:
    '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  blockNumber: 18569421,
  confirmations: 1,
  wait: async () => mockTransactionReceipt,
  data: 'txn',
};

vi.mock('../../../src/entries/popup/handlers/wallet', () => {
  return {
    sendTransaction: vi.fn().mockResolvedValue(TransactionRequestMock),
  };
});

describe('Complete send flow via shortcuts and keyboard navigation', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
    console.log('TRANSACTION INFO BEFORE:', await transactionInfo());
  });

  beforeEach<{ driver: WebDriver }>(async (context) => {
    context.driver = driver;
  });

  afterEach<{ driver: WebDriver }>(async (context) => {
    await takeScreenshotOnFailure(context);
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    driver.quit();
  });

  it('should be able import a wallet via pk', async () => {
    await importWalletFlowUsingKeyboardNavigation(
      driver,
      rootURL,
      TEST_VARIABLES.SEED_WALLET.PK,
    );
  });

  it('should display account name', async () => {
    await checkWalletName(driver, rootURL, TEST_VARIABLES.SEED_WALLET.ADDRESS);
  });

  it('should be able to go to setings', async () => {
    await goToPopup(driver, rootURL);
    await executePerformShortcut({ driver, key: 'DECIMAL' });
    await executePerformShortcut({ driver, key: 'ARROW_DOWN' });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await checkExtensionURL(driver, 'settings');
  });

  it('should be able to connect to hardhat', async () => {
    await navigateToElementWithTestId({ driver, testId: 'connect-to-hardhat' });
    const button = await findElementByText(driver, 'Disconnect from Hardhat');
    expect(button).toBeTruthy();
    await executePerformShortcut({ driver, key: 'ESCAPE' });
  });

  it('should be able to navigate to send with keyboard shortcut', async () => {
    await executePerformShortcut({ driver, key: 's' });
    await checkExtensionURL(driver, 'send');
  });

  it('should be able to navigate home with keyboard nav', async () => {
    await executePerformShortcut({ driver, key: 'ESCAPE' });
    await checkExtensionURL(driver, 'home');
  });

  it('should be able to navigate to send with keyboard navigation', async () => {
    await navigateToElementWithTestId({ driver, testId: 'header-link-send' });
    await checkExtensionURL(driver, 'send');
  });

  it('should be able to nav to send field and type in address', async () => {
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 2 });
    await driver.actions().sendKeys('0xtester.eth').perform();
    const shortenedAddress = await findElementByText(driver, '0x2e67…e774');
    expect(shortenedAddress).toBeTruthy();
  });

  it('should be able to save contact', async () => {
    await executePerformShortcut({ driver, key: 'DECIMAL' });
    await executePerformShortcut({ driver, key: 'TAB' });
    await driver.actions().sendKeys('0xtester.eth').perform();
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await delayTime('long');
  });

  it('should be able to open contact menu', async () => {
    await executePerformShortcut({ driver, key: 'DECIMAL' });
    const copyOption = await findElementByText(driver, 'Copy Address');
    expect(copyOption).toBeTruthy();
    await executePerformShortcut({ driver, key: 'ESCAPE' });
    const doNotFindCopyOption = await isElementFoundByText({
      text: 'Copy Address',
      driver,
    });
    expect(doNotFindCopyOption).toBe(false);
  });

  it('should be able to clear current send address field', async () => {
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 3 });
    await executePerformShortcut({ driver, key: 'ENTER' });
    const contacts = await findElementByText(driver, 'Contacts');
    expect(contacts).toBeTruthy();
  });

  it('should be able to focus address to send with keyboard', async () => {
    await delayTime('long');
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'ENTER' });
  });

  it('should be able to focus asset to send with keyboard', async () => {
    await executePerformShortcut({ driver, key: 'TAB' });
    const ethereum = await findElementByText(driver, 'Ethereum');
    expect(ethereum).toBeTruthy();
    await navigateToElementWithTestId({
      driver,
      testId: 'asset-name-eth_1',
    });
    await delayTime('long');
    const tokenInput = await findElementByTestId({
      id: 'input-wrapper-dropdown-token-input',
      driver,
    });
    expect(await tokenInput.getText()).toContain('Ethereum');
    const value = await findElementByTestId({ id: 'send-input-mask', driver });
    const valueNum = await value.getAttribute('value');
    expect(Number(valueNum)).toBe(0);
  });

  it('should be able to set max amount', async () => {
    await executePerformShortcut({ driver, key: 'TAB' });
    await executePerformShortcut({ driver, key: 'ENTER' });
    const value = await findElementByTestId({ id: 'send-input-mask', driver });
    const valueNum = await value.getAttribute('value');
    expect(Number(valueNum)).toBeGreaterThan(0);
  });

  it('should be able to switch currency label', async () => {
    const placeholderBefore = await findElementByTestId({
      id: 'send-input-mask',
      driver,
    });
    const placeholderBeforeContent =
      await placeholderBefore.getAttribute('placeholder');
    expect(placeholderBeforeContent).toContain('ETH');
    await executePerformShortcut({ driver, key: 'TAB', timesToPress: 2 });
    await executePerformShortcut({ driver, key: 'ENTER' });
    await delayTime('long');
    const placeholder = await findElementByTestId({
      id: 'send-input-mask',
      driver,
    });
    const placeholderContent = await placeholder.getAttribute('placeholder');
    expect(placeholderContent).toContain('USD');
  });

  it('should be able to initiate transaction with keyboard navigation', async () => {
    await driver
      .actions()
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys(Key.BACK_SPACE)
      .sendKeys('1')
      .perform();
    const value = await findElementByTestId({ id: 'send-input-mask', driver });
    const valueNum = await value.getAttribute('value');
    expect(Number(valueNum)).toBe(1);
    await navigateToElementWithTestId({ driver, testId: 'send-review-button' });
    const reviewText = await findElementByText(driver, 'Review & Send');
    expect(reviewText).toBeTruthy();
    await navigateToElementWithTestId({
      driver,
      testId: 'review-confirm-button',
    });
    const sendTransaction = await transactionStatus();
    expect(sendTransaction).toBe('success');
    console.log('TRANSACTION INFO AFTER:', await transactionInfo());
  });
});
