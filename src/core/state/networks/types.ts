import { ChainPreferences, Networks } from '~/core/types/chains';

export type NetworkUserPreferences = Record<
  number,
  ChainPreferences | undefined
>;

// Network state interface
export interface NetworkState {
  networks: Networks; // contains backend-driven networks and backend-driven custom networks
  userPreferences: NetworkUserPreferences; // contains user-driven overrides for backend-driven networks AND user added custom networks
  chainOrder: Array<number>;
  enabledChainIds: Set<number>;
}

// Migration state type
export type NetworksStoreMigrationState = {
  didCompleteNetworksMigration: boolean;
};
