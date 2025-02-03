import * as rainbowChains from './rainbowChains.mock';
import * as userChains from './userChains.mock';
import * as userChainOrder from './userChainOrder.mock';

export const Factories = ['DEFAULT_DATA', 'GRANT_DATA', 'MIKE_DATA'] as const;

export const getFactoryData = (factory: (typeof Factories)[number]) => {
  switch (factory) {
    default:
    case 'DEFAULT_DATA':
      return {
        rainbowChains: rainbowChains.DEFAULT_DATA,
        userChains: userChains.DEFAULT_DATA,
        userChainOrder: userChainOrder.DEFAULT_DATA,
      };
    case 'GRANT_DATA':
      return {
        rainbowChains: rainbowChains.GRANT_DATA,
        userChains: userChains.GRANT_DATA,
        userChainOrder: userChainOrder.GRANT_DATA,
      };
    case 'MIKE_DATA':
      return {
        rainbowChains: rainbowChains.MIKE_DATA,
        userChains: userChains.MIKE_DATA,
        userChainOrder: userChainOrder.MIKE_DATA,
      };
  }
};
