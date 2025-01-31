import { expect, test, describe, beforeEach } from 'vitest';

import { getInitialChainsState, networkStore } from '../networks';
import { networks } from './mocks.data';

describe('networkStore', () => {
  beforeEach(() => {
    networkStore.setState({
      networks,
      chains: getInitialChainsState(),
    });
  })

  test('Initial networks data should be build time data', async () => {
    expect(networkStore.getState().networks).toEqual(networks);
  });

  test('Initial state should keep user data intact', async () => {
    // TODO: Add test
  })
});