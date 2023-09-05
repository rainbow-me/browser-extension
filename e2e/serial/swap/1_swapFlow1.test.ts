import 'chromedriver';
import 'geckodriver';
import { WebSocketProvider } from '@ethersproject/providers';
import { Crypto } from '@peculiar/webcrypto';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { WebDriver } from 'selenium-webdriver';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  it,
  vi,
} from 'vitest';

import { ChainId } from '~/core/types/chains';

import {
  clearInput,
  delay,
  delayTime,
  doNotFindElementByTestId,
  fillPrivateKey,
  findElementByTestId,
  findElementByTestIdAndClick,
  findElementByTestIdAndDoubleClick,
  findElementByText,
  getExtensionIdByName,
  getRootUrl,
  getTextFromText,
  getTextFromTextInput,
  goToPopup,
  goToWelcome,
  initDriverWithOptions,
  querySelector,
  takeScreenshotOnFailure,
  typeOnTextInput,
  waitAndClick,
} from '../../helpers';
import { convertRawAmountToDecimalFormat, subtract } from '../../numbers';
import { SWAP_VARIABLES, TEST_VARIABLES } from '../../walletVariables';

let rootURL = getRootUrl();
let driver: WebDriver;
let provider: WebSocketProvider;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';
const isFirefox = browser === 'firefox';

