import { SessionStorage } from '../storage';
import { KeychainWallet } from '../types/keychainTypes';

export const setSettingWallets = (settingsWallet: null | KeychainWallet) => {
  SessionStorage.set('settingsWallet', settingsWallet);
};

export const getSettingWallets = async (): Promise<KeychainWallet> => {
  const { settingsWallet } = await SessionStorage.get('settingsWallet');
  return settingsWallet;
};
