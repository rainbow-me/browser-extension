import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import buildTimeNetworks from 'static/data/networks.json';

import { RainbowChainsState, rainbowChainsStore } from '../../rainbowChains';
import { UserChainsState, userChainsStore } from '../../userChains';
import { networkStore } from '../networks';
import { buildInitialUserPreferences } from '../utils';

import { Factories, getFactoryData } from './data';

describe('networkStore', () => {
  Factories.forEach((factory) => {
    let rainbowChains: RainbowChainsState['rainbowChains'];
    let userChainsOrder: UserChainsState['userChainsOrder'];
    let userChains: UserChainsState['userChains'];

    describe('Initial state', () => {
      beforeEach(() => {
        ({ rainbowChains, userChainsOrder, userChains } =
          getFactoryData(factory));

        rainbowChainsStore.setState({
          rainbowChains,
        });
        userChainsStore.setState({
          userChains,
          userChainsOrder,
        });
        networkStore.setState({
          networks: buildTimeNetworks,
          userOverrides: buildInitialUserPreferences(),
        });
      });

      afterEach(() => {
        rainbowChains = {};
        userChainsOrder = [];
        userChains = {};
      });

      test(`${factory} chain order should be kept`, async () => {
        const orderWithDuplicatesRemoved = [...new Set(userChainsOrder)];
        const { userOverrides } = networkStore.getState();

        for (let i = 0; i < orderWithDuplicatesRemoved.length; i++) {
          const chainId = orderWithDuplicatesRemoved[i];
          if (!userOverrides[chainId]) {
            continue;
          }
          if (typeof userOverrides[chainId].order === 'number') {
            expect(userOverrides[chainId].order).toEqual(i);
          }
        }
      });

      test(`${factory} should keep the enabled state of chains`, async () => {
        const { userOverrides } = networkStore.getState();

        for (const chainId in userOverrides) {
          // explicitly if it's true, it's true, otherwise disable it
          const expected = userChains[chainId] ?? false;
          expect(userOverrides[chainId].enabled).toEqual(expected);
        }
      });
    });
  });
});
