import { beforeEach, describe, expect, test } from 'vitest';

import buildTimeNetworks from 'static/data/networks.json';

import { RainbowChainsState, rainbowChainsStore } from '../../rainbowChains';
import { UserChainsState, userChainsStore } from '../../userChains';
import { networkStore } from '../networks';
import { buildInitialUserPreferences, toChainId } from '../utils';

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

      test(`${factory} should have a valid userOverrides entry for pre-existing chains in rainbowChains store`, async () => {
        const { userOverrides } = networkStore.getState();

        for (const chainId in rainbowChains) {
          const chainIdNum = toChainId(chainId);
          const chain = rainbowChains[chainIdNum];
          const userOverride = userOverrides[chainIdNum];

          // userOverride should exist
          expect(userOverride).toBeDefined();

          // preserve activeRpcUrl
          expect(userOverride.activeRpcUrl).toEqual(chain.activeRpcUrl);

          // preserve enabled state
          expect(userOverride.enabled).toEqual(userChains[chainIdNum] ?? false);

          // preserve rpcs
          for (const rpcUrl in userOverride.rpcs) {
            expect(
              chain.chains.some((c) => c.rpcUrls.default.http[0] === rpcUrl),
            ).toBe(true);
          }

          // additional checks for user-added custom networks
          if (userOverride.type === 'custom') {
            const activeChain = chain.chains.find(
              (c) => c.rpcUrls.default.http[0] === userOverride.activeRpcUrl,
            );
            if (!activeChain) {
              throw new Error('Active chain not found');
            }
            expect(userOverride.id).toEqual(chainIdNum);
            expect(userOverride.name).toEqual(activeChain.name);
            expect(userOverride.nativeCurrency.name).toEqual(
              activeChain.nativeCurrency.name,
            );
            expect(userOverride.nativeCurrency.symbol).toEqual(
              activeChain.nativeCurrency.symbol,
            );
            expect(userOverride.nativeCurrency.decimals).toEqual(
              activeChain.nativeCurrency.decimals,
            );
            expect(userOverride.testnet).toEqual(activeChain.testnet);
          }
        }
      });
    });
  });
});
