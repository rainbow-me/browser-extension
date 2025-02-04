import * as rainbowChains from './rainbowChains.mock';
import * as userChains from './userChains.mock';
import * as userChainsOrder from './userChainsOrder.mock';

export const Factories = ['DEFAULT_DATA', 'GRANT_DATA', 'MIKE_DATA'] as const;

export const getFactoryData = (factory: (typeof Factories)[number]) => {
  switch (factory) {
    default:
    case 'DEFAULT_DATA':
      return {
        rainbowChains: rainbowChains.DEFAULT_DATA,
        userChains: userChains.DEFAULT_DATA,
        userChainsOrder: userChainsOrder.DEFAULT_DATA,
      };
    case 'GRANT_DATA':
      return {
        rainbowChains: rainbowChains.GRANT_DATA,
        userChains: userChains.GRANT_DATA,
        userChainsOrder: userChainsOrder.GRANT_DATA,
      };
    case 'MIKE_DATA':
      return {
        rainbowChains: rainbowChains.MIKE_DATA,
        userChains: userChains.MIKE_DATA,
        userChainsOrder: userChainsOrder.MIKE_DATA,
      };
  }
};
