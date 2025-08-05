import {
  hasVault,
  isInitialized,
  isPasswordSet,
  isVaultUnlocked,
} from '~/core/keychain';

import { popupOs } from '../os';

export const statusHandler = popupOs.wallet.status.handler(async () => {
  const ready = await isInitialized();
  const _hasVault = ready && (await hasVault());
  const unlocked = _hasVault && (await isVaultUnlocked());
  const passwordSet = _hasVault && (await isPasswordSet());
  return {
    hasVault: _hasVault,
    unlocked,
    passwordSet,
    ready,
  };
});