vi.stubGlobal('chrome', {
  storage: {
    local: {
      get: vi.fn(() => ({})),
      set: vi.fn(),
      remove: vi.fn(),
    },
    session: {
      get: vi.fn(() => ({})),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
  runtime: {
    getURL: (url: string) => `https://local.io/${url}`,
  },
});

vi.stubGlobal('WebSocketProvider', () => {
  throw new Error('Real WebSocketProvider instantiated!');
});

vi.stubGlobal('window', {});

vi.stubGlobal('window.location', {
  pathname: 'popup.html',
});

vi.stubGlobal('location', {
  replace: vi.fn(),
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.crypto = new Crypto();

const abortFn = vi.fn();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.AbortController = vi.fn(() => ({
  abort: abortFn,
}));

Object.defineProperty(window, 'crypto', {
  value: global.crypto,
  writable: true,
});

Object.defineProperty(global, 'crypto', {
  value: global.crypto,
  writable: true,
});

type ApiResponse = {
  data: {
    addresses: Record<string, boolean>;
  };
};

type ApiResponses = Record<string, ApiResponse>;

const apiResponses: ApiResponses = {
  '0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a': {
    data: {
      addresses: {
        '0x01': true,
        '0x02': true,
        '0x03': true,
        '0x04': true,
        '0x05': true,
        '0x06': true,
        '0x07': true,
        '0x08': true,
        '0x09': true,
        '0x0a': true,
      },
    },
  },
  '0x0b,0x0c,0x0d,0x0e,0x0f,0x10,0x11,0x12,0x13,0x14': {
    data: {
      addresses: {
        '0x0b': true,
        '0x0c': true,
        '0x0d': true,
        '0x0e': true,
        '0x0f': true,
        '0x10': true,
        '0x11': true,
        '0x12': true,
        '0x13': true,
        '0x14': true,
      },
    },
  },
  '0x15,0x16,0x17,0x18,0x19,0x1a,0x1b,0x1c,0x1d,0x1e': {
    data: {
      addresses: {
        '0x15': true,
        '0x16': true,
        '0x17': false,
        '0x18': false,
        '0x19': false,
        '0x1a': false,
        '0x1b': false,
        '0x1c': false,
        '0x1d': false,
        '0x1e': false,
      },
    },
  },

  '0x3E1d483a494Db7507102B43eefD4078C006ba2fa,0x0E169Db4A7A8Ec4f4B2A5DB36bEd24B6E3b33eF9,0x40AAF32c442b3E5b136823e1b153e425eb77c7ad,0x2f66868F8a35436f02FCd564B9Eea36B5bF91974,0x5fa350Fb902AB96D27FBBCB01606774D4376d959,0x456eb0100c30e74EBbE59274947b93c34AB6D23c,0xa2023B6f545327ae2A1a3E40e80c8E223956ea76,0x84A2D20F523a63Cf5D2C53E839149e2eDB4D8214,0x32f030335bac1443972d1932DAD3c6F3c3299590,0x20dEB9a8f6E2C6ECD31f7c634BFEAb83aB727dE1':
    {
      data: {
        addresses: {
          '0x3E1d483a494Db7507102B43eefD4078C006ba2fa': true,
          '0x0E169Db4A7A8Ec4f4B2A5DB36bEd24B6E3b33eF9': true,
          '0x40AAF32c442b3E5b136823e1b153e425eb77c7ad': false,
          '0x2f66868F8a35436f02FCd564B9Eea36B5bF91974': false,
          '0x5fa350Fb902AB96D27FBBCB01606774D4376d959': false,
          '0x456eb0100c30e74EBbE59274947b93c34AB6D23c': false,
          '0xa2023B6f545327ae2A1a3E40e80c8E223956ea76': false,
          '0x84A2D20F523a63Cf5D2C53E839149e2eDB4D8214': false,
          '0x32f030335bac1443972d1932DAD3c6F3c3299590': false,
          '0x20dEB9a8f6E2C6ECD31f7c634BFEAb83aB727dE1': false,
        },
      },
    },
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,0x70997970C51812dc3A010C7d01b50e0d17dc79C8,0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,0x90F79bf6EB2c4f870365E785982E1f101E93b906,0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65,0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc,0x976EA74026E726554dB657fA54763abd0C3a0aa9,0x14dC79964da2C08b23698B3D3cc7Ca32193d9955,0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f,0xa0Ee7A142d267C1f36714E4a8F75612F20a79720':
    {
      data: {
        addresses: {
          '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266': true,
          '0x70997970c51812dc3a010c7d01b50e0d17dc79c8': true,
          '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc': true,
          '0x90f79bf6eb2c4f870365e785982e1f101e93b906': true,
          '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65': true,
          '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc': true,
          '0x976ea74026e726554db657fa54763abd0c3a0aa9': true,
          '0x14dc79964da2c08b23698b3d3cc7ca32193d9955': true,
          '0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f': false,
          '0xa0ee7a142d267c1f36714e4a8f75612f20a79720': false,
        },
      },
    },
  '0x101,0x102,0x103,0x104,0x105,0x106,0x107,0x108,0x109,0x10a': {
    data: {
      addresses: {
        '0x101': false,
        '0x102': false,
        '0x103': false,
        '0x104': false,
        '0x105': false,
        '0x106': false,
        '0x107': false,
        '0x108': false,
        '0x109': false,
        '0x10a': false,
      },
    },
  },
};

class MockWebSocketProvider extends WebSocketProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  async send(method: string, _params: any): Promise<any> {
    switch (method) {
      case 'eth_call':
        return '0x01';
      case 'eth_chainId':
        return '0x1';
      case 'eth_getTransactionCount':
        return '0x0';
      case 'eth_getBlockByNumber':
        return {
          number: '0x12345',
          hash: '0xabcdef1234567890',
          timestamp: '0x617263202331302f323032332032313a31353a3031202b30303030',
        };
      case 'eth_estimateGas':
        return '0x5';
      case 'eth_getBalance':
        return '0x1000000000000000'; // mock balance
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }
}

const mockAnvilHandlers = [
  rest.post('https://localhost:8545', async (req, res, ctx) => {
    const requestBody = await req.json();
    switch (requestBody.method) {
      case 'eth_call':
        return res(
          ctx.status(200),
          ctx.json({
            jsonrpc: '2.0',
            id: requestBody.id,
            result: '0x01', // Replace with correct thing???
          }),
        );
      case 'eth_chainId':
        return res(
          ctx.status(200),
          ctx.json({
            jsonrpc: '2.0',
            id: requestBody.id,
            result: '0x1', // Chain ID 1 (Mainnet)
          }),
        );
      case 'eth_getTransactionCount':
        return res(
          ctx.status(200),
          ctx.json({
            jsonrpc: '2.0',
            id: requestBody.id,
            result: '0x0', // Custom nonce ?????? maybe write a funciton for this
          }),
        );
      case 'eth_getBlockByNumber':
        return res(
          ctx.status(200),
          ctx.json({
            jsonrpc: '2.0',
            id: requestBody.id,
            result: {
              number: '0x12345',
              hash: '0xabcdef1234567890',
              timestamp:
                '0x617263202331302f323032332032313a31353a3031202b30303030',
            },
          }),
        );
      case 'eth_estimateGas':
        return res(
          ctx.status(200),
          ctx.json({
            jsonrpc: '2.0',
            id: requestBody.id,
            result: '0x5', // Gas estimate
          }),
        );
      default:
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Invalid request',
          }),
        );
    }
  }),
];

const restHandlers = [
  rest.all('https://aha.rainbow.me/', (req, res, ctx) => {
    const address = req.url.searchParams.get('address') || '';
    return res(ctx.status(200), ctx.json(apiResponses?.[address]));
  }),
];

// Create the server with all request handlers
const server = setupServer(...restHandlers, ...mockAnvilHandlers);
beforeAll(async () => {
  driver = await initDriverWithOptions({
    browser,
    os,
  });
  const extensionId = await getExtensionIdByName(driver, 'Rainbow');
  if (!extensionId) throw new Error('Extension not found');
  rootURL += extensionId;
  location.replace(`https://aha.rainbow.me/`);
  server.listen({ onUnhandledRequest: 'bypass' });
  provider = new MockWebSocketProvider('http://localhost:8545');
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
beforeEach(async (context: any) => {
  context.driver = driver;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
afterEach(async (context: any) => {
  await takeScreenshotOnFailure(context);
  server.resetHandlers();
});

afterAll(() => {
  driver.quit();
  server.close();
});

it('should be able import a wallet via pk', async () => {
  //  Start from welcome screen
  await goToWelcome(driver, rootURL);
  console.log(window.location);
  console.log(window);
  await findElementByTestIdAndClick({
    id: 'import-wallet-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'import-wallet-option',
    driver,
  });

  await findElementByTestIdAndClick({
    id: 'import-via-pkey-option',
    driver,
  });

  await fillPrivateKey(driver, TEST_VARIABLES.SEED_WALLET.PK);

  await findElementByTestIdAndClick({
    id: 'import-wallets-button',
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
});

it('should be able to go to setings', async () => {
  await goToPopup(driver, rootURL);
  await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
  await findElementByTestIdAndClick({ id: 'settings-link', driver });
});

it('should be able to connect to hardhat', async () => {
  const btn = await querySelector(driver, '[data-testid="connect-to-hardhat"]');
  await waitAndClick(btn, driver);
  const button = await findElementByText(driver, 'Disconnect from Hardhat');
  expect(button).toBeTruthy();
  await findElementByTestIdAndClick({ id: 'navbar-button-with-back', driver });
});

it('should be able to go to swap flow', async () => {
  await findElementByTestIdAndClick({ id: 'header-link-swap', driver });
});

it('should be able to go to swap settings and check rows are visible', async () => {
  await findElementByTestIdAndClick({
    id: 'swap-settings-navbar-button',
    driver,
  });
  const routeRow = await findElementByTestId({
    id: 'swap-settings-route-row',
    driver,
  });
  expect(routeRow).toBeTruthy();
  const slippageRow = await findElementByTestId({
    id: 'swap-settings-slippage-row',
    driver,
  });
  expect(slippageRow).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'swap-settings-done',
    driver,
  });
  await delayTime('medium');
});

it('should be able to go to settings and turn on flashbots', async () => {
  await findElementByTestIdAndClick({ id: 'navbar-button-with-back', driver });
  await findElementByTestIdAndClick({ id: 'home-page-header-right', driver });
  await findElementByTestIdAndClick({ id: 'settings-link', driver });
  await findElementByTestIdAndClick({ id: 'settings-transactions', driver });
  await findElementByTestIdAndClick({
    id: 'flashbots-transactions-toggle',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'navbar-button-with-back',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'navbar-button-with-back',
    driver,
  });
  await findElementByTestIdAndClick({ id: 'header-link-swap', driver });
});

it('should be able to go to swap settings and check flashbots row is visible', async () => {
  await findElementByTestIdAndClick({
    id: 'swap-settings-navbar-button',
    driver,
  });

  const flashbotsRow = await findElementByTestId({
    id: 'swap-settings-flashbots-row',
    driver,
  });
  expect(flashbotsRow).toBeTruthy();
});

it('should be able to interact with route settings', async () => {
  await findElementByTestIdAndClick({
    id: 'swap-settings-route-label',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'explainer-action-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'settings-route-context-trigger-auto',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'settings-route-context-0x',
    driver,
  });
});

it('should be able to interact with flashbots settings', async () => {
  await findElementByTestIdAndClick({
    id: 'swap-settings-flashbots-label',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'explainer-action-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'swap-settings-flashbots-toggle',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'swap-settings-flashbots-toggle',
    driver,
  });
});

it('should be able to interact with slippage settings', async () => {
  await findElementByTestIdAndClick({
    id: 'swap-settings-slippage-label',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'explainer-action-button',
    driver,
  });
  await typeOnTextInput({
    id: 'slippage-input-mask',
    driver,
    text: '\b4',
  });
  await delayTime('short');
  const warning = await findElementByTestId({
    id: 'swap-settings-slippage-warning',
    driver,
  });
  expect(warning).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'settings-use-defaults-button',
    driver,
  });
  await delayTime('short');
  await findElementByTestIdAndClick({
    id: 'swap-settings-done',
    driver,
  });
});

it.skip('should be able to set default values for settings and go back to swap', async () => {
  await findElementByTestIdAndClick({
    id: 'settings-use-defaults-button',
    driver,
  });
  const routeTriggerAuto = await findElementByTestId({
    id: 'settings-route-context-trigger-auto',
    driver,
  });
  expect(routeTriggerAuto).toBeTruthy();
  const text = await getTextFromTextInput({
    id: 'slippage-input-mask',
    driver,
  });
  expect(text).toBe('1');
  await findElementByTestIdAndClick({
    id: 'swap-settings-done',
    driver,
  });
  await delayTime('medium');
});

it('should be able to open token to sell input and select assets', async () => {
  await findElementByTestIdAndClick({
    id: 'token-to-sell-search-token-input',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-sell-sort-trigger',
    driver,
  });

  const sortByBalance = await findElementByTestId({
    id: 'token-to-sell-sort-balance',
    driver,
  });
  expect(sortByBalance).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'token-to-sell-sort-network',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-row`,
    driver,
  });
  const toSellInputEthSelected = await findElementByTestId({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toSellInputEthSelected).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'swap-flip-button',
    driver,
  });

  await findElementByTestIdAndClick({
    id: 'token-to-sell-token-input-dropdown-toggle',
    driver,
  });
  const toBuyInputEthSelected = await findElementByTestId({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toBuyInputEthSelected).toBeTruthy();
});

it('should be able to select same asset than asset to buy as asset to sell and remove the asset to buy', async () => {
  await findElementByTestIdAndClick({
    id: 'token-to-sell-search-token-input',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-sell-sort-trigger',
    driver,
  });

  const sortByBalance = await findElementByTestId({
    id: 'token-to-sell-sort-balance',
    driver,
  });
  expect(sortByBalance).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'token-to-sell-sort-network',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-row`,
    driver,
  });
  const toSellInputEthSelected = await findElementByTestId({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toSellInputEthSelected).toBeTruthy();

  const toBuyInputNoneSelected = await findElementByTestId({
    id: `token-to-buy-search-token-input`,
    driver,
  });
  expect(toBuyInputNoneSelected).toBeTruthy();
});

it('should be able to open press max on token to sell input', async () => {
  const fiatValueText = await getTextFromTextInput({
    id: 'token-to-sell-info-fiat-value-input',
    driver,
  });
  expect(fiatValueText).toBe('');
  await findElementByTestIdAndClick({
    id: 'token-to-sell-info-max-button',
    driver,
  });
  const ethValueBeforeGas = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(ethValueBeforeGas).toEqual('10000');
  const fiatValueTextAfterMax = await getTextFromTextInput({
    id: 'token-to-sell-info-fiat-value-input',
    driver,
  });
  expect(fiatValueTextAfterMax).not.toEqual('0.00');
});

it('should be able to remove token to sell and select it again', async () => {
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-row`,
    driver,
  });
  const toSellInputEthSelected = await findElementByTestId({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toSellInputEthSelected).toBeTruthy();
  // should clear input value
  const ethValueAfterSelection = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(ethValueAfterSelection).toEqual('');
});

it('should be able to open token to buy input and select assets', async () => {
  await findElementByTestIdAndClick({
    id: 'token-to-buy-search-token-input',
    driver,
  });
  // check sell asset is not present as buy option
  const elementFound = await doNotFindElementByTestId({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-buy-row`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.DAI_MAINNET_ID}-favorites-token-to-buy-row`,
    driver,
  });
  expect(elementFound).toBeFalsy();
  const toBuyInputDaiSelected = await findElementByTestId({
    id: `${SWAP_VARIABLES.DAI_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toBuyInputDaiSelected).toBeTruthy();
});

it('should be able to type native amount on sell input', async () => {
  await findElementByTestIdAndClick({
    id: 'token-to-sell-info-fiat-value-input',
    driver,
  });
  await typeOnTextInput({
    id: `token-to-sell-info-fiat-value-input`,
    text: 1,
    driver,
  });
  const fiatValueText = await getTextFromTextInput({
    id: 'token-to-sell-info-fiat-value-input',
    driver,
  });
  expect(fiatValueText).toBe('1');

  await delayTime('very-long');
  await delayTime('very-long');

  const assetToSellInputText = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(assetToSellInputText).not.toBe('');

  const assetToBuyInputText = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.DAI_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(assetToBuyInputText).not.toBe('');
});

it('should be able to open remove token to buy and check favorites and verified lists are visible', async () => {
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.DAI_MAINNET_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  const favoritesSection = await findElementByTestId({
    id: 'favorites-token-to-buy-section',
    driver,
  });
  expect(favoritesSection).toBeTruthy();
  const verifiedSection = await findElementByTestId({
    id: 'verified-token-to-buy-section',
    driver,
  });
  expect(verifiedSection).toBeTruthy();
});

it('should be able to favorite a token and check the info button is present', async () => {
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.ZEROX_MAINNET_ID}-verified-token-to-buy-row-favorite-button`,
    driver,
  });
  await delayTime('short');
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.ZEROX_MAINNET_ID}-favorites-token-to-buy-row-info-button`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.ZEROX_MAINNET_ID}-favorites-token-to-buy-row-info-button-copy`,
    driver,
  });
  if (isFirefox) {
    await findElementByTestIdAndClick({
      id: `${SWAP_VARIABLES.ZEROX_MAINNET_ID}-token-to-buy-token-input-remove`,
      driver,
    });
  }
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.WBTC_MAINNET_ID}-favorites-token-to-buy-row`,
    driver,
  });
});

