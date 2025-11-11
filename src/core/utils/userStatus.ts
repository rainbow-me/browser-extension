import { LocalStorage, SessionStorage } from '~/core/storage';

export type UserStatusResult = 'LOCKED' | 'NEEDS_PASSWORD' | 'NEW' | 'READY';

/**
 * Computes the user authentication status based on storage values.
 * This function works in both background and popup contexts by reading
 * directly from LocalStorage and SessionStorage without calling keychain functions.
 *
 * Storage keys used:
 * - 'vault' (LocalStorage): exists when vault is created and persisted
 *   - Contains salt in JSON structure if password-protected
 * - 'hasKeychains' (SessionStorage): true when keychains exist but no password set
 * - 'salt' (SessionStorage): exists when password is set (cleared on lock)
 * - 'encryptionKey' (SessionStorage): exists when vault is unlocked
 *
 * @returns Promise resolving to the current user status
 */
export const getUserStatus = async (): Promise<UserStatusResult> => {
  const vault = await LocalStorage.get('vault');
  const hasKeychains = await SessionStorage.get('hasKeychains');
  const encryptionKey = await SessionStorage.get('encryptionKey');

  // Check if vault exists (either persisted or in memory)
  const hasVault = (vault && vault !== '') || hasKeychains === true;

  // Check if vault contains salt in its structure (indicates password-protected vault)
  let vaultHasSalt = false;
  if (vault && typeof vault === 'string' && vault !== '') {
    try {
      const vaultObj = JSON.parse(vault) as { salt?: string };
      vaultHasSalt = !!(vaultObj && vaultObj.salt);
    } catch {
      // If parsing fails, assume no salt (shouldn't happen for valid vaults)
      vaultHasSalt = false;
    }
  }

  // No vault exists
  if (!hasVault) {
    return 'NEW';
  }

  // Vault exists - check if it's password-protected by looking at vault structure
  // If vault contains salt, it means password was set (even if salt is cleared from SessionStorage on lock)
  if (vaultHasSalt) {
    // Password-protected vault
    if (!encryptionKey || encryptionKey === '') {
      return 'LOCKED';
    } else {
      return 'READY';
    }
  } else {
    // Vault exists but no password set (no salt in vault structure)
    return 'NEEDS_PASSWORD';
  }
};
