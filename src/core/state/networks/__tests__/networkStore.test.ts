import { beforeEach, describe, expect, test, vi } from 'vitest';

import buildTimeNetworks from 'static/data/networks.json';
import { fetchNetworks } from '~/core/resources/networks/networks';
import { useFavoritesStore } from '~/core/state/favorites';
import { AddressOrEth } from '~/core/types/assets';

import { RainbowChainsState, useRainbowChainsStore } from '../../rainbowChains';
import { UserChainsState, useUserChainsStore } from '../../userChains';
import { useNetworkStore } from '../networks';
import { buildInitialUserPreferences, toChainId } from '../utils';

import { Factories, getFactoryData } from './data';

// Mock the network fetching
vi.mock('~/core/resources/networks/networks', () => ({
  fetchNetworks: vi.fn(),
}));

describe('useNetworkStore', () => {
  Factories.forEach((factory) => {
    let rainbowChains: RainbowChainsState['rainbowChains'];
    let userChainsOrder: UserChainsState['userChainsOrder'];
    let userChains: UserChainsState['userChains'];

    describe('Initial state', () => {
      beforeEach(() => {
        ({ rainbowChains, userChainsOrder, userChains } =
          getFactoryData(factory));

        useRainbowChainsStore.setState({
          rainbowChains,
        });
        useUserChainsStore.setState({
          userChains,
          userChainsOrder,
        });
        useNetworkStore.setState({
          networks: buildTimeNetworks,
          ...buildInitialUserPreferences(
            buildTimeNetworks,
            rainbowChains,
            userChains,
            userChainsOrder,
          ),
        });
      });

      test(`${factory} chain order should be kept with duplicates removed`, async () => {
        const orderWithDuplicatesRemoved = [...new Set(userChainsOrder)];
        const { chainOrder } = useNetworkStore.getState();

        for (let i = 0; i < orderWithDuplicatesRemoved.length; i++) {
          const chainId = orderWithDuplicatesRemoved[i];
          expect(chainOrder.indexOf(chainId)).toEqual(i);
        }
      });

      test(`${factory} should keep the enabled state of chains`, async () => {
        const { enabledChainIds } = useNetworkStore.getState();

        for (const chainId of enabledChainIds) {
          // explicitly if it's true, it's true, otherwise disable it
          const expected = userChains[chainId];
          if (expected === undefined) continue;
          expect(enabledChainIds.has(chainId)).toEqual(expected);
        }
      });

      test(`${factory} should have a valid userPreferences entry for pre-existing chains in rainbowChains store`, async () => {
        const { userPreferences } = useNetworkStore.getState();

        for (const chainId in rainbowChains) {
          const chainIdNum = toChainId(chainId);
          const chain = rainbowChains[chainIdNum];
          const userOverride = userPreferences[chainIdNum];

          // userOverride should exist
          expect(userOverride).toBeDefined();

          // preserve activeRpcUrl
          expect(userOverride.activeRpcUrl).toEqual(chain.activeRpcUrl);

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

    describe('On new supported network', () => {
      const mockFetchedNetworks = {
        backendNetworks: {
          networks: [
            ...buildTimeNetworks.backendNetworks.networks.slice(0, -1),
          ],
        },
        customNetworks: {
          customNetworks: [],
        },
      };

      const mockNewNetwork =
        buildTimeNetworks.backendNetworks.networks[
          buildTimeNetworks.backendNetworks.networks.length - 1
        ];

      beforeEach(async () => {
        await useNetworkStore.getState().fetch();

        // Mock initial fetch
        vi.mocked(fetchNetworks).mockResolvedValueOnce(mockFetchedNetworks);

        const expected = useNetworkStore
          .getState()
          .networks.backendNetworks.networks.reduce((acc, network) => {
            return {
              ...acc,
              [network.id]: network.favorites.map(
                (f) => f.address as AddressOrEth,
              ),
            };
          }, {});

        useFavoritesStore.setState({
          favorites: expected,
        });
      });

      test('should sync default favorites when new networks are added', async () => {
        // Mock second fetch with new network
        vi.mocked(fetchNetworks).mockResolvedValueOnce({
          ...mockFetchedNetworks,
          backendNetworks: {
            networks: [
              ...mockFetchedNetworks.backendNetworks.networks,
              mockNewNetwork,
            ],
          },
        });

        // Trigger second fetch
        await useNetworkStore.getState().fetch();

        const expected = useNetworkStore
          .getState()
          .networks.backendNetworks.networks.reduce((acc, network) => {
            return {
              ...acc,
              [network.id]: network.favorites.map(
                (f) => f.address as AddressOrEth,
              ),
            };
          }, {});

        // Verify favorites were synced with new network
        expect(useFavoritesStore.getState().favorites).toEqual(expected);
      });

      test('should not duplicate existing favorites when syncing', async () => {
        await useNetworkStore.getState().fetch();

        let expected = useNetworkStore
          .getState()
          .networks.backendNetworks.networks.reduce((acc, network) => {
            return {
              ...acc,
              [network.id]: network.favorites.map(
                (f) => f.address as AddressOrEth,
              ),
            };
          }, {});

        // populate favorites with new network early
        // so we can verify that each address isn't duplicated
        useFavoritesStore.setState({
          favorites: {
            ...expected,
            [mockNewNetwork.id]: mockNewNetwork.favorites.map(
              (f) => f.address as AddressOrEth,
            ),
          },
        });

        // Mock fetch with new network
        vi.mocked(fetchNetworks).mockResolvedValueOnce({
          ...mockFetchedNetworks,
          backendNetworks: {
            networks: [
              ...mockFetchedNetworks.backendNetworks.networks,
              mockNewNetwork,
            ],
          },
        });

        // Trigger fetch
        await useNetworkStore.getState().fetch();

        expected = useNetworkStore
          .getState()
          .networks.backendNetworks.networks.reduce((acc, network) => {
            return {
              ...acc,
              [network.id]: network.favorites.map(
                (f) => f.address as AddressOrEth,
              ),
            };
          }, {});

        // Verify favorites were merged without duplicates
        expect(useFavoritesStore.getState().favorites).toEqual(expected);
      });
    });
  });
});