it('should be able to check price and balance of token to buy', async () => {
  await delayTime('medium');
  const tokenToBuyInfoPrice = await getTextFromText({
    id: 'token-to-buy-info-price',
    driver,
  });
  expect(tokenToBuyInfoPrice).not.toBe('');
  const tokenToBuyInfoBalance = await getTextFromText({
    id: 'token-to-buy-info-balance',
    driver,
  });
  expect(tokenToBuyInfoBalance).not.toBe('');
});

it('should be able to flip correctly', async () => {
  await findElementByTestIdAndDoubleClick({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  if (isFirefox) {
    await delayTime('very-long');
    await clearInput({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
  }
  await typeOnTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    text: 1,
    driver,
  });
  isFirefox && (await delay(5000));

  const assetToSellInputText = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(assetToSellInputText).toBe('1');

  await delayTime('very-long');

  const assetToBuyInputText = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.WBTC_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(assetToBuyInputText).not.toBe('');

  await findElementByTestIdAndClick({
    id: 'swap-flip-button',
    driver,
  });

  await delayTime('very-long');

  const assetToSellInputTextAfterFlip = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.WBTC_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });

  expect(assetToSellInputTextAfterFlip).not.toEqual('');

  const assetToBuyInputTextAfterFlip = await getTextFromTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(assetToBuyInputTextAfterFlip).toEqual('1');
});

