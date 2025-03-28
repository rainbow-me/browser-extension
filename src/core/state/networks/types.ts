import { ChainPreferences, Networks } from '~/core/types/chains';

// Network state interface
export interface NetworkState {
  networks: Networks; // contains backend-driven networks and backend-driven custom networks
  userPreferences: Record<number, ChainPreferences>; // contains user-driven overrides for backend-driven networks AND user added custom networks
  chainOrder: Array<number>;
  enabledChainIds: Set<number>;
}

// Migration state type
export type NetworksStoreMigrationState = {
  didCompleteNetworksMigration: boolean;
};
