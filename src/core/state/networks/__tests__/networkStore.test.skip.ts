import { expect, test, describe, beforeEach } from 'vitest';
import buildTimeNetworks from 'static/data/networks.json';

import { networkStore } from '../networks';
import { buildInitialUserPreferences } from '../utils';
import { getFactoryData, Factories } from './__mocks__';

describe('networkStore', () => {
  beforeEach(() => {
    networkStore.setState({
      networks: buildTimeNetworks,
      userOverrides: buildInitialUserPreferences(),
    });
  });

  describe('Initial state', () => {
    Factories.forEach(factory => {
      test(`${factory} chain order should be kept`, async () => {
        const factoryData = getFactoryData(factory);
        const { userOverrides } = networkStore.getState();

        for (let i = 0; i < factoryData.userChainOrder.length; i++) {
          expect(userOverrides[factoryData.userChainOrder[i]]?.order).toEqual(i);
        }
      });
    });
  });
});