it('should be able to check insufficient asset for swap', async () => {
  const confirmButtonText = await getTextFromText({
    id: 'swap-confirmation-button-ready',
    driver,
  });
  expect(confirmButtonText).toEqual('Insufficient WBTC');
});

it('should be able to check insufficient native asset for gas', async () => {
  await findElementByTestIdAndClick({
    id: 'swap-flip-button',
    driver,
  });
  if (isFirefox) {
    await delayTime('very-long');
    await clearInput({
      id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
      driver,
    });
  } else {
    await delayTime('short');
  }
  await typeOnTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    text: `\b10000`,
    driver,
  });
  await delayTime('very-long');
  const confirmButtonText = await getTextFromText({
    id: 'swap-confirmation-button-ready',
    driver,
  });
  expect(confirmButtonText).toEqual('Insufficient ETH for gas');
});

it.skip('should be able to see small market warning', async () => {
  const swapWarning = await findElementByTestId({
    id: 'swap-warning-price-impact',
    driver,
  });
  expect(swapWarning).toBeTruthy();
});

it('should be able to filter assets to buy by network', async () => {
  // OP
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.WBTC_MAINNET_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `switch-network-item-${ChainId.optimism}`,
    driver,
  });
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'op',
  });
  await delayTime('long');
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-favorites-token-to-buy-row`,
    driver,
  });
  // POLYGON
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `switch-network-item-${ChainId.polygon}`,
    driver,
  });
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'matic',
  });
  await delayTime('long');
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.MATIC_POLYGON_ID}-favorites-token-to-buy-row`,
    driver,
  });
  // ARBITRUM
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.MATIC_POLYGON_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `switch-network-item-${ChainId.arbitrum}`,
    driver,
  });
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'gmx',
  });
  await delayTime('long');
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.GMX_ARBITRUM_ID}-verified-token-to-buy-row`,
    driver,
  });
  // BNB
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.GMX_ARBITRUM_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `switch-network-item-${ChainId.bsc}`,
    driver,
  });
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'uni',
  });
  await delayTime('long');
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.UNI_BNB_ID}-verified-token-to-buy-row`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.UNI_BNB_ID}-token-to-buy-token-input-remove`,
    driver,
  });
});

it('should be able to see no route explainer', async () => {
  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `switch-network-item-${ChainId.optimism}`,
    driver,
  });
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'op',
  });
  await delayTime('long');
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-favorites-token-to-buy-row`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'swap-flip-button',
    driver,
  });
  await delayTime('long');
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `switch-network-item-${ChainId.arbitrum}`,
    driver,
  });
  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'gmx',
  });
  await delayTime('long');
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.GMX_ARBITRUM_ID}-verified-token-to-buy-row`,
    driver,
  });
  await typeOnTextInput({
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
    text: 1,
  });
  await delayTime('long');
  const confirmButtonText = await getTextFromText({
    id: 'swap-confirmation-button-error',
    driver,
  });
  expect(confirmButtonText).toEqual('No route found');
  await findElementByTestIdAndClick({
    id: 'swap-confirmation-button-error',
    driver,
  });
  const noRouteExplainer = await findElementByTestId({
    id: 'explainer-sheet-swap-no-route',
    driver,
  });
  expect(noRouteExplainer).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'explainer-action-button',
    driver,
  });
});

it('should be able to find exact match on other networks', async () => {
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-token-to-sell-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `token-to-sell-search-token-input`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-sell-token-input-dropdown-toggle',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.GMX_ARBITRUM_ID}-token-to-buy-token-input-remove`,
    driver,
  });

  await findElementByTestIdAndClick({
    id: 'token-to-buy-networks-trigger',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `switch-network-item-${ChainId.polygon}`,
    driver,
  });

  await typeOnTextInput({
    id: 'token-to-buy-search-token-input',
    driver,
    text: 'optimism',
  });
  await delayTime('long');

  const onOtherNetworksSections = await findElementByTestId({
    id: 'other_networks-token-to-buy-section',
    driver,
  });

  expect(onOtherNetworksSections).toBeTruthy();

  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-other_networks-token-to-buy-row`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.OP_OPTIMISM_ID}-token-to-buy-token-input-remove`,
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'token-to-buy-search-token-input',
    driver,
  });
});

