import { createBaseStore } from '@storesjs/stores';
import { Address } from 'viem';

import { KeychainType, type KeychainWallet } from '~/core/types/keychainTypes';

import { createExtensionStoreOptions } from '../_internal';

const normalizeAddress = (address: Address) => address.toLowerCase();

function typesMapFromWallets(
  wallets: KeychainWallet[],
): Record<string, KeychainType> {
  const types: Record<string, KeychainType> = {};
  for (const wallet of wallets) {
    for (const account of wallet.accounts) {
      types[normalizeAddress(account)] = wallet.type;
    }
  }
  return types;
}

/**
 * Persisted address → keychain kind (last sync from keychain).
 * Reads: `getKeychainType` on the store. Writes: `persistWalletKeychainTypesFromWallets` only.
 */
export interface WalletKeychainTypesStore {
  types: Record<string, KeychainType>;
  getKeychainType: (address: Address) => KeychainType | undefined;
}

export const useWalletKeychainTypesStore =
  createBaseStore<WalletKeychainTypesStore>(
    (_set, get) => ({
      types: {},
      getKeychainType: (address) => get().types[normalizeAddress(address)],
    }),
    createExtensionStoreOptions({
      storageKey: 'walletKeychainTypes',
      version: 0,
      area: 'local',
    }),
  );

/**
 * Single write path: rebuild persisted types from `KeychainManager.getWallets()`.
 * Invoked from KeychainManager when vault / keychains change.
 */
export function persistWalletKeychainTypesFromWallets(
  wallets: KeychainWallet[],
): void {
  useWalletKeychainTypesStore.setState({
    types: typesMapFromWallets(wallets),
  });
}
