/* eslint-disable no-await-in-loop */
import 'chromedriver';
import 'geckodriver';
import { WebDriver } from 'selenium-webdriver';
import {
  afterAll,
  assert,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { getFactoryData } from '~/core/state/networks/__tests__/data';
import { NetworkState } from '~/core/state/networks/networks';
import { NetworksStoreMigrationState } from '~/core/state/networks/runNetworksMigrationIfNeeded';
import { RainbowChainsState } from '~/core/state/rainbowChains';
import { UserChainsState } from '~/core/state/userChains';

import {
  checkStoreExists,
  clearStorage,
  delayTime,
  getExtensionIdByName,
  getRootUrl,
  getStoreValue,
  goToPopup,
  initDriverWithOptions,
  injectStoreData,
  untilDocumentLoaded,
  verifyNetworkMigration,
} from '../../helpers';

let rootURL = getRootUrl();
let driver: WebDriver;

const browser = process.env.BROWSER || 'chrome';
const os = process.env.OS || 'mac';

describe('Networks migration', () => {
  beforeAll(async () => {
    driver = await initDriverWithOptions({
      browser,
      os,
    });
    const extensionId = await getExtensionIdByName(driver, 'Rainbow');
    if (!extensionId) throw new Error('Extension not found');
    rootURL += extensionId;
  });

  beforeEach<{ driver: WebDriver }>(async (context) => {
    context.driver = driver;
  });

  afterAll(async () => driver.quit());

  it.skip('should initialize networks asynchronously for new users', async () => {
    // Clear all storage data to simulate a new user
    await clearStorage(driver, rootURL);

    const rainbowChainsExists = await checkStoreExists(driver, 'rainbowChains');
    const userChainsExists = await checkStoreExists(driver, 'userChains');

    expect(rainbowChainsExists).toBe(true);
    expect(userChainsExists).toBe(true);

    const rainbowChains = await getStoreValue<RainbowChainsState>(
      driver,
      'rainbowChains',
    );
    const userChains = await getStoreValue<UserChainsState>(
      driver,
      'userChains',
    );

    assert(rainbowChains, 'Rainbow chains store is undefined');
    assert(userChains, 'User chains store is undefined');

    // Verify that the rainbowChains and userChains stores are empty meaning that a new user is initializing the extension
    expect(Object.keys(rainbowChains.state.rainbowChains).length).toBe(0);
    expect(Object.keys(userChains.state.userChains).length).toBe(0);
    expect(userChains.state.userChainsOrder.length).toBe(0);

    // Go to popup to trigger initialization
    await goToPopup(driver, rootURL);
    await delayTime('very-long'); // Give time for initialization

    // Check that networkStore was initialized
    const networkStoreExists = await checkStoreExists(driver, 'networkStore');
    expect(networkStoreExists).toBe(true);

    // Verify the networkStore has been initialized with default values
    const networkStore = await getStoreValue<NetworkState>(
      driver,
      'networkStore',
    );
    assert(networkStore, 'Network store is undefined');

    // Verify that the networks were initialized from buildTimeNetworks
    expect(networkStore.state.networks).toBeTruthy();
    expect(networkStore.state.userPreferences).toBeTruthy();
    expect(networkStore.state.chainOrder).toBeTruthy();
    expect(networkStore.state.enabledChainIds).toBeTruthy();

    // Verify that the migration store has been updated
    const migrationStoreExists = await checkStoreExists(
      driver,
      'networksStoreMigration',
    );
    expect(migrationStoreExists).toBe(true);

    const migrationStore = await getStoreValue<NetworksStoreMigrationState>(
      driver,
      'networksStoreMigration',
    );
    assert(migrationStore, 'Migration store is undefined');
    expect(migrationStore.state.didCompleteNetworksMigration).toBe(true);
  });

  /**
   * Injects mock data into chrome storage, performs the networks migration, and verifies that the migration was successful
   * by comparing the values of the rainbowChains and userChains stores to the new network store values
   */
  it('should migrate networks asynchronously for existing users', async () => {
    await driver.get(rootURL + '/popup.html');
    // Wait for the page to load
    await driver.wait(untilDocumentLoaded(), 20_000);

    // Get mock data for an existing user
    const mockData = getFactoryData('DANIEL_DATA');

    // Inject the networkStoreMigration to be false
    await driver.executeAsyncScript(`
      const callback = arguments[arguments.length - 1];
      chrome.storage.local.set({
        'rainbow.zustand.networksStoreMigration': {
          state: ${JSON.stringify({ didCompleteNetworksMigration: false })},
          version: 0
        }
      }).then(() => {
        callback(null);
      }).catch((error) => {
        callback(error.toString());
      });
    `);

    // Inject the mock data into chrome storage
    await injectStoreData(driver, {
      rainbowChains: mockData.rainbowChains,
      userChains: mockData.userChains,
      userChainsOrder: mockData.userChainsOrder,
    });

    // verify that the networksStoreMigration was injected correctly
    let networksStoreMigration =
      await getStoreValue<NetworksStoreMigrationState>(
        driver,
        'networksStoreMigration',
      );
    assert(networksStoreMigration, 'Networks store migration is undefined');
    expect(networksStoreMigration.state.didCompleteNetworksMigration).toBe(
      false,
    );

    // TODO: Need to somehow trigger a Zustand store rehydration here of the
    // networksStoreMigration, rainbowChains, and userChains stores

    // BELOW THIS FAILS BECAUSE THE STORES ARE NOT REHYDRATED
    // verify that the networksStoreMigration was migrated correctly
    networksStoreMigration = await getStoreValue<NetworksStoreMigrationState>(
      driver,
      'networksStoreMigration',
    );
    assert(networksStoreMigration, 'Networks store migration is undefined');
    expect(networksStoreMigration.state.didCompleteNetworksMigration).toBe(
      true,
    );

    // Verify that rainbowChains and userChains exist
    const rainbowChainsExists = await checkStoreExists(driver, 'rainbowChains');
    const userChainsExists = await checkStoreExists(driver, 'userChains');

    expect(rainbowChainsExists).toBe(true);
    expect(userChainsExists).toBe(true);

    const rainbowChains = await getStoreValue<RainbowChainsState>(
      driver,
      'rainbowChains',
    );
    const userChains = await getStoreValue<UserChainsState>(
      driver,
      'userChains',
    );

    assert(rainbowChains, 'Rainbow chains store is undefined');
    assert(userChains, 'User chains store is undefined');

    // Verify that the rainbowChains and userChains stores are empty meaning that a new user is initializing the extension
    expect(rainbowChains.state.rainbowChains).toEqual(mockData.rainbowChains);
    expect(userChains.state.userChains).toEqual(mockData.userChains);
    expect(userChains.state.userChainsOrder).toEqual(mockData.userChainsOrder);

    // Go to popup to trigger migration
    await goToPopup(driver, rootURL);

    // Check that networkStore was initialized
    const networkStoreExists = await checkStoreExists(driver, 'networkStore');
    expect(networkStoreExists).toBe(true);

    // Verify the migration was successful
    const migrationResult = await verifyNetworkMigration(driver, {
      rainbowChains: mockData.rainbowChains,
      userChains: mockData.userChains,
      userChainsOrder: mockData.userChainsOrder,
    });

    expect(migrationResult.success).toBe(true);
    expect(migrationResult.details.chainsPreserved).toBe(true);
    expect(migrationResult.details.enabledChainIdsPreserved).toBe(true);
    expect(migrationResult.details.orderPreserved).toBe(true);

    // Verify that the migration store has been updated
    const migrationStoreExists = await checkStoreExists(
      driver,
      'networksStoreMigration',
    );
    expect(migrationStoreExists).toBe(true);

    const migrationStore = await getStoreValue<NetworksStoreMigrationState>(
      driver,
      'networksStoreMigration',
    );
    assert(migrationStore, 'Migration store is undefined');
    expect(migrationStore.state.didCompleteNetworksMigration).toBe(true);
  });
});