it('should be able to go to review a swap', async () => {
  await findElementByTestIdAndClick({
    id: 'token-to-sell-search-token-input',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-row`,
    driver,
  });
  const toSellInputEthSelected = await findElementByTestId({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toSellInputEthSelected).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'token-to-buy-search-token-input',
    driver,
  });
  await findElementByTestIdAndClick({
    id: `${SWAP_VARIABLES.DAI_MAINNET_ID}-favorites-token-to-buy-row`,
    driver,
  });
  const toBuyInputDaiSelected = await findElementByTestId({
    id: `${SWAP_VARIABLES.DAI_MAINNET_ID}-token-to-buy-swap-token-input-swap-input-mask`,
    driver,
  });
  expect(toBuyInputDaiSelected).toBeTruthy();
  await typeOnTextInput({
    id: `${SWAP_VARIABLES.ETH_MAINNET_ID}-token-to-sell-swap-token-input-swap-input-mask`,
    text: 1,
    driver,
  });
  await delayTime('very-long');
  await findElementByTestIdAndClick({
    id: 'swap-confirmation-button-ready',
    driver,
  });
});

it('should be able to see swap information in review sheet', async () => {
  const ethAssetToSellAssetCard = await findElementByTestId({
    id: `ETH-asset-to-sell-swap-asset-card`,
    driver,
  });
  expect(ethAssetToSellAssetCard).toBeTruthy();
  const daiAssetToBuyAssetCard = await findElementByTestId({
    id: `DAI-asset-to-buy-swap-asset-card`,
    driver,
  });
  expect(daiAssetToBuyAssetCard).toBeTruthy();
  const minimumReceivedDetailsRow = await findElementByTestId({
    id: `minimum-received-details-row`,
    driver,
  });
  expect(minimumReceivedDetailsRow).toBeTruthy();
  const swappingViaDetailsRow = await findElementByTestId({
    id: `swapping-via-details-row`,
    driver,
  });
  expect(swappingViaDetailsRow).toBeTruthy();
  await findElementByTestIdAndClick({ id: 'swapping-via-swap-routes', driver });
  await findElementByTestIdAndClick({ id: 'swapping-via-swap-routes', driver });
  await findElementByTestIdAndClick({ id: 'swapping-via-swap-routes', driver });

  const includedFeeDetailsRow = await findElementByTestId({
    id: `included-fee-details-row`,
    driver,
  });
  expect(includedFeeDetailsRow).toBeTruthy();

  await findElementByTestIdAndClick({
    id: 'included-fee-carrousel-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'included-fee-carrousel-button',
    driver,
  });

  await findElementByTestIdAndClick({
    id: 'swap-review-rnbw-fee-info-button',
    driver,
  });
  await findElementByTestIdAndClick({ id: 'explainer-action-button', driver });

  const moreDetailsHiddendDetailsRow = await findElementByTestId({
    id: `more-details-hidden-details-row`,
    driver,
  });
  expect(moreDetailsHiddendDetailsRow).toBeTruthy();

  await findElementByTestIdAndClick({
    id: 'swap-review-more-details-button',
    driver,
  });

  const moreDetailsdSection = await findElementByTestId({
    id: `more-details-section`,
    driver,
  });
  expect(moreDetailsdSection).toBeTruthy();

  const exchangeRateDetailsRow = await findElementByTestId({
    id: `exchange-rate-details-row`,
    driver,
  });
  expect(exchangeRateDetailsRow).toBeTruthy();

  await findElementByTestIdAndClick({
    id: 'exchange-rate-carrousel-button',
    driver,
  });
  await findElementByTestIdAndClick({
    id: 'exchange-rate-carrousel-button',
    driver,
  });

  // ETH is selected as input so there's no contract
  await doNotFindElementByTestId({
    id: `asset-to-sell-contract-details-row`,
    driver,
  });

  const assetToBuyContractDetailsRow = await findElementByTestId({
    id: `asset-to-buy-contract-details-row`,
    driver,
  });
  expect(assetToBuyContractDetailsRow).toBeTruthy();

  await findElementByTestIdAndClick({
    id: 'asset-to-buy-swap-view-contract-dropdown',
    driver,
  });
  const assetToSellContractDropdiwnView = await findElementByTestId({
    id: 'asset-to-buy-view-swap-view-contract-dropdown',
    driver,
  });
  expect(assetToSellContractDropdiwnView).toBeTruthy();
  await findElementByTestIdAndClick({
    id: 'asset-to-buy-copy-swap-view-contract-dropdown',
    driver,
  });

  const swapReviewConfirmationText = await getTextFromText({
    id: 'swap-review-confirmation-text',
    driver,
  });
  expect(swapReviewConfirmationText).toBe('Swap ETH to DAI');

  const swapReviewTitleText = await getTextFromText({
    id: 'swap-review-title-text',
    driver,
  });
  expect(swapReviewTitleText).toBe('Review & Swap');
});

it('should be able to execute swap', async () => {
  await delayTime('short');

  await findElementByTestIdAndClick({
    id: 'navbar-button-with-back-swap-review',
    driver,
  });
  await delayTime('short');

  await findElementByTestIdAndClick({
    id: 'swap-settings-navbar-button',
    driver,
  });
  await delayTime('short');

  await typeOnTextInput({
    id: 'slippage-input-mask',
    driver,
    text: '\b99',
  });
  await delayTime('medium');

  console.log(provider);

  await findElementByTestIdAndClick({ id: 'swap-settings-done', driver });
  const ethBalanceBeforeSwap = await provider.getBalance(
    TEST_VARIABLES.SEED_WALLET.ADDRESS,
  );
  console.log(`ethBalanceBeforeSwap`, ethBalanceBeforeSwap);

  await delayTime('very-long');
  await findElementByTestIdAndClick({
    id: 'swap-confirmation-button-ready',
    driver,
  });
  await delayTime('medium');
  await findElementByTestIdAndClick({ id: 'swap-review-execute', driver });
  await delayTime('very-long');
  // Adding delay to make sure the provider gets the balance after the swap
  // Because CI is slow so this triggers a race condition most of the time.
  await delay(5000);
  const ethBalanceAfterSwap = await provider.getBalance(
    TEST_VARIABLES.SEED_WALLET.ADDRESS,
  );
  console.log(`ethBalanceAfterSwap`, ethBalanceAfterSwap);

  const balanceDifference = subtract(
    ethBalanceBeforeSwap.toString(),
    ethBalanceAfterSwap.toString(),
  );
  const ethDifferenceAmount = convertRawAmountToDecimalFormat(
    balanceDifference,
    18,
  );

  expect(Number(ethDifferenceAmount)).toBeGreaterThan(1);
});
