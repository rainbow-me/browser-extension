import { Address, Chain, WalletClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { keychainManager } from '~/core/keychain/KeychainManager';
import { KeychainType } from '~/core/types/keychainTypes';

import { handleRpcUrl } from './clientRpc';
import { getViemClient } from './clients';

/**
 * Get a viem WalletClient for an address.
 *
 * Returns null for hardware wallets since they cannot export private keys
 * and cannot sign EIP-7702 authorizations.
 *
 * @param address - The wallet address
 * @param chainId - The chain ID for the client
 * @param password - The vault password to export the private key
 * @returns WalletClient or null if unsupported (hardware wallet)
 */
export async function getViemWalletClient({
  address,
  chainId,
}: {
  address: Address;
  chainId: number;
}): Promise<WalletClient | null> {
  // Get wallet info to check keychain type
  const wallet = await keychainManager.getWallet(address);

  // Hardware wallets cannot export private keys and cannot sign EIP-7702 authorizations
  if (wallet.type === KeychainType.HardwareWalletKeychain) {
    return null;
  }

  // Read-only wallets cannot sign transactions
  if (wallet.type === KeychainType.ReadOnlyKeychain) {
    return null;
  }

  // Export private key from keychain
  const keychain = await keychainManager.getKeychain(address);
  const privateKey = await keychain.exportAccount(address);

  // Create viem account from private key
  const account = privateKeyToAccount(privateKey);

  // Get chain config from public client
  const publicClient = getViemClient({ chainId });
  const chain = publicClient.chain as Chain;
  const rpcUrl = handleRpcUrl(chain);

  // Create and return wallet client
  return createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });
}

/**
 * Check if an address can use delegation (i.e., is not a hardware wallet)
 *
 * @param address - The wallet address to check
 * @returns true if the wallet can use delegation
 */
export async function canUseDelegation(address: Address): Promise<boolean> {
  const wallet = await keychainManager.getWallet(address);
  return (
    wallet.type !== KeychainType.HardwareWalletKeychain &&
    wallet.type !== KeychainType.ReadOnlyKeychain
  );
}